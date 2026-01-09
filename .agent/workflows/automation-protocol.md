# Automation Protocol

To automate the maintenance of OlyBars.com, I follow these rules:

1. **Auto-Seed**: Whenever `venues_master.json` is modified, I MUST immediately run the local seed: `node --import tsx server/src/seed.ts`.
2. **Auto-Align**: After seeding, I MUST check if coordinates need alignment with Google Places via `/master-sync`.
3. **Auto-Verify**: After any logic change, I MUST run `npm run build` to ensure no environment drift.
4. **Auto-Prompt**: Once verified locally, I MUST proactively ask to deploy to `olybars-dev`.

This ensures the user never has to manually run the sync/deploy commands for routine updates.
