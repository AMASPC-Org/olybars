---
description: Audit the codebase for WA State LCB compliance (Check-in limits and Happy Hour sorting).
---

# /verify-lcb

Perform a legal compliance audit of the OlyBars application logic against the WA State LCB mandates defined in the project constitution.

## Instructions

1.  **Check-in Logic Audit**: 
    - Scan all files in `src/features/` and `server/src/` for logic related to user check-ins, timestamps, or session persistence.
    - **Rule Check**: Audit this logic against Rule 3: Strictly enforce a maximum of 2 check-ins per 12-hour window per user.
    - Identify any gaps where the check-in count or time-window enforcement is absent or incorrectly implemented.

2.  **Happy Hour Sorting Audit**:
    - Locate sorting logic for "Happy Hour" deals or venue promotions.
    - **Rule Check**: Verify that logic correctly prioritizes deals by `TimeRemaining`.
    - **Priority Rule**: Ensure deals with >4 hours remaining are pushed to the bottom of the list.

3.  **Compliance Report**:
    - Output a structured report identifying any functions, components, or API endpoints that violate these legal constraints.
    - For every violation, propose specific code fixes (diffs) to bring the logic into 100% compliance.
