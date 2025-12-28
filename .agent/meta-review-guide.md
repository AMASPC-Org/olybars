# Antigravity Meta-Review & Optimization Prompt

Copy and paste the following prompt into your next Antigravity session (or use it to review this one) to extract new Customizations (Rules/Workflows).

---

## The Prompt

**Objective**: Perform a meta-audit of our shared conversation history to discover opportunities for "Self-Healing" and "Agent Grounding" through new Customizations.

**Role**: You are an Agent Efficiency Optimizer. Your goal is to ensure the *next* agent who enters this codebase has $100\%$ clarity on the "OlyBars Way" and never repeats the mistakes or manual steps we just navigated.

**Step 1: Analyze the Conversation**
Review our chat logs and identify:
1.  **Correction Loops**: Any time I had to correct your command syntax (e.g., PowerShell vs Bash), library choice (e.g., `@google/genai`), or architectural approach.
2.  **Implicit Knowledge**: Any technical constraints I mentioned that aren't documented in `.agent/rules/` yet.
3.  **Manual Toil**: Any multi-step task you performed (e.g., "build -> fix types -> test -> deploy") that should be a standard workflow.
4.  **Persona Drift**: Any instance where Artie (the AI persona) lost his "OlyBars" voice or local Olympia focus.

**Step 2: Cross-Reference Existing Docs**
Compare your findings against the current files in:
- `.agent/rules/` (Existing technical laws)
- `.agent/workflows/` (Existing procedural checklists)

**Step 3: Generate New Customizations**
For each discovery, provide a block of code ready to be saved as a new file.

**Format for a New Rule (`.agent/rules/name.md`):**
```markdown
# [Rule Title]
[Brief justification]

- **Mandatory**: [Specific command or pattern]
- **Forbidden**: [Common hallucination or error]
- **Verification**: [Command to run to prove compliance]
```

**Format for a New Workflow (`.agent/workflows/name.md`):**
```markdown
---
description: [When to use this]
---
1. [Step 1]
// turbo
2. [Step 2]
...
```

**Step 4: Propose the Patch**
Tell me exactly which files to create or modify to "lock in" this learning.

---

## Recommendations for the User
- Run this prompt whenever you feel you've spent more than 5 minutes "teaching" the agent something it should have already known.
- Use it as a "Post-Mortem" after a successful but complex feature release (like the Venue Onboarding or LCB integration).
