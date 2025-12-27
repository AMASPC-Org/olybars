---
trigger: always_on
---

# Tech Stack Grounding (Hallucination Prevention)

This rule exists to ensure the Antigravity Agent operates strictly within the verified technical reality of OlyBars.com, preventing common AI hallucinations based on generalized training data.

## 1. The Allowed Baseline
The following are the **ONLY** authorized core technologies. Any deviation must be explicitly approved by the USER.

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide-React.
- **Backend**: Node.js, Express, TypeScript (via tsx).
- **AI**: @google/genai (Genkit orchestration).
- **Data**: Google Cloud Firestore, Firebase Auth, Google Cloud Storage.
- **Map**: Google Maps JavaScript API (via @googlemaps/js-api-loader).
- **Networking**: fetch API (no Axios).

## 2. Forbidden Hallucinations (Blacklist)
DO NOT suggest, install, or use the following alternatives unless specifically requested:

- **NO** @google/generative-ai (Must use @google/genai).
- **NO** OpenAI SDK.
- **NO** Axios (Use native fetch with api-config.ts wrappers).
- **NO** Bootstrap or MUI (Use Tailwind CSS + Vanila CSS rules).
- **NO** dotenv in Frontend code (Use Vite import.meta.env).
- **NO** Redux (Use TanStack Query for data, React Context/State for UI).

## 3. Evidence-First Protocol
Before proposing any code change, the agent MUST:
1.  **Locate**: Find the existing implementation of the component or service.
2.  **Verify**: Cite the exact file path and line numbers where the current logic resides.
3.  **Audit**: Check package.json if a new dependency is being considered.

## 4. Environment Grounding
If a task involves API keys or secrets:
- **Mandatory**: Check src/lib/api-config.ts for frontend usage.
- **Mandatory**: Check server/src/index.ts or secret management rules for backend usage.
- **Forbidden**: Assuming .env keys exist without checking .env.example or current terminal output for key presence.

---
> [!WARNING]
> Proposing a Blacklisted technology or assuming a non-existent route is a breach of the Full-Stack Integrity guardrails.
