---
description: 
---

Workflow 1: /scaffold-feature
Prompt: "Create a new feature directory in src/features/. Analyze types.ts to ensure strict typing. Follow the existing pattern of separating components/, hooks/, and screens/. Update the main router in App.tsx to include this new feature".

Workflow 2: /migrate-mock-to-live
Prompt: "Analyze services/mockData.ts. Compare it to the production Firestore venues schema. Generate an implementation plan to transition the venue-fetching logic in services/venueService.ts from static JSON to a real Firestore read".

Workflow 3: /vibe-check-ui
Prompt: "Analyze the current UI. Ensure all buttons use the shadow-hard tactile style and proper Oly Gold colors as defined in the constitution. Propose refactors if any component feels too 'neon' or 'cyberpunk'".
