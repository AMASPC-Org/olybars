---
description: Mandatory steps for deploying changes to OlyBars environments.
---

# OlyBars Release Flow (DEV  PROD)

## Target Map (source of truth = package.json)
- DEV Hosting: target dev  site olybars-dev  https://olybars-dev.web.app
- PROD Hosting: target prod  site olybars  https://olybars.com
- DEV Backend: https://olybars-backend-juthzlaerq-uw.a.run.app
- PROD Backend: https://olybars-backend-26629455103.us-west1.run.app

## 0) Pre-flight
- Confirm you are on the correct branch (main) and repo (AMASPC-Org/olybars).
- Confirm no secrets are being committed (.env must not be committed).

## 1) Deploy to DEV (default)
Run:
- 
pm run deploy:dev

Then verify:
- 
pm run smoke:dev
- Open https://olybars-dev.web.app in an incognito window
  - Hard refresh (Ctrl+Shift+R)
  - Confirm no console errors
  - Confirm app can load home and render venues

## 2) Debug if deploy succeeded but UI didnt change
Run header checks (expect index.html = no-cache; assets = immutable):
- PowerShell:
  - Invoke-WebRequest -Uri "https://olybars-dev.web.app" -Method Head -MaximumRedirection 0 -UseBasicParsing | Select-Object -Expand Headers
  - Invoke-WebRequest -Uri "https://olybars.com" -Method Head -MaximumRedirection 0 -UseBasicParsing | Select-Object -Expand Headers

If mismatch persists:
- Verify the deployed release is correct (Firebase console or irebase hosting:sites:list + target)
- Re-run 
pm run deploy:dev after confirming working tree is clean and build artifacts updated

## 3) PROD approval gate (must be explicit)
STOP unless user explicitly says: deploy to prod / proceed to production.

Required before PROD deploy (report results):
- 
pm run smoke:dev passes
- https://olybars-dev.web.app loads without console errors

## 4) Deploy to PROD (only after approval)
Run:
- 
pm run deploy:prod
- 
pm run smoke:prod

Manual verification:
- Open https://olybars.com in an incognito window
  - Hard refresh (Ctrl+Shift+R)
  - Confirm no console errors
  - Confirm app loads home and venues

## Safety
- Never change custom domain mappings unless explicitly requested.
- Never change Cloud Run prod traffic split / IAM / env vars unless explicitly approved.
- Never change caching headers globally unless explicitly approved.
