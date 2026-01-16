# SCHMIDT ARCHITECTURE AUDIT (Phase 3a)

## 1. The "Schmidt" Symbol Audit
The following symbols have been identified for renaming to align with the Schmidt rebranding and to retire the "Artie" legacy naming.

| Current Symbol | Proposed Rename | Type |
| :--- | :--- | :--- |
| `ArtieOpsState` | `SchmidtOpsState` | Type Alias |
| `ArtieMessage` | `SchmidtMessage` | Interface |
| `useArtieOps` | `useSchmidtOps` | Hook |
| `addArtieResponse` | `addSchmidtResponse` | Internal Function |
| `addArtieMessage` | `addSchmidtMessage` | Exported Function |
| `artie-init` | `schmidt-init` | ID Constant |

## 2. Logic Bloat Detection (The 20-Line Rule)
The `processAction` switch statement in `useArtieOps.ts` is currently the primary source of technical debt, containing 1,000+ lines of mixed concerns.

| Case Action | Line Count | Proposed Helper File |
| :--- | :--- | :--- |
| `method_ideation` | 23 | `src/skills/Schmidt/flashDeal.ts` |
| `SUBMIT_DEAL_TEXT` | 42 | `src/skills/Schmidt/flashDeal.ts` |
| `SUBMIT_EVENT_TEXT` | 199 | `src/skills/Schmidt/eventExtraction.ts` |
| `generating_creative_copy`| 31 | `src/skills/Schmidt/marketing.ts` |
| `copy_approved` | 26 | `src/skills/Schmidt/marketing.ts` |
| `SUBMIT_SOCIAL_POST_TEXT` | 24 | `src/skills/Schmidt/marketing.ts` |
| `SUBMIT_EMAIL_TEXT` | 22 | `src/skills/Schmidt/marketing.ts` |
| `SUBMIT_WEB_TEXT` | 21 | `src/skills/Schmidt/marketing.ts` |
| `SUBMIT_IMAGE_CONTEXT` | 30 | `src/skills/Schmidt/imageGen.ts` |
| `confirm_post` | 28 | `src/skills/Schmidt/execution.ts` |
| `UPLOAD_FILE` | 84 | `src/skills/Schmidt/eventExtraction.ts` |

## 3. State Machine Analysis
The `SchmidtOpsState` (formerly `ArtieOpsState`) contains several inconsistencies that could lead to runtime errors or memory leaks if not addressed.

### Orphaned States (Defined but Never Set)
*   `flash_deal_time_check`: Defined in type but never targeted by `setOpsState`.
*   `play_input`: Legacy state from "Artie" games, no longer used.
*   `upload_file`: The action is `UPLOAD_FILE`, but the state variable is never set to this value.

### State Transitions
*   **Implicit Transitions**: The `confirm_post` action relies on the *previous* `opsState` context to determine its logic path. This is a "Hidden State" pattern that should be refactored into explicit confirmation states for each skill.

## 4. Brownfield Verification
*   **Backend Check**: `server/package.json` verified. Valid `start` script found: `"node dist/server/src/index.js"`.
*   **Rules Check**: 8 active rule files found in `.agent/rules/`. The new `agent-skills-protocol.md` and `deployment-safety.md` are currently **MISSING** and require installation.

Audit Complete. Awaiting approval to begin Refactor Phase.
