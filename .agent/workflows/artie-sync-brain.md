---
description: Workflow to synchronize codebase lore and rules with Artie's Firestore brain.
---

# Artie Brain Sync Workflow (/artie-sync-brain)

Use this workflow whenever you change `seed.ts` (Venues/Lore) or `playConfig.ts` (League Rules).

## Step 1: Verification
1. Ensure `server/src/seed.ts` is saved.
2. Ensure `src/features/league/config/playConfig.ts` is saved.

## Step 2: Extraction & Sync
// turbo
1. Run the extraction script to push data to Firestore:
   ```powershell
   npm run artie:sync
   ```

## Step 3: Confirmation
1. Verify the sync by running a diagnostic test:
   ```powershell
   npx tsx functions/verify_brain.ts --question "What are the latest league rules?"
   ```

## Step 4: Rule Guardrail
- Add a note to the CHANGELOG: "Artie Brain Synced (Revision [HASH])"
