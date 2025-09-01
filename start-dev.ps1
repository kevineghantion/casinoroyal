# Casino Royal Development Startup Script

Write-Host "Starting Casino Royal Development Environment" -ForegroundColor Green
Write-Host ""

# Casino Royal Development Startup Script

Write-Host "Starting Casino Royal Development Environment" -ForegroundColor Green
Write-Host ""

# Check for package managers
$packageManager = "npm"
if (Get-Command "bun" -ErrorAction SilentlyContinue) {
    $packageManager = "bun"
    Write-Host "Using Bun package manager" -ForegroundColor Cyan
}
else {
    Write-Host "Using npm package manager" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Installing dependencies for main app..." -ForegroundColor Yellow
& $packageManager install

Write-Host ""
Write-Host "Installing dependencies for owner app..." -ForegroundColor Yellow
Set-Location owner
& $packageManager install
Set-Location ..

Write-Host ""
Write-Host "Starting development servers..." -ForegroundColor Green
Write-Host "Main app will run on http://localhost:8080" -ForegroundColor Cyan
Write-Host "Owner app will run on http://localhost:8081" -ForegroundColor Cyan
Write-Host ""

# Start main app in new PowerShell window
Start-Process powershell -ArgumentList "-Command", "& '$packageManager' run dev; Read-Host 'Press Enter to close'"

# Wait a moment then start owner app
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-Command", "Set-Location owner; & '$packageManager' run dev; Read-Host 'Press Enter to close'"

Write-Host "Both applications are starting..." -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
