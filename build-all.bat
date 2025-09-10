@echo off
echo Building for All Environments...
echo.

echo [1/4] Building Development Environment...
copy .env.dev .env.local
call npm run build
if not exist "dist\dev" mkdir "dist\dev"
xcopy /E /I /Y "out\*" "dist\dev\"
echo Development build completed.
echo.

echo [2/4] Building UAT Environment...
copy .env.uat .env.local
call npm run build
if not exist "dist\uat" mkdir "dist\uat"
xcopy /E /I /Y "out\*" "dist\uat\"
echo UAT build completed.
echo.

echo [3/4] Building Production Environment...
copy .env.prod .env.local
call npm run build
if not exist "dist\prod" mkdir "dist\prod"
xcopy /E /I /Y "out\*" "dist\prod\"
echo Production build completed.
echo.

echo [4/4] Building Disaster Recovery Environment...
copy .env.dr .env.local
call npm run build
if not exist "dist\dr" mkdir "dist\dr"
xcopy /E /I /Y "out\*" "dist\dr\"
echo DR build completed.
echo.

echo All environment builds completed successfully!
echo Builds are available in:
echo - dist\dev (Development)
echo - dist\uat (UAT)
echo - dist\prod (Production)
echo - dist\dr (Disaster Recovery)
pause