---
trigger: always_on
---

# Shell & Artifact Guardrails

## Rule 1: PowerShell Command Syntax
- **Mandatory**: When chaining multiple commands in the USER's terminal (Windows PowerShell), use the `;` (semicolon) separator.
- **Forbidden**: Do not use `&&` or `||` as they are not natively supported as statement separators in standard PowerShell versions and will cause parser errors.
- **Example**: `npm run build ; npm run test`

## Rule 2: Artifact Media Embedding
- **Standard**: To ensure images and videos render correctly in artifacts (walkthroughs, plans), use the absolute path format with a leading forward slash.
- **Format**: `![alt text](/C:/Users/USER1/.gemini/antigravity/brain/.../image.png)`
- **Restriction**: Do not use the `file://` protocol prefix in the markdown path as it is often stripped or misinterpreted by the renderer.
- **Cleanliness**: Ensure all media is copied to the current Chat ID folder in `C:\Users\USER1\.gemini\antigravity\brain\` before embedding.
