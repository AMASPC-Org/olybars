# Core Integrity & Tech Stack Grounding

This rule ensures the agent operates strictly within the verified technical reality of OlyBars.com and maintains architectural consistency.

## 1. The Authorized Baseline
The following are the **ONLY** authorized core technologies.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide-React. (NOT Next.js).
- **Backend**: Node.js, Express, TypeScript (via tsx), Firebase Cloud Functions.
- **AI**: @google/genai (Genkit orchestration). (NEVER use @google/generative-ai).
- **Data**: Google Cloud Firestore, Firebase Auth, Google Cloud Storage.
- **Networking**: fetch API (no Axios).
- **Map**: Google Maps JavaScript API (via @googlemaps/js-api-loader).

## 2. Forbidden Hallucinations (Blacklist)
DO NOT suggest or install: OpenAI SDK, Axios, Bootstrap, MUI, Redux, or any non-Genkit AI frameworks.

## 3. Brand & Visual Identity
- **Palette**: Primary Navy (#0f172a), Primary Gold (#fbbf24).
- **Typography**: Headlines (Oswald), Body (Roboto Condensed).
- **Iconography**: Lucide-React or Phosphor (consistent stroke weight).

## 4. Frontend Consistency
- **Atomic Prop Updates**: When modifying a component's props, you MUST update all parent callers in the same turn.
- **Atomic State**: Define helper functions *before* passing them as props to prevent "Cannot find name" errors.
- **Strict TypeScript**: No 'any'. Define Interfaces for all Firestore documents and API responses.
- **Duplicate Prevention**: Audit files for duplicate declarations after multi-replace operations.

## 5. Operations & Evidence
- **Verification**: Run `npm run build` after any logic or type change.
- **Evidence-First**: Never import a library or call a route without verifying it exists first (ls or grep).
- **Sync Seed**: Every schema change or new field in a frontend interface MUST be reflected in `server/src/seed.ts`.
- **Impact Map**: Before editing code, list ALL affected systems (e.g., "Changing the User Model affects Firestore Rules and Sign-up Flow").

## 6. Genkit Standards
- All AI logic must use the Google Genkit framework.
- Use **Gemini 2.5 Flash** for high-speed conversational turns.
- Use **Gemini 3.0 Pro** only for complex reasoning (e.g., comparing happy hour values).
- All data inputs/outputs must be strongly typed using **Zod schemas**.
- Use Genkit's trace features for debugging instead of console.log.
