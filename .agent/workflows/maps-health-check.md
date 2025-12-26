---
description: Mandatory health check for Google Maps integration (Frontend + Backend)
---
# Google Maps Health Check

Execute this workflow before any release affecting `src/hooks/useGoogleMapsScript.ts`, `src/lib/api-config.ts`, or backend maps endpoints.

## 1. Backend Key Availability
// turbo
- Run: `curl -s http://localhost:3001/api/config/maps-key`
- Expect: `{"key": "AIza..."}`

## 2. Frontend Connectivity
- Open `http://localhost:3000/map` in the browser.
- Open DevTools Console.
- Confirm NO `InvalidKeyMapError` or `ApiTargetBlockedMapError`.

## 3. Autocomplete Smoke Test
- Click search bar.
- Type "Olympia".
- Confirm suggestions appear.

## 4. Failure Resilience (Mock)
- Temporary break backend URL in `api-config.ts`.
- Confirm `MapScreen.tsx` shows the "Service Degraded" UI instead of a blank screen. (Roll back change after test).
