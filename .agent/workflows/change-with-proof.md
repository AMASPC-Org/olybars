---
description: Execute a change with evidence and verification
---

1. Create an Impact Map (Scan codebase for affected files).
// turbo
run_command: grep -r "{{keyword}}" src server functions

2. Update Schema & Types (If applicable).
// turbo
run_command: Update src/types and server/src/seed.ts

3. Implement the change (Frontend/Backend).
// turbo
run_command: write_to_file ...

4. Run verification (Build + Smoke Test).
// turbo
run_command: npm run build ; npm run smoke:dev

5. Audit dependencies & Schema (Cross-stack check).
// turbo
run_command: tech-audit

6. Final report with evidence (Screenshots/Logs).
// turbo
run_command: artifact: walkthrough
