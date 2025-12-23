---
description: Comprehensive diagnostic to verify Artie''s AI brain (persona, connectivity, and triage).
---

# Artie Brain Diagnostic Workflow

Use this workflow to verify that Artie is correctly integrated, his "Spirit of the Artesian Well" persona is intact, and his intent triage is working.

## Step 1: Environment Handshake
// turbo
1. Check if the local environment is synchronized with functional API keys.
   ```powershell
   Test-Path "functions/.env"
   ```
2. If `False`, refer to GCP Secret Manager:
   ```powershell
   gcloud secrets versions access latest --secret="GOOGLE_API_KEY"
   ```

## Step 2: Intent Triage Verification
1. Run a test to ensure Artie correctly identifies its "Spirit" identity and triages search queries.
   ```powershell
   # Example diagnostic run (adjust path as needed)
   npx tsx functions/verify_brain.ts
   ```

## Step 3: Persona & Knowledge Audit
1. Verify the response contains core persona keywords:
   - "Spirit" or "Artesian" or "Well 80"
2. Verify the response triages venues correctly:
   - "SEARCH: [VENUE_NAME]"

## Step 4: Infrastructure Integrity
1. Confirm `GeminiService` is being used in `functions/src/flows/artieChat.ts`.
2. Confirm lazy instantiation is implemented to prevent environment-related startup crashes.
