# PowerShell Mastery Rule

All terminal commands in this environment MUST follow Windows PowerShell syntax.

## 1. Command Chaining
- **Forbidden**: `&&` and `||`.
- **Mandatory**: Use `;` for sequential commands.
- **Example**: `npm run build ; npm run test`

## 2. HTTP Requests
- **Forbidden**: Bare `curl` (aliased to Invoke-WebRequest which uses different syntax).
- **Mandatory**: Use `curl.exe` for bash-like behavior or `Invoke-RestMethod` for native JSON handling.
- **Example (JSON)**: `Invoke-RestMethod -Uri "URL" -Method Post -Body (@{key="val"} | ConvertTo-Json) -Headers @{"Content-Type"="application/json"}`

## 3. Path Handling
- **Mandatory**: Use backslashes `\` for file paths in PowerShell commands.
- **Mandatory**: Quote paths containing spaces.
