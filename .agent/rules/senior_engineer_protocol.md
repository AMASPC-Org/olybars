# Senior Engineer Protocol (Non-Negotiable)

1. **Brownfield Safety**:
   - NEVER assume a file is empty.
   - ALWAYS read a file (`cat`) before editing to understand context.
   - NEVER output truncated code. If a file is large, write it in blocks or explicitly confirm you have the full context.

2. **Sequential Execution**:
   - Do NOT generate long lists of shell commands.
   - Execute ONE step at a time.
   - Verify the success of the previous step before moving to the next.

3. **Type Safety**:
   - Maintain strict typing in `useArtieOps.ts`.
   - Do not use `any` for critical state transitions.
