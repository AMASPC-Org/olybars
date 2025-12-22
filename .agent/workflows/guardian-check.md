---
description: Mandatory pre-flight check to verify LCB compliance before any code changes.
---

# /guardian-check

This workflow acts as a mandatory **Pre-Flight Check** for all agent actions.

## Instructions

1.  **Mandatory Execution**: Before finalizing any Implementation Plan, Code Diff, or Pull Request, the agent **MUST** automatically execute the logic defined in [/verify-lcb](file:///.agent/workflows/verify-lcb-compliance.md).
2.  **Scope**: This check is mandatory for all changes touching files in `src/features/` or `server/`.
3.  **Halt on Violation**:
    - If `/verify-lcb` reports any violations of **Rule 3** (LCB Check-ins) or the **Happy Hour** sorting logic, the agent **MUST** halt execution immediately.
    - The violations must be presented as a explicit **"Blocker"** in the Plan Artifact or Code Review.
    - Code cannot be implemented or modified until the violation is resolved in the proposed fix.
4.  **Verification**: After a fix is applied, rerun this guardian check to confirm the violation is cleared.
