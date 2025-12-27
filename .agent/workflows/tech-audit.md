---
description: Audit the codebase for "Architecture Drift" and verify tech stack integrity.
---

1. Run a dependency audit to ensure no blacklisted libraries are installed.
// turbo
run_command: npm list @google/generative-ai axios bootstrap @mui/material

2. Verify project structure integrity (Frontend/Backend/Functions).
// turbo
run_command: Get-ChildItem -Path src, server, functions -ErrorAction SilentlyContinue

3. Check environment configuration against Secret Manager standards.
// turbo
run_command: Get-Content .env.example

4. Validate AI infrastructure lazily loads context.
// turbo
run_command: findstr /S /I /C:"getGemini" functions\src\* server\src\*

5. Confirm all frontend API calls use the centralized config.
// turbo
run_command: findstr /S /I /C:"API_BASE_URL" src\features\*
