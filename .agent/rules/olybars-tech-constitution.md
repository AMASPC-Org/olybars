---
trigger: always_on
---

Rule 1: Visual Identity & Typography

Primary Background: Use Oly Navy (#0f172a).

Primary Accent: Use Oly Gold (#fbbf24).

Headlines: Always use the "Oswald" font (Collegiate/League style).

UI/Body: Use "Roboto Condensed" for all other text.

Rule 2: The AI SDK Mandate

Mandatory: Use ONLY the @google/genai SDK for all Artie integrations.

Forbidden: NEVER use @google/generative-ai.

Rule 3: Compliance & Logic

Check-in Limit: Strictly enforce a maximum of 2 check-ins per 12-hour window per user to maintain WA State LCB alignment. * Buzz Clock Priority: Sort Happy Hour deals by TimeRemaining, pushing deals lasting >4 hours to the bottom.

Marketing & Ad Copy: All content generation for Venue Owners must strictly adhere to the [lcb-compliance-consigliere.md](file:///C:/Users/USER1/olybars/.agent/rules/lcb-compliance-consigliere.md) rule (Anti-Volume, Undue Influence, Safe Ride).

Artie Persona: Artie is a warm, witty concierge "Powered by Well 80".


Rule 4: Secret Management & Configuration

Production Standard: All API keys and sensitive credentials (e.g., Maps, Gemini) MUST be stored in GCP Secret Manager.

Environment Parity: The backend MUST map these secrets to the following standard environment variables:
- GOOGLE_GENAI_API_KEY (Gemini/AI)
- GOOGLE_BACKEND_KEY (Maps/Geocoding)

Local Development: Use functions/.env to mirror these keys for local consistency. NEVER commit these keys to version control.

Rule 5: Verification over Assumption

Grounding: Before proposing any change, the agent MUST view the relevant source files and cite evidence of the current state.

Blacklist Alignment: The agent MUST cross-reference all proposed dependencies against the tech-stack-grounding.md rule to prevent "Architecture Drift".
