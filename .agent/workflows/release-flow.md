---
description: Mandatory steps for deploying changes to OlyBars environments.
---

# Agent Release Flow Protocol

This workflow MUST be followed for all code and infrastructure changes to prevent service outages and environment mismatches.

## 1. Dev-First Implementation
All UI, backend, or configuration changes must be deployed to the **Development** target first.
// turbo
- Run: `npm run deploy:dev`
- This command automatically builds in development mode and verifies the build integrity.

## 2. Verification Gate
Before proceeding to production, verify the staging environment:
- Run: `npm run smoke:dev`
- Use the browser tool to confirm the UI loads without console errors on `https://olybars-dev.web.app`.

## 3. Production Approval
- **NEVER** deploy to production (`deploy:prod`) unless the user explicitly grants permission (e.g., "Proceed to production" or "Deploy to prod").
- If the user has not explicitly requested a production deploy in the current turn, stop after verifying dev.

## 4. Production Deployment
Once approved:
// turbo
- Run: `npm run deploy:prod`
- Run: `npm run smoke:prod` to confirm live site health.

## Safety Rules
- **No Global Redirects**: Never change domain mappings or apex domain configurations unless specifically asked.
- **Cache Integrity**: Do not change global caching headers independently. Hashed assets should be cached; `index.html` should be `no-cache`.
- **Environment checks**: The `deploy:*` scripts include a `check-env.js` guard that will block the deployment if a cross-environment URL mismatch is detected.
