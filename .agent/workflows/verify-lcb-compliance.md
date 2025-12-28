---
description: Audit the codebase for WA State LCB compliance (Check-in limits, HH sorting, and Marketing Ad Copy).
---

# /verify-lcb

Perform a legal compliance audit of the OlyBars application logic against the WA State LCB mandates defined in the project constitution.

## Instructions

1.  **Check-in Logic Audit**: 
    - Scan all files in \src/features/\ and \server/src/\ for logic related to user check-ins, timestamps, or session persistence.
    - **Rule Check**: Audit this logic against Rule 3: Strictly enforce a maximum of 2 check-ins per 12-hour window per user.
    - Identify any gaps where the check-in count or time-window enforcement is absent or incorrectly implemented.

2.  **Happy Hour Sorting Audit**:
    - Locate sorting logic for "Happy Hour" deals or venue promotions.
    - **Rule Check**: Verify that logic correctly prioritizes deals by \TimeRemaining\.
    - **Priority Rule**: Ensure deals with >4 hours remaining are pushed to the bottom of the list.

3.  **Safe Ride Logic Audit**:
    - Locate check-in success modals or post-activity screens.
    - **Rule Check**: Ensure a "Safe Ride Home" link (Red Cab, Uber, or Lyft) appears if the activity occurs after 5:30 PM.
    - **Verification**: Check \ClockInModal.tsx\ and \VibeCheckModal.tsx\ for the threshold logic.

4.  **Marketing & Ad Copy Audit**:
    - Scan \src/features/venue/\ and AI prompt templates for ad copy generation logic.
    - **Rule Check**: Verify adherence to [lcb-compliance-consigliere.md](file:///C:/Users/USER1/olybars/.agent/rules/lcb-compliance-consigliere.md) and cross-reference validation against src/assets/LCB/.
    - **Banned Phrases Check**: Ensure "Bottomless", "Chug", "All you can drink" are forbidden in generated output.
    - **Citation Directive**: When flagging a violation, cite the specific page or section from the PDF asset (e.g., 'Per WAC 314-52.pdf, Section 040').

5.  **Compliance Report**:
    - Output a structured report identifying any functions, components, or API endpoints that violate these legal constraints.
    - For every violation, propose specific code fixes (diffs) to bring the logic into 100% compliance.
