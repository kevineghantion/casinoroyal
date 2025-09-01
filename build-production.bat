@echo off
echo Building Casino Royal for Production...

REM Clean previous builds
if exist dist rmdir /s /q dist
if exist owner\dist rmdir /s /q owner\dist

REM Install dependencies
echo Installing dependencies...
npm ci

REM Build main app
echo Building main application...
npm run build

REM Build owner app
echo Building owner dashboard...
cd owner
npm ci
npm run build
cd ..

REM Copy owner build to main dist
echo Copying owner build...
if not exist dist\owner mkdir dist\owner
xcopy owner\dist\* dist\owner\ /s /e /y

echo Production build complete!
echo Main app: dist/
echo Owner app: dist/owner/
pause