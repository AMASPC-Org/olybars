---
trigger: always_on
---

OlyBars Release Guardrails

Default environment is DEV. Only propose PROD actions if the user explicitly says: deploy to prod.

Before suggesting or running any command that changes resources, the agent must state the target:

Firebase project id

Hosting target (dev or prod)

Hosting site (olybars-dev or olybars)

Cloud Run service base URL (and region if known)

Allowed deploy commands:

DEV deploy must be exactly: firebase deploy --only hosting:dev

PROD deploy must be exactly: firebase deploy --only hosting:prod

Never change custom domain mappings (e.g., olybars.com) unless the user explicitly requests it.

PROD gating requirements (must be completed and reported before any prod deploy):

curl https://olybars-backend-26629455103.us-west1.run.app/api/venues returns HTTP 200

olybars-dev.web.app loads home screen without console errors

Cloud Run safety:

Do not change prod traffic splits, revisions, env vars, IAM, or deploy a revision unless the user explicitly approves the exact change.

Secrets policy:

Never request or output secrets.

Never commit .env files. Use .env.example or Secret Manager references.

Caching policy:

Do not change caching headers globally unless explicitly approved.

Routing/cache verification clause:
- If deploy is reported successful but UI does not reflect changes, agent must verify Cache-Control, ETag, and Last-Modified for olybars-dev.web.app and olybars.com, and require an incognito hard-refresh verification.

Backend URL provenance clause:
- Before changing backend URL behavior, agent must identify where the frontend API base URL is defined (env file, config file, build-time var) and cite the exact source.
Self-healing customization rule:
- If the agent detects that required OlyBars customizations are missing or disabled (release-flow workflow and/or this guardrails rule), it must:
  1) State what is missing (name + scope: Workspace vs Global).
  2) Propose the exact patch content (markdown) and the exact file path(s) under `.agent/` to add/update.
  3) Ask for explicit approval before applying any changes.
  4) After approval, provide the exact copy/paste commands to apply the patch.

## Dependency Propagation
- **Mandatory**: Every backend API change must be cross-checked against:
  1. Frontend Interfaces (src/types/)
  2. Data Seed Scripts (server/src/seed.ts)
  3. Documentation (olybars_technical_spec.md)

## Hidden Build Dependencies
- **Warning**: irebase deploy (even for --only hosting) triggers the unctions build hook if specified in irebase.json. 
- **Mandatory**: Always run 
pm run build --prefix functions before attempting any Firebase deployment to ensure no hidden TypeScript errors terminate the process.
- **Mandatory**: If the unctions build fails, the deployment MUST be aborted and the error resolved first.
