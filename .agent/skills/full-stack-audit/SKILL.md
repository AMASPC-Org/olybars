name: full-stack-audit
description: Performs a comprehensive Deployment Integrity check followed by a Real-Time "Vibe" functional test.

# SECTION 1: DEPLOYMENT INTEGRITY (The "Drift" Check)
1. **Source Analysis**:
   - Run a search command to identify all instances of `process.env` in `server/`.
   - Extract unique variable names (e.g., `GOOGLE_GENAI_KEY`). Ignore `NODE_ENV`, `PORT`.
2. **Cloud verification**:
   - Execute: `gcloud run services describe olybars-backend --region us-west1 --format=json`
   - **CRITICAL:** Parse the JSON output. Collect names from TWO locations:
     - `spec.template.spec.containers[0].env[].name` (Raw Env Vars).
     - `spec.template.spec.containers[0].env[].valueFrom` (Secret Manager Mounts - check the key/name).
3. **Drift Assertion**:
   - COMPARE: Does every variable found in Step 1 exist in the combined list from Step 2?
   - IF MISMATCH: Stop. Generate a "Drift Report" listing missing secrets. Do not proceed.
   - IF MATCH: Proceed to Section 2.

# SECTION 2: FUNCTIONAL VIBE CHECK (The "Real-Time" Test)
1. **Environment**:
   - Check if port 3000 is free. If not, kill the process.
   - Ensure `npm run dev` is running and accessible at localhost:3000.
2. **Setup Observer (Tab 1)**:
   - Open Browser to `/venue/the-brotherhood`.
   - visually confirm the "Vibe Meter" element is visible.
3. **Setup Actor (Tab 2)**:
   - Open new tab to `/passport`.
   - **Auth Check:** Look for "Login" button. If present, log in with test credentials. If "Avatar" is present, proceed.
   - Override Geolocation to [47.045, -122.905] (The Brotherhood coordinates).
4. **Execution**:
   - In Tab 2, Click "Clock In".
   - Wait for visual confirmation (Toast/Success message) in Tab 2.
5. **Verification**:
   - Switch immediately to Tab 1.
   - **DO NOT RELOAD TAB 1.**
   - WAIT up to 15 seconds (Allowing for Cold Start latency).
   - ASSERT: "Vibe Meter" updates (e.g., Color change or Text update "Chill" -> "Lively").
6. **Reporting**:
   - Take a screenshot of the updated Tab 1.
   - Save findings to `audit_results.md`.
