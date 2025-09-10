@echo off
echo Building for UAT Environment...
copy .env.uat .env.local
call npm run build
if not exist "dist\uat" mkdir "dist\uat"
xcopy /E /I /Y "out\*" "dist\uat\"
echo UAT build completed in dist\uat folder
pause