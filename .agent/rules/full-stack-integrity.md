# Full-Stack Integrity Guardrails

## Overview
This rule ensures that every change to the OlyBars platform maintains absolute integrity across routing, user interface, and legal compliance.

## Logic Gates

### 1. The Route Verification Gate
Before finalizing any implementation plan that includes a new button, link, or navigation tile, the agent MUST:
- **Scan for Target Path**: Verify if the destination route (e.g., /rules, /settings) exists in `App.tsx` or the relevant router file.
- **Identify Missing Pages**: If the route does not exist, the agent MUST create a **Logical Page Manifest** before writing any code.
  - **Intent**: Purpose of the page.
  - **Connections**: Which menus link to it?
  - **Function**: Primary action or data displayed.
- **Auto-Scaffold**: Automatically create the base `React.FC` for the missing page if the plan is approved.

### 2. The Legal Compliance Loop
For every new feature (Check-ins, Deals, Social, etc.), the agent MUST:
- **Scan Legal Directory**: Perform a `grep` or directory scan of `src/features/marketing/screens/` (Terms/Privacy) to identify if the feature requires a policy update.
- **Detect Data Usage**: If the feature uses `localStorage`, PII (Email/Phone), or GPS, the agent MUST propose a specific patch to the Privacy Policy.

### 3. The Click-Target Audit
Every interactive element added must have:
- **A Valid Path**: No "dead links" or `#` placeholders.
- **A Unique ID**: For automated browser testing compatibility.
- **A Consistency Check**: Ensure the icon and label match the system-wide design tokens (see `olybars-tech-constitution.md`).

### 4. The Environment Configuration Audit
To prevent "Environment Drift" and "Broken Hooks", the agent MUST:
- **Use Dynamic Config**: All backend calls must use `API_BASE_URL` or endpoints derived from `src/lib/api-config.ts`.
- **Verify Key Provenance**: Any hook using external API keys (Google Maps, etc.) must fetch them dynamically from the backend and NEVER hardcode literals.
- **Fail Gracefully**: Services must handle "Key Unavailable" or "Backend Down" states with proper UI fallbacks (see `olybars-maps-integrity.md`).

## Enforcement
This rule is part of the "Agent Decides" validation loop. Failure to verify a route or perform a legal scan will be considered a breach of deployment guardrails.
