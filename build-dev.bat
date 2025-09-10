@echo off
echo Building for Development Environment...
copy .env.dev .env.local
call npm run build
if not exist "dist\dev" mkdir "dist\dev"
xcopy /E /I /Y "out\*" "dist\dev\"
echo Development build completed in dist\dev folder
pause