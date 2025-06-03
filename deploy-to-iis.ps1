# PowerShell script to deploy Exception Management System to IIS
# Run this script as Administrator

param(
    [Parameter(Mandatory=$true)]
    [string]$SiteName = "ExceptionManagement",
    
    [Parameter(Mandatory=$false)]
    [string]$SitePath = "C:\inetpub\wwwroot\exception-management",
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 80,
    
    [Parameter(Mandatory=$false)]
    [string]$DeploymentType = "static", # "static" or "nodejs"
    
    [Parameter(Mandatory=$false)]
    [string]$AvatarUrl = ""
)

Write-Host "Starting IIS deployment for Exception Management System..." -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script must be run as Administrator. Exiting..."
    exit 1
}

# Import WebAdministration module
Import-Module WebAdministration -ErrorAction SilentlyContinue
if (-not (Get-Module WebAdministration)) {
    Write-Error "WebAdministration module not available. Please install IIS Management Tools."
    exit 1
}

# Function to install IIS features
function Install-IISFeatures {
    Write-Host "Installing required IIS features..." -ForegroundColor Yellow
    
    $features = @(
        "IIS-WebServerRole",
        "IIS-WebServer",
        "IIS-CommonHttpFeatures",
        "IIS-HttpErrors",
        "IIS-HttpLogging",
        "IIS-RequestFiltering",
        "IIS-StaticContent",
        "IIS-DefaultDocument",
        "IIS-DirectoryBrowsing",
        "IIS-ASPNET45",
        "IIS-NetFxExtensibility45",
        "IIS-ISAPIExtensions",
        "IIS-ISAPIFilter",
        "IIS-HttpCompressionStatic",
        "IIS-HttpCompressionDynamic"
    )
    
    foreach ($feature in $features) {
        try {
            Enable-WindowsOptionalFeature -Online -FeatureName $feature -All -NoRestart
            Write-Host "✓ Installed $feature" -ForegroundColor Green
        }
        catch {
            Write-Warning "Failed to install $feature : $_"
        }
    }
}

# Function to check Node.js installation
function Test-NodeJS {
    try {
        $nodeVersion = node --version
        Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Error "Node.js is not installed or not in PATH. Please install Node.js from https://nodejs.org/"
        return $false
    }
}

# Function to build the application
function Build-Application {
    param([string]$Type)
    
    Write-Host "Building application for $Type deployment..." -ForegroundColor Yellow
    
    if ($Type -eq "static") {
        # Modify next.config.mjs for static export
        $configContent = @"
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['assets.co.dev'],
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/exception-management' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/exception-management' : '',
};

export default nextConfig;
"@
        Set-Content -Path "next.config.mjs" -Value $configContent
        Write-Host "✓ Updated next.config.mjs for static export" -ForegroundColor Green
    }
    
    # Install dependencies and build
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
    
    Write-Host "Building application..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build application"
        exit 1
    }
    
    Write-Host "✓ Application built successfully" -ForegroundColor Green
}

# Function to create IIS site
function New-IISSite {
    param(
        [string]$Name,
        [string]$Path,
        [int]$PortNumber
    )
    
    Write-Host "Creating IIS site: $Name" -ForegroundColor Yellow
    
    # Remove existing site if it exists
    if (Get-Website -Name $Name -ErrorAction SilentlyContinue) {
        Remove-Website -Name $Name
        Write-Host "✓ Removed existing site: $Name" -ForegroundColor Green
    }
    
    # Remove existing application pool if it exists
    if (Get-IISAppPool -Name $Name -ErrorAction SilentlyContinue) {
        Remove-WebAppPool -Name $Name
        Write-Host "✓ Removed existing application pool: $Name" -ForegroundColor Green
    }
    
    # Create application pool
    New-WebAppPool -Name $Name -Force
    Set-ItemProperty -Path "IIS:\AppPools\$Name" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
    Set-ItemProperty -Path "IIS:\AppPools\$Name" -Name "recycling.periodicRestart.time" -Value "00:00:00"
    Write-Host "✓ Created application pool: $Name" -ForegroundColor Green
    
    # Create website
    New-Website -Name $Name -Port $PortNumber -PhysicalPath $Path -ApplicationPool $Name
    Write-Host "✓ Created website: $Name on port $PortNumber" -ForegroundColor Green
}

# Function to deploy files
function Deploy-Files {
    param(
        [string]$Type,
        [string]$TargetPath
    )
    
    Write-Host "Deploying files to $TargetPath..." -ForegroundColor Yellow
    
    # Create target directory
    if (-not (Test-Path $TargetPath)) {
        New-Item -ItemType Directory -Path $TargetPath -Force
        Write-Host "✓ Created directory: $TargetPath" -ForegroundColor Green
    }
    
    if ($Type -eq "static") {
        # Copy static export files
        if (Test-Path "out") {
            Copy-Item -Path "out\*" -Destination $TargetPath -Recurse -Force
            Write-Host "✓ Copied static files from 'out' folder" -ForegroundColor Green
        } else {
            Write-Error "Static export 'out' folder not found. Make sure the build completed successfully."
            exit 1
        }
        
        # Copy web.config for static deployment
        Copy-Item -Path "web.config" -Destination $TargetPath -Force
        Write-Host "✓ Copied web.config for static deployment" -ForegroundColor Green
        
    } else {
        # Copy all files for Node.js deployment
        $excludeItems = @("node_modules", ".git", ".next", "out", "logs")
        Get-ChildItem -Path "." | Where-Object { $_.Name -notin $excludeItems } | Copy-Item -Destination $TargetPath -Recurse -Force
        
        # Copy .next folder
        if (Test-Path ".next") {
            Copy-Item -Path ".next" -Destination $TargetPath -Recurse -Force
            Write-Host "✓ Copied .next build folder" -ForegroundColor Green
        }
        
        # Copy web.config for Node.js deployment
        Copy-Item -Path "web-iisnode.config" -Destination "$TargetPath\web.config" -Force
        Write-Host "✓ Copied web.config for Node.js deployment" -ForegroundColor Green
        
        # Install production dependencies on target
        Push-Location $TargetPath
        npm install --production
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install production dependencies"
            Pop-Location
            exit 1
        }
        Pop-Location
        Write-Host "✓ Installed production dependencies" -ForegroundColor Green
    }
}

