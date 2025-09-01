@echo off
echo Updating vulnerable dependencies...

REM Update main project dependencies
npm update
npm audit fix --force

REM Update owner project dependencies
cd owner
npm update
npm audit fix --force
cd ..

echo Dependencies updated. Please test the application.
pause