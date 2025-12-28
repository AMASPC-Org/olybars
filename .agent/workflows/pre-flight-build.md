---
description: Mandatory pre-release build check to catch linting and type errors.
---

1. Ensure all files are saved.
// turbo-all
2. Run full stack build check:
   - Functions: `cd functions ; npm run build ; cd ..`
   - Server: `cd server ; npm run build ; cd ..`
   - Frontend: `npm run build`

3. If any step fails:
   - Execute the [.agent/rules/self-healing-and-discovery.md](file:///.agent/rules/self-healing-and-discovery.md) loop.
   - FIx the root cause, then restart this workflow from step 2.

4. Report the final build status (including the 'built in X.Xs' output) before proposing or executing a deploy.
