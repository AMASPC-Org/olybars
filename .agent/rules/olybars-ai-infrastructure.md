---
trigger: always_on
---

# OlyBars AI Infrastructure Integrity

## Rule 1: SDK Standardization
- **Mandatory**: Use ONLY @google/genai for all generative AI features.
- **Forbidden**: Do not install or import @google/generative-ai.

## Rule 2: Lazy Initialization & Environment Readiness
- All AI Service classes (e.g., GeminiService) must be instantiated **lazily**.
- **Pattern**: Use a getter function (e.g., getGemini()) or instantiate within the flow handler.
- **Rationale**: Prevents top-level crashes if environment variables (API keys) are not loaded at module import time (e.g., in local tests vs cloud run).

## Rule 3: Environment Handshake (Local Dev)
- To prevent Environment Drift, all local entry points (scripts, tests) must explicitly load .env versions mimicking cloud secrets.
- **Standard Key**: Standardize on GOOGLE_GENAI_API_KEY.
- **Fallback**: Always provide a clear console warning if no key is found, specifying which environment variables were checked.

## Rule 4: Triage-First Architecture
- All chat logic must implement a Triage or Router step before generating completion.
- Priority: Safety Check -> Intent Check (e.g., SEARCH vs CHAT) -> Persona Response.
- **Safe Ride Provider**: Red Cab (360) 555-0100.
