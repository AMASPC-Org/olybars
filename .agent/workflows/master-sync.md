---
description: Synchronizes Coordinates -> JSON -> Firestore -> UI across all selected environments.
---

# /master-sync

Use this workflow when you have updated `venues_master.json` or want to ensure all environment databases are perfectly aligned with the master definition.

## 1. Coordinate Alignment (The "Holy Trinity")
Align the master JSON with official Google Places data to ensure precise pinning.
// turbo
1. **Command**: `npx tsx server/src/scripts/align-venue-locations.ts`

## 2. Sync Local Stack
Update the local emulator to reflect the latest changes.
// turbo
1. **Command**: `node --import tsx server/src/seed.ts` (Ensure emulator is running via `npm run dev:all`).

## 3. Sync Remote (Optional)
If you are ready to push these data changes to the cloud:

### To Sync DEV:
// turbo
1. **Command**: `npm run seed:dev`

### To Sync PROD:
**STOP**: Require user approval before seeding production.
// turbo
1. **Command**: `npm run seed:prod`

## 4. Cache Purge
After syncing data, users may need to hard-refresh the app to see the updated markers/details due to API caching (default 30s).
