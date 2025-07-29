@echo off
echo ========================================
echo Exception Hub - Simple Static Deployment
echo (Angular-style deployment)
echo ========================================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Building static files...
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorLevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Build the application
echo Building application...
npm run build
if %errorLevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo ✓ Build completed successfully!
echo ✓ Static files created in 'out' folder
echo.

REM Get deployment path
set /p deploypath="Enter IIS deployment path (default: C:\inetpub\wwwroot\exception-hub): "
if "%deploypath%"=="" set deploypath=C:\inetpub\wwwroot\exception-hub

echo.
echo Deployment path: %deploypath%
echo.

set /p confirm="Deploy to IIS? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Deployment cancelled.
    echo.
    echo You can manually copy the 'out' folder contents to your IIS directory.
    pause
    exit /b 0
)

REM Create directory if it doesn't exist
if not exist "%deploypath%" (
    mkdir "%deploypath%"
    echo ✓ Created directory: %deploypath%
)

REM Copy files
echo Copying files to IIS...
xcopy /E /I /Y out\* "%deploypath%\"
if %errorLevel% neq 0 (
    echo ERROR: Failed to copy files
    pause
    exit /b 1
)

REM Copy web.config if it exists
if exist "web.config" (
    copy /Y web.config "%deploypath%\"
    echo ✓ Copied web.config
)

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================
echo.
echo Your Exception Hub is now deployed at:
echo %deploypath%
echo.
echo If you have IIS configured, visit:
echo http://localhost/exception-hub
echo.
echo Files deployed:
dir /b "%deploypath%"
echo.

pause