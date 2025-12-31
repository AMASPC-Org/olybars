# OlyBars Lightning Cleanup Script
# This script manually traverses the tree to skip excluded directories at the SOURCE.

$ExcludeDirs = @("node_modules", "dist", ".firebase", ".git", ".gemini", "build", ".genkit")
$IncludePatterns = @("*.bak", "*.log", "emulator_log.txt")

function Clean-Directory($path) {
    $items = Get-ChildItem -Path $path -ErrorAction SilentlyContinue
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            if ($ExcludeDirs -notcontains $item.Name) {
                Clean-Directory $item.FullName
            }
        }
        else {
            foreach ($pattern in $IncludePatterns) {
                if ($item.Name -like $pattern) {
                    Write-Host "Removing: $($item.FullName)" -ForegroundColor Gray
                    Remove-Item $item.FullName -Force
                }
            }
        }
    }
}

Write-Host "Starting lightning cleanup..." -ForegroundColor Cyan
Clean-Directory "."
Write-Host "Cleanup complete." -ForegroundColor Green
