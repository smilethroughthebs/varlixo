# Varlixo Startup Script
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "   VARLIXO - Starting Servers" -ForegroundColor Cyan  
Write-Host "=====================================`n" -ForegroundColor Cyan

# Kill any existing node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force 2>$null

# Set frontend environment
Set-Content -Path "frontend\.env.local" -Value "NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1"

Write-Host "[1/2] Starting Backend on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run start:dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting Frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev" -WindowStyle Normal

Write-Host "`n=====================================" -ForegroundColor Green
Write-Host "   SERVERS STARTING!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "`nWait 30 seconds, then open:" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Admin:    http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "`nAdmin Login:" -ForegroundColor White
Write-Host "  Email:    admin@varlixo.com" -ForegroundColor Yellow
Write-Host "  Password: admin123" -ForegroundColor Yellow
Write-Host ""




