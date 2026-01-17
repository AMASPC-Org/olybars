---
description: Mandatory steps for deploying changes to OlyBars environments. (Automated)
---

# /release-master

The final release pipeline for DEV and PROD environments.

## 1. Pre-Flight Build Check
Before any deploy, ensure the full stack builds correctly.
1. **Functions**: `cd functions ; npm run build ; cd ..`
2. **Server**: `cd server ; npm run build ; cd ..`
3. **Frontend**: `npm run build`
4. **Halt on Failure**: Trigger the "Self-Healing Loop" if build fails.

## 2. Deploy & Sync Data to DEV (Target: olybars-dev)
1. **Command**: `npm run deploy:dev` (Total Stack Sync: Backend, Functions, Rules, Frontend, Data).
2. **Verification**: `npm run smoke:dev`
3. **Cache Check**: Confirm no console errors on `olybars-dev.web.app`.

## 3. PROD Approval Gate
**STOP**: Propose PROD only after explicit user approval.
- Results of `smoke:dev` must be reported.
- Environment target must be stated clearly: `PROD` (olybars-prod).

## 4. Deploy & Sync Data to PROD (Target: olybars)
1. **Command**: `npm run deploy:prod` (Total Stack Sync: Backend, Functions, Rules, Frontend, Data).
2. **Verification**: `npm run smoke:prod`
3. **Health Check**: Verify the root `/api/health` returns status okay via Hosting Rewrites.

---
> [!CAUTION]
> Never change custom domain mappings or production traffic splits without explicit approval.
