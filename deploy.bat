@echo off
echo ========================================
echo Exception Management System - IIS Deployment
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as Administrator - OK
) else (
    echo ERROR: This script must be run as Administrator
    echo Right-click on this file and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo Select deployment type:
echo 1. Static Export (Recommended - Faster, no Node.js runtime needed)
echo 2. Node.js with IIS (Server-side rendering, requires iisnode)
echo.
set /p deploytype="Enter your choice (1 or 2): "

if "%deploytype%"=="1" (
    set DEPLOYMENT_TYPE=static
    echo Selected: Static Export
) else if "%deploytype%"=="2" (
    set DEPLOYMENT_TYPE=nodejs
    echo Selected: Node.js with IIS
) else (
    echo Invalid choice. Defaulting to Static Export.
    set DEPLOYMENT_TYPE=static
)

echo.
set /p sitename="Enter site name (default: ExceptionManagement): "
if "%sitename%"=="" set sitename=ExceptionManagement

set /p sitepath="Enter site path (default: C:\inetpub\wwwroot\exception-management): "
if "%sitepath%"=="" set sitepath=C:\inetpub\wwwroot\exception-management

set /p port="Enter port number (default: 80): "
if "%port%"=="" set port=80

set /p avatarurl="Enter avatar URL (optional): "

echo.
echo ========================================
echo Deployment Configuration:
echo ========================================
echo Site Name: %sitename%
echo Site Path: %sitepath%
echo Port: %port%
echo Deployment Type: %DEPLOYMENT_TYPE%
if not "%avatarurl%"=="" echo Avatar URL: %avatarurl%
echo ========================================
echo.

set /p confirm="Proceed with deployment? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo Starting PowerShell deployment script...
echo.

REM Build PowerShell command
set PS_COMMAND=powershell.exe -ExecutionPolicy Bypass -File "deploy-to-iis.ps1" -SiteName "%sitename%" -SitePath "%sitepath%" -Port %port% -DeploymentType "%DEPLOYMENT_TYPE%"

if not "%avatarurl%"=="" (
    set PS_COMMAND=%PS_COMMAND% -AvatarUrl "%avatarurl%"
)

REM Execute PowerShell script
%PS_COMMAND%

if %errorLevel% == 0 (
    echo.
    echo ========================================
    echo Deployment completed successfully!
    echo ========================================
    echo.
    echo Your application is now available at:
    echo http://localhost:%port%
    echo.
    echo Site files are located at:
    echo %sitepath%
    echo.
) else (
    echo.
    echo ========================================
    echo Deployment failed!
    echo ========================================
    echo Please check the error messages above.
    echo.
)

pause