---
description: How to resolve "EADDRINUSE: 3001" and other port-related service startup blockers.
---

# Service & Port Cleanup Workflow (Windows)

When multiple `npm run server` or `npm run dev` instances are left running, they may block the port needed for the new session.

## 1. Identify Blocking Process (Port 3001)
Run in PowerShell:
```powershell
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object OwningProcess
```

## 2. Terminate the Process
If a process ID (PID) is returned:
```powershell
Stop-Process -Id <PID> -Force
```

## 3. Bulk Node Cleanup
If multiple orphaned node processes are detected:
```powershell
Get-Process | Where-Object { $_.Name -eq "node" } | Stop-Process -Force
```

## 4. Verify Port is Free
Confirm the command from step 1 returns no results before restarting the service.
