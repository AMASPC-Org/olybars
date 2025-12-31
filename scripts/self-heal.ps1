# Antigravity Self-Heal Routine
# This script ensures the OlyBars dev environment stays fast by clearing bloat and restarting services.

Write-Host "`n[Antigravity] Initiating Self-Heal Routine..." -ForegroundColor Yellow

# 1. Cleanup Bloat
if (Test-Path ".\scripts\cleanup.ps1") {
    Write-Host "[1/3] Clearing log bloat and temp files..." -ForegroundColor Cyan
    & ".\scripts\cleanup.ps1"
}
else {
    Write-Warning "Cleanup script not found at .\scripts\cleanup.ps1"
}

# 2. Process Hygiene (Clear stuck Node processes)
Write-Host "[2/3] Terminating existing Node processes to clear ports..." -ForegroundColor Cyan
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# 3. Service Recovery
Write-Host "[3/3] Restarting development services..." -ForegroundColor Cyan

# Restart Backend
Write-Host " -> Starting Backend (npm run server)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run server"

# Restart Frontend
Write-Host " -> Starting Frontend (npm run dev)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "`n[Antigravity] Self-Heal Complete. Environment is optimized and services are coming online.`n" -ForegroundColor Yellow
