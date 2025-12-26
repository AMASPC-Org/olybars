# Evidence-Based Delivery (Always On)

## Non-negotiables
- Never claim work is completed unless you can cite *evidence* from this session (command output, file diffs, test output, screenshots, DB query results, or a browser check).
- If you did not run something, say “NOT RUN” and explain what is needed.
- For any task that could affect more than one file/system, you MUST do an “Impact Map” before editing.

## Required response format (every task)
1) Impact Map (where this change must propagate)
2) Plan (checkpoints + what evidence you will produce)
3) Execution Log (commands run + outcomes)
4) Verification (tests, runtime checks, DB queries, UI/browser checks)
5) Status: DONE only if verification passes; otherwise INCOMPLETE + next concrete step

## Impact Map checklist (use as default)
- Code paths (API, UI, background jobs)
- Data model/schema (Firestore docs/fields), seed scripts, migrations
- Admin/Dashboard forms + validation
- Map rendering / geospatial logic
- Docs and runbooks
- Tests (unit + smoke)
- Env/config (dotenv, Firebase/GCP project selection)

## Safety
- Do not run destructive actions (reseed, deletes, rm -rf, dropping DB, etc.) without explicit user approval AND a backup/rollback plan.
