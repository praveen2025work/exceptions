# IIS Deployment Guide for Exception Hub

This guide provides step-by-step instructions for deploying the Exception Hub on Windows Server IIS.

## Quick Start

### Option 1: Automated Deployment (Recommended)

1. **Download the project files** to your Windows Server
2. **Right-click on `deploy.bat`** and select **"Run as administrator"**
3. **Follow the prompts** to configure your deployment
4. **Access your application** at the provided URL

### Option 2: Manual Deployment

Follow the detailed steps below for manual deployment.

---

## Prerequisites

### System Requirements

- **Windows Server 2016** or later (Windows 10/11 also supported)
- **IIS 8.5** or later
- **Node.js 18** or later
- **Administrator privileges**

### Required Downloads

1. **Node.js**: Download from [https://nodejs.org/](https://nodejs.org/)
2. **IIS URL Rewrite Module**: Download from [https://www.iis.net/downloads/microsoft/url-rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
3. **IISNode** (for Node.js deployment): Download from [https://github.com/Azure/iisnode](https://github.com/Azure/iisnode)

---

## Deployment Methods

### Method 1: Static Export (Recommended)

**Pros:**
- Faster loading times
- No Node.js runtime required on server
- Easier to maintain and troubleshoot
- Better security (no server-side code execution)

**Cons:**
- No server-side rendering
- Limited dynamic functionality

### Method 2: Node.js with IIS

**Pros:**
- Full Next.js functionality
- Server-side rendering
- API routes support
- Dynamic content generation

**Cons:**
- Requires Node.js runtime on server
- More complex setup and maintenance
- Higher resource usage

---

## Step-by-Step Manual Deployment

### Step 1: Install Prerequisites

#### 1.1 Install IIS Features

Open **PowerShell as Administrator** and run:

```powershell
# Core IIS features
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer
Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging
Enable-WindowsOptionalFeature -Online -FeatureName IIS-RequestFiltering
Enable-WindowsOptionalFeature -Online -FeatureName IIS-StaticContent
Enable-WindowsOptionalFeature -Online -FeatureName IIS-DefaultDocument

# Performance features
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpCompressionStatic
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpCompressionDynamic

# For Node.js deployment (optional)
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ASPNET45
Enable-WindowsOptionalFeature -Online -FeatureName IIS-NetFxExtensibility45
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ISAPIExtensions
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ISAPIFilter
```

#### 1.2 Install Node.js

1. Download Node.js LTS from [https://nodejs.org/](https://nodejs.org/)
2. Run the installer with default settings
3. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

#### 1.3 Install URL Rewrite Module

1. Download from [https://www.iis.net/downloads/microsoft/url-rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
2. Run the installer
3. Restart IIS: `iisreset`

#### 1.4 Install IISNode (Node.js deployment only)

1. Download from [https://github.com/Azure/iisnode](https://github.com/Azure/iisnode)
2. Choose the correct version (x64/x86)
3. Run the installer
4. Restart IIS: `iisreset`

### Step 2: Prepare the Application

#### 2.1 Clone and Build

```bash
# Clone the repository
git clone [your-repository-url]
cd exception-hub

# Install dependencies
npm install
```

#### 2.2 Configure for Static Export (Method 1)

Edit `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['assets.co.dev'],
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/exception-hub' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/exception-hub' : '',
};

export default nextConfig;
```

Build the application:

```bash
npm run build
```

#### 2.3 Configure for Node.js (Method 2)

Keep the original `next.config.mjs` and build:

```bash
npm run build
```

### Step 3: Deploy to IIS

#### 3.1 Create IIS Site

1. **Open IIS Manager**
2. **Right-click "Sites"** → **"Add Website"**
3. **Configure:**
   - Site name: `ExceptionHub`
   - Physical path: `C:\inetpub\wwwroot\exception-hub`
   - Port: `80` (or your preferred port)
4. **Click OK**

#### 3.2 Create Application Pool

1. **Right-click "Application Pools"** → **"Add Application Pool"**
2. **Configure:**
   - Name: `ExceptionHub`
   - .NET CLR version: `No Managed Code`
   - Managed pipeline mode: `Integrated`
3. **Advanced Settings:**
   - Identity: `ApplicationPoolIdentity`
   - Idle Time-out: `0` (disable timeout)

#### 3.3 Deploy Files

**For Static Export:**

1. Copy contents of `out` folder to `C:\inetpub\wwwroot\exception-hub\`
2. Copy `web.config` to the same directory

**For Node.js:**

1. Copy entire project (excluding `node_modules`, `.git`) to `C:\inetpub\wwwroot\exception-hub\`
2. Copy `web-iisnode.config` as `web.config` to the deployment directory
3. Copy `server.js` to the deployment directory
4. Run `npm install --production` in the deployment directory

### Step 4: Configure Permissions

```cmd
# Grant IIS_IUSRS read access
icacls "C:\inetpub\wwwroot\exception-hub" /grant "IIS_IUSRS:(OI)(CI)RX" /T

# Grant application pool full control
icacls "C:\inetpub\wwwroot\exception-hub" /grant "IIS AppPool\ExceptionHub:(OI)(CI)F" /T
```

### Step 5: Configure Environment Variables

#### Method 1: Via IIS Manager

1. **Select your site** in IIS Manager
2. **Double-click "Configuration Editor"**
3. **Navigate to:** `system.webServer/iisnode`
4. **Add environment variables** in the environmentVariables collection

#### Method 2: Via web.config

Add to your `web.config`:

```xml
<iisnode>
  <environmentVariables>
    <add name="NODE_ENV" value="production" />
    <add name="NEXT_PUBLIC_AVATAR_URL" value="https://your-api-endpoint.com/avatar" />
  </environmentVariables>
</iisnode>
```

### Step 6: Test the Deployment

1. **Start the site** in IIS Manager
2. **Browse to** `http://localhost` (or your configured port)
3. **Verify** all functionality works correctly

---

## SSL/HTTPS Configuration

### Step 1: Obtain SSL Certificate

**Options:**
- Purchase from a Certificate Authority
- Use Let's Encrypt (free)
- Generate self-signed certificate (testing only)

### Step 2: Install Certificate

1. **Open IIS Manager**
2. **Select server** → **Server Certificates**
3. **Import** or **Create** certificate

### Step 3: Configure HTTPS Binding

1. **Right-click your site** → **Edit Bindings**
2. **Add** HTTPS binding (port 443)
3. **Select your SSL certificate**

### Step 4: Force HTTPS Redirect

Add to `web.config`:

```xml
<rule name="Redirect to HTTPS" stopProcessing="true">
  <match url=".*" />
  <conditions>
    <add input="{HTTPS}" pattern="off" ignoreCase="true" />
  </conditions>
  <action type="Redirect" url="https://{HTTP_HOST}/{R:0}" redirectType="Permanent" />
</rule>
```

---

## Performance Optimization

### Enable Compression

Add to `web.config`:

```xml
<system.webServer>
  <httpCompression>
    <dynamicTypes>
      <add mimeType="application/json" enabled="true" />
      <add mimeType="application/javascript" enabled="true" />
    </dynamicTypes>
    <staticTypes>
      <add mimeType="text/css" enabled="true" />
      <add mimeType="application/javascript" enabled="true" />
    </staticTypes>
  </httpCompression>
</system.webServer>
```

### Set Caching Headers

```xml
<location path="static">
  <system.webServer>
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="31536000" />
    </staticContent>
  </system.webServer>
</location>
```

---

## Monitoring and Logging

### IIS Logs

- **Location:** `C:\inetpub\logs\LogFiles\`
- **Format:** W3C Extended Log File Format
- **Fields:** Date, Time, Client IP, Method, URI, Status, etc.

### Node.js Logs (Node.js deployment only)

- **Location:** `[site-path]\logs\`
- **Files:** `*.log` files created by iisnode
- **Content:** Node.js console output and errors

### Windows Event Viewer

- **Application Logs:** Windows Logs → Application
- **System Logs:** Windows Logs → System
- **IIS Logs:** Applications and Services Logs → Microsoft → Windows → IIS

---

## Troubleshooting

### Common Issues

#### 1. 500 Internal Server Error

**Causes:**
- Missing dependencies
- Incorrect file permissions
- Invalid web.config
- Node.js not installed (Node.js deployment)

**Solutions:**
- Check iisnode logs
- Verify file permissions
- Validate web.config syntax
- Ensure Node.js is in PATH

#### 2. Static Files Not Loading

**Causes:**
- Missing URL Rewrite rules
- Incorrect MIME types
- File permission issues

**Solutions:**
- Install URL Rewrite module
- Add MIME type mappings
- Check file permissions

#### 3. Application Won't Start

**Causes:**
- Port conflicts
- Application pool stopped
- Missing certificates (HTTPS)

**Solutions:**
- Check port availability
- Start application pool
- Verify SSL certificate

### Diagnostic Commands

```cmd
# Check IIS status
iisreset /status

# Test URL Rewrite
appcmd list config "Default Web Site" -section:system.webServer/rewrite/rules

# Check application pool status
appcmd list apppool

# View site configuration
appcmd list site "ExceptionHub" /config
```

---

## Security Best Practices

### 1. File Permissions

- **Minimum required permissions** for IIS_IUSRS
- **Separate service account** for application pool
- **Restrict access** to sensitive files

### 2. Network Security

- **Firewall rules** for required ports only
- **IP restrictions** if needed
- **Regular security updates**

### 3. Application Security

- **HTTPS enforcement**
- **Security headers** in web.config
- **Input validation**
- **Regular dependency updates**

### 4. Monitoring

- **Log monitoring** and analysis
- **Performance counters**
- **Security event monitoring**
- **Regular health checks**

---

## Maintenance

### Regular Tasks

1. **Monitor logs** for errors and performance issues
2. **Update dependencies** regularly
3. **Apply Windows updates**
4. **Backup configuration** and data
5. **Test disaster recovery** procedures

### Performance Monitoring

- **CPU and memory usage**
- **Response times**
- **Error rates**
- **Disk space**

### Backup Strategy

- **Application files**
- **Configuration files**
- **SSL certificates**
- **Log files** (if required for compliance)

---

## Support and Resources

### Documentation

- [IIS Documentation](https://docs.microsoft.com/en-us/iis/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [IISNode Documentation](https://github.com/Azure/iisnode)

### Tools

- **IIS Manager** - Web server management
- **Event Viewer** - System and application logs
- **Performance Monitor** - System performance
- **Failed Request Tracing** - Detailed error analysis

### Community

- [IIS Forums](https://forums.iis.net/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/iis)
- [Next.js Community](https://github.com/vercel/next.js/discussions)

---

## Conclusion

This guide provides comprehensive instructions for deploying the Exception Hub on Windows Server IIS. Choose the deployment method that best fits your requirements:

- **Static Export** for simplicity and performance
- **Node.js with IIS** for full functionality

Follow the security best practices and monitoring guidelines to ensure a stable and secure deployment.

For additional support or questions, refer to the documentation links provided or contact your system administrator.