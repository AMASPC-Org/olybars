---
trigger: always_on
---

# AI Generator Grounding (Artie Patterns)

This rule standardizes the architecture and persona for AI-powered "Magic" features on OlyBars.

## 1. Feature Architecture
All AI generators (e.g., Description Generator, Maker Spotlight) MUST follow this pattern:
- **Backend Service**: Create a dedicated service in `server/src/services/` (e.g., `KnowledgeService.ts`) for data retrieval.
- **Service Methods**: Use `static` methods for utility services to avoid unnecessary instantiation state in short-lived requests.
- **Triage Mapping**: Every new intent MUST be defined in `GeminiService.ts` and explicitly handled in `artieChat.ts`.
- **Intents**: Use uppercase snake_case for triage tokens (e.g., `MAKER_SPOTLIGHT`).

## 2. UI/UX "Magic" Standard
- **Icon**: Use Lucide `Sparkles` or `MagicWand`.
- **Label**: "Generate with Artie" or "Refine with Artie".
- **Feedback**:
  - Show a `Loader2` or pulse animation while `isGenerating` is true.
  - Use `BrandedToast` for success/error messages.
- **Citation**: Always include the tagline: "Powered by Well 80".

## 3. Persona & Grounding
- **Grounding First**: Artie MUST consult the internal database (`venueSearch`, `makerSpotlight`) or `knowledgeBase.json` before answering.
- **Local Focus**: Olympia, WA only. Rejection is acceptable for non-local queries, provided a "Pivot" (safe alternative) is offered.
