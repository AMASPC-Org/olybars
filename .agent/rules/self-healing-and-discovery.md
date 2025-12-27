---
trigger: always_on
---

# Self-Healing & Discovery Protocol

This rule governs how the agent responds to errors and how it discovers the system state before acting.

## 1. The Self-Healing Loop
When a command fails (e.g., 
pm run build errors) or a runtime bug is discovered:
- **Phase 1: Diagnostic**: Do not immediately retry or guess. Read the error log fully. Locate the exact line and file.
- **Phase 2: Root Cause Analysis**: State the root cause out loud (e.g., "The backend added a field that the frontend interface doesn't expect").
- **Phase 3: Deep Audit**: Scan for other instances where this logic exists. (e.g., If a types file changed, find all files importing it).
- **Phase 4: Targeted Fix**: Apply the fix across ALL identified locations, not just the one that errored.

## 2. Dependency Awareness (Cross-Stack Loop)
For every change, the agent MUST verify the "Ripple Effect":
- **Backend -> Frontend**: If an API response changes, update the frontend types and components.
- **Code -> Seed**: If a data model changes, update server/src/seed.ts.
- **Logic -> Rules**: If a new action is added, check irestore.rules.
- **Deployment -> Docs**: Update olybars_technical_spec.md or README if architecture changes.

## 3. The Discovery Mandate
Before writing a single line of code for a new feature:
- **Search**: Grep for related keywords (e.g., "venue", "buzz", "check-in").
- **Audit**: View the existing implementation to understand the "Pattern of the Project".
- **Map**: Create an Impact Map in the Planning phase.

## 4. Schema-First Integrity
Every data-layer change (Firestore fields, API responses) MUST:
- **Update Seed**: reflect the change in server/src/seed.ts.
- **Update Types**: reflect the change in src/types/.
- **Verify Emulator**: Run the seed script in the local emulator to verify no schema breakages before proposing a deploy.
- **Document**: Update the "Data Model" section in olybars_technical_spec.md (or equivalent).

---
> [!IMPORTANT]
> The agent is forbidden from saying "Fixed the error" without citing the build/test output that proves the fix.
