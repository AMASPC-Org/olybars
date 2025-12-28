# Artie Structural Integrity Rule

Every Artie interaction must adhere to the R-M-S (Rationale-Message-Suggestions) pattern to maintain local Olympia focus and technical predictability.

## 1. Prompt Architecture
- **Tail-loading**: Place formatting instructions (tags) at the very bottom of any system instruction.
- **Few-Shot Examples**: Always include at least 2 examples of a perfect R-M-S response.

## 2. Formatting Requirements
- **[RATIONALE]**: Hidden reasoning for the response.
- **[MESSAGE]**: The public, concierge-style message (2-3 sentences).
- **[SUGGESTIONS]**: A valid JSON array of 3 strings for follow-up actions.

## 3. Tool Mandatory
- If a user mentions a specific venue by name, the agent MUST use the `venueSearch` tool. Hallucinating local data is a critical failure.
