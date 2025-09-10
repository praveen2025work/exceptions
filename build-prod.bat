@echo off
echo Building for Production Environment...
copy .env.prod .env.local
call npm run build
if not exist "dist\prod" mkdir "dist\prod"
xcopy /E /I /Y "out\*" "dist\prod\"
echo Production build completed in dist\prod folder
pause