# Simple Development Startup Script (NPM only)

Write-Host "Starting Casino Royal Development Environment" -ForegroundColor Green
Write-Host "Using npm package manager" -ForegroundColor Cyan
Write-Host ""

Write-Host "Installing dependencies for main app..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install main app dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies for owner app..." -ForegroundColor Yellow
Set-Location owner
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install owner app dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "Starting development servers..." -ForegroundColor Green
Write-Host "Main app will run on http://localhost:8080" -ForegroundColor Cyan
Write-Host "Owner app will run on http://localhost:8081" -ForegroundColor Cyan
Write-Host ""

# Start main app in new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# Wait a moment then start owner app
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location owner; npm run dev"

Write-Host "Both applications are starting..." -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
