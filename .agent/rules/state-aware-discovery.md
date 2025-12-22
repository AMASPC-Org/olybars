# State-Aware Discovery Rule

## Objective
Prevent \
Dead
Weight\ code and redundant builds by ensuring the agent is fully aware of existing components, functions, and logic before proposing any changes.

## Logic
1. **Global Grep Scan**: Every implementation plan MUST start with a global grep scan of the \src/\ directory to identify existing components or functions that overlap with the requested feature.
2. **Merge \u0026 Enhance First**: Prohibit 'New Builds' if a 'Merge \u0026 Enhance' into existing code is possible. If a similar component exists, it must be extended or refactored rather than duplicated.
3. **Dependency Check**: Before adding new dependencies or complex logic, verify if the functionality is already partially implemented or supported by the current tech stack.

## Enforcement
- If the agent proposes a new file that duplicates functionality of an existing file found during the scan, the plan will be rejected during validation.