# Function to set environment variables
function Set-EnvironmentVariables {
    param(
        [string]$SiteName,
        [string]$AvatarUrl
    )
    
    if ($AvatarUrl) {
        Write-Host "Setting environment variables..." -ForegroundColor Yellow
        
        # Set environment variable in web.config
        $webConfigPath = "$SitePath\web.config"
        if (Test-Path $webConfigPath) {
            [xml]$webConfig = Get-Content $webConfigPath
            
            # Find or create environmentVariables section
            $iisnode = $webConfig.configuration.'system.webServer'.iisnode
            if ($iisnode) {
                $envVars = $iisnode.environmentVariables
                if (-not $envVars) {
                    $envVars = $webConfig.CreateElement("environmentVariables")
                    $iisnode.AppendChild($envVars)
                }
                
                # Add or update NEXT_PUBLIC_AVATAR_URL
                $avatarVar = $envVars.add | Where-Object { $_.name -eq "NEXT_PUBLIC_AVATAR_URL" }
                if ($avatarVar) {
                    $avatarVar.value = $AvatarUrl
                } else {
                    $newVar = $webConfig.CreateElement("add")
                    $newVar.SetAttribute("name", "NEXT_PUBLIC_AVATAR_URL")
                    $newVar.SetAttribute("value", $AvatarUrl)
                    $envVars.AppendChild($newVar)
                }
                
                $webConfig.Save($webConfigPath)
                Write-Host "✓ Set NEXT_PUBLIC_AVATAR_URL environment variable" -ForegroundColor Green
            }
        }
    }
}

# Function to set permissions
function Set-Permissions {
    param([string]$Path)
    
    Write-Host "Setting file permissions..." -ForegroundColor Yellow
    
    # Grant IIS_IUSRS read and execute permissions
    icacls $Path /grant "IIS_IUSRS:(OI)(CI)RX" /T
    
    # Grant application pool identity full control
    icacls $Path /grant "IIS AppPool\$SiteName:(OI)(CI)F" /T
    
    # Create logs directory if using Node.js
    if ($DeploymentType -eq "nodejs") {
        $logsPath = "$Path\logs"
        if (-not (Test-Path $logsPath)) {
            New-Item -ItemType Directory -Path $logsPath -Force
        }
        icacls $logsPath /grant "IIS AppPool\$SiteName:(OI)(CI)F" /T
    }
    
    Write-Host "✓ Set file permissions" -ForegroundColor Green
}

# Main deployment process
try {
    Write-Host "=== Exception Management System IIS Deployment ===" -ForegroundColor Cyan
    Write-Host "Site Name: $SiteName" -ForegroundColor White
    Write-Host "Site Path: $SitePath" -ForegroundColor White
    Write-Host "Port: $Port" -ForegroundColor White
    Write-Host "Deployment Type: $DeploymentType" -ForegroundColor White
    Write-Host ""
    
    # Step 1: Install IIS features
    Install-IISFeatures
    
    # Step 2: Check Node.js (required for both deployment types)
    if (-not (Test-NodeJS)) {
        exit 1
    }
    
    # Step 3: Build application
    Build-Application -Type $DeploymentType
    
    # Step 4: Create IIS site
    New-IISSite -Name $SiteName -Path $SitePath -PortNumber $Port
    
    # Step 5: Deploy files
    Deploy-Files -Type $DeploymentType -TargetPath $SitePath
    
    # Step 6: Set environment variables
    if ($AvatarUrl) {
        Set-EnvironmentVariables -SiteName $SiteName -AvatarUrl $AvatarUrl
    }
    
    # Step 7: Set permissions
    Set-Permissions -Path $SitePath
    
    # Step 8: Start the site
    Start-Website -Name $SiteName
    Start-WebAppPool -Name $SiteName
    
    Write-Host ""
    Write-Host "=== Deployment Completed Successfully! ===" -ForegroundColor Green
    Write-Host "Site URL: http://localhost:$Port" -ForegroundColor Cyan
    Write-Host "Site Path: $SitePath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Test the application by visiting the URL above" -ForegroundColor White
    Write-Host "2. Configure SSL certificate if needed" -ForegroundColor White
    Write-Host "3. Set up monitoring and logging" -ForegroundColor White
    Write-Host "4. Configure firewall rules for external access" -ForegroundColor White
    
    if ($DeploymentType -eq "nodejs") {
        Write-Host "5. Monitor Node.js logs in: $SitePath\logs" -ForegroundColor White
    }
    
} catch {
    Write-Error "Deployment failed: $_"
    exit 1
}