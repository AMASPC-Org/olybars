# Frontend Consistency & Safe Editing

This rule exists to prevent common breakage patterns observed during complex feature implementations (e.g., Check-in System).

## 1. Atomic Prop Updates
- **Mandatory**: When modifying a component's props (e.g., adding \onLogin\ to \ClockInModal\), you MUST find and update all parent callers (e.g., \App.tsx\) in the same turn.
- **Verification**: Run \npm run build\ or check for TypeScript errors immediately after prop changes.

## 2. Duplicate Identifier Prevention
- **Constraint**: When using \multi_replace_file_content\, audit the resulting file for duplicate variable, function, or interface declarations.
- **Tip**: Grep the file for the newly added key before declaring success.

## 3. Atomic State & Helpers
- **Rule**: If a new interaction (like a login redirect) requires a helper function in a parent component, define the helper *before* passing it as a prop.
- **Rationale**: Prevents \"Cannot find name 'handleX'\" errors during the build cycle.

## 4. Feature Parity (Sync Seed)
- **Mandatory**: Every schema change or new field added to a frontend interface MUST be reflected in \server/src/seed.ts\ to ensure development environments remain functional.
