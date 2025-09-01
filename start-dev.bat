@echo off
echo Starting Casino Royal Development Environment
echo.

echo Installing dependencies for main app...
call bun install

echo.
echo Installing dependencies for owner app...
cd owner
call bun install
cd ..

echo.
echo Starting development servers...
echo Main app will run on http://localhost:8080
echo Owner app will run on http://localhost:8081
echo.

start "Main App" powershell -Command "bun run dev"
timeout /t 3 /nobreak >nul
start "Owner App" powershell -Command "cd owner && bun run dev"

echo.
echo Both applications are starting...
echo Close this window when you're done developing.
pause
