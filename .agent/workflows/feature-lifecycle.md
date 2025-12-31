---
description: Execute a change with evidence and verification
---

# /feature-lifecycle

Guidelines for creating new features, migrating data, and verifying changes through evidence.

## 1. /scaffold-feature
1. **Directory**: Create in `src/features/[name]`.
2. **Structure**: `components/`, `hooks/`, `screens/`.
3. **Router**: Update `App.tsx` or `routes.tsx`.
4. **Branding**: Use Oswald headers and Oly Gold accents.

## 2. /change-with-proof
1. **Impact Map**: Search codebase for affected files.
2. **Update Schema**: Reflect changes in `src/types/` and `server/src/seed.ts`.
3. **Verification**: Run `npm run build ; npm run smoke:dev`.
4. **Proof**: Provide build logs and walkthrough with screenshots in artifacts.

## 3. /migrate-mock-to-live
1. Compare `mockData.ts` to Firestore schema.
2. Transition `venueService.ts` from static JSON to Firestore reads.

## 4. /sync-venue-coordinates
1. Identify Source of Truth (Address vs Lat/Lng).
2. Verify sync results in correct persistence AND map marker movement.
3. Reseed if necessary (requires explicit approval).

## 5. /vibe-check-ui
- Ensure high-contrast "shadow-hard" tactile styles and proper branded colors.
- Propose refactors for components that feel too "neon" or inconsistent.
