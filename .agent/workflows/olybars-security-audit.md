---
description: Security audit procedure for OlyBars features and services.
---

# /security-audit

Perform a security scan of the code to ensure it meets OlyBars' safety and privacy standards.

## Instructions

1.  **Secret Detection**:
    - Scan for hardcoded API keys, secrets, or credentials.
    - Reference: Must use `.env` or Secret Manager. No keys in `src/`.
2.  **Input/State Validation**:
    - Check for proper validation of user-controlled inputs (hooks, state, props).
    - Ensure no dangerous use of `dangerouslySetInnerHTML`.
3.  **Data Privacy**:
    - Verify that no PII (Personally Identifiable Information) is logged to the console or sent to unsecured endpoints.
    - Check for adherence to Firestore security rules (no client-side bypasses).
4.  **AI Safety**:
    - Ensure prompt templates (in `src/ai/prompts`) are secured against injection if user input is included.
5.  **Output**:
    - List any vulnerabilities found.
    - Propose remediation steps.
