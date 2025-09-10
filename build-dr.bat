@echo off
echo Building for Disaster Recovery Environment...
copy .env.dr .env.local
call npm run build
if not exist "dist\dr" mkdir "dist\dr"
xcopy /E /I /Y "out\*" "dist\dr\"
echo DR build completed in dist\dr folder
pause