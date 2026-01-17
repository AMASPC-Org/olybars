---
trigger: always_on
---

# Deployment & Release Master

This rule governs the release process, environment security, and infrastructure safety.

## 1. Release Gating
- **DEV First**: All changes must be verified on `olybars-dev` before PROD.
- **PROD Requirements**:
    1. `npm run build` passes.
    2. Backend health check returns 200.
    3. User explicitly approves `deploy to prod`.

## 2. Environment Strategy
- **Standard Regions**: All GCP resources MUST be in `us-west1`.
- **Hosting Targets**:
    - DEV: `firebase deploy -P staging --only hosting:dev`
    - PROD: `firebase deploy -P default --only hosting:prod`
- **Database Sync**: Deployments to DEV/PROD should typically include `npm run seed:dev` or `seed:prod` to maintain configuration parity.
- **Cloud Run**: Do not change traffic splits or IAM roles without explicit approval.

## 3. Secret & Backend Hygiene
- **No Secrets**: Never output or hardcode API keys. Use Secret Manager references.
- **API URL**: Identify the source of the `VITE_API_URL` (env, config) before modifying backend behavior. Relative paths (`/api`) are preferred for cross-environment stability.
- **Dependency Check**: Cross-check API changes against `src/types/` and `seed.ts`.

## 4. Atomic Promotion
- **Total Sync**: All deployments to non-local environments MUST promote Frontend, Backend, Functions, and Firestore (Rules/Indexes) simultaneously.
- **Authoritative Command**: Use `npm run deploy:dev` or `npm run deploy:prod` as the single source of truth for full-stack deployment.
- **Environment Isolation**: Always use explicit project flags (`-P staging` or `-P default`) and `cross-env` for environment variables.

## 5. Build Safety
- **Functions Build**: Always run `npm run build --prefix functions` before Firebase deployment to catch TypeScript errors.
- **Halt on Failure**: Abort deployment immediately if ANY build step fails.

## 6. Caching & Verification
- **Verification**: If changes don't reflect, check `Cache-Control`, `ETag`, and require an incognito refresh.
- **Domains**: Never change custom domain mappings unless explicitly requested.

## 7. PROD Protection
- **No Direct Seeding**: Never run `npm run seed:prod` or manual database wipes on production without an explicit, multi-turn confirmation from the user.
