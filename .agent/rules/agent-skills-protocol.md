# Agent Skills Protocol

**Logic Separation:** If a Skill's logic exceeds 20 lines of code, you MUST extract it to a helper function in a separate file (e.g., `src/skills/Schmidt/logic.ts`) to prevent `useArtieOps.ts` bloat.

**State Transitions:** State Transitions MUST be explicit. If a Skill Action > 20 lines, it MUST be extracted to `src/skills/Schmidt/`. 

**Intent Parsing:** Do NOT use Regex for complex intent. Use the LLM/Service layer for semantic extraction.

**Naming Convention:** Use 'Schmidt' instead of 'Artie'. Use 'Bounty' instead of 'Deal'.
