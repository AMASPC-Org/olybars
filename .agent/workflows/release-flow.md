---
description: Mandatory steps for deploying changes to OlyBars environments.
---

# OlyBars Release Flow (DEV → PROD)

## Target Map (source of truth = package.json)
- DEV Hosting: target `dev` → site `olybars-dev` → https://olybars-dev.web.app
- PROD Hosting: target `prod` → site `olybars` → https://olybars.com
- DEV Backend: https://olybars-backend-juthzlaerq-uw.a.run.app
- PROD Backend: https://olybars-backend-26629455103.us-west1.run.app

## 0) Pre-flight
- Confirm branch is correct (usually `main`) and repo is `AMASPC-Org/olybars`.
- Confirm no secrets are being committed (`.env` must not be committed).

## 1) Deploy to DEV (default)
Run:
- `npm run deploy:dev`

Then verify:
- `npm run smoke:dev`
- Open https://olybars-dev.web.app in an incognito window
  - Hard refresh (Ctrl+Shift+R)
  - Confirm no console errors
  - Confirm app loads home and renders venues

## 2) Debug if deploy succeeded but UI didn’t change
Header checks (expect HTML no-cache; assets immutable):
- PowerShell:
  - `Invoke-WebRequest -Uri "https://olybars-dev.web.app" -Method Head -MaximumRedirection 0 -UseBasicParsing | Select-Object -Expand Headers`
  - `Invoke-WebRequest -Uri "https://olybars.com" -Method Head -MaximumRedirection 0 -UseBasicParsing | Select-Object -Expand Headers`

If mismatch persists:
- Confirm the target/site deployed matches intent:
  - `firebase hosting:sites:list`
- Re-run `npm run deploy:dev` after confirming working tree is clean and build artifacts updated.

## 3) PROD approval gate (must be explicit)
STOP unless the user explicitly says: “deploy to prod” / “proceed to production”.

Required before PROD deploy (report results):
- `npm run smoke:dev` passes
- https://olybars-dev.web.app loads without console errors

## 4) Deploy to PROD (only after approval)
Run:
- `npm run deploy:prod`
- `npm run smoke:prod`

Manual verification:
- Open https://olybars.com in an incognito window
  - Hard refresh (Ctrl+Shift+R)
  - Confirm no console errors
  - Confirm app loads home and renders venues

## Safety
- Never change custom domain mappings unless explicitly requested.
- Never change Cloud Run prod traffic split / IAM / env vars unless explicitly approved.
- Never change caching headers globally unless explicitly approved.
