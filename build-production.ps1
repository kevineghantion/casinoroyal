# Production Build Script for Casino Royal

Write-Host "Building Casino Royal for Production" -ForegroundColor Green
Write-Host ""

# Create production output directory
$outputDir = "production-build"
if (Test-Path $outputDir) {
    Remove-Item -Recurse -Force $outputDir
}
New-Item -ItemType Directory -Path $outputDir

Write-Host "Building main application..." -ForegroundColor Yellow
bun run build

if (Test-Path "dist") {
    Copy-Item -Recurse -Path "dist\*" -Destination $outputDir
    Write-Host "Main app built successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to build main app" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Building owner application..." -ForegroundColor Yellow
Set-Location owner
bun run build

if (Test-Path "dist") {
    $ownerOutputDir = "..\$outputDir\owner"
    New-Item -ItemType Directory -Path $ownerOutputDir -Force
    Copy-Item -Recurse -Path "dist\*" -Destination $ownerOutputDir
    Write-Host "Owner app built successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to build owner app" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "Production build completed!" -ForegroundColor Green
Write-Host "Output directory: $outputDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "To deploy:" -ForegroundColor Yellow
Write-Host "1. Upload the contents of '$outputDir' to your web server" -ForegroundColor White
Write-Host "2. Configure your server to serve static files" -ForegroundColor White
Write-Host "3. Set up proper routing for SPA (Single Page Application)" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
