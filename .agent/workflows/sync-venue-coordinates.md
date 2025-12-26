---
description: Olibars – ensure address/lat-lng are synced and map reflects updates
---
Steps:
1. Identify source of truth: do venues store address only, lat/lng only, or both? Find schema + write path.
2. Find all touchpoints by search: “venue”, “coordinates”, “lat”, “lng”, “geocode”, “map”, “marker”, “seed”.
3. Define DONE as: updating a venue address results in correct lat/lng persisted AND map marker moves accordingly.
4. Verify current data for 2–3 venues (including the one reported wrong): show DB query evidence.
5. Verify the app is actually serving locally (HTTP check to localhost:3000) and the map loads.
6. If reseed is needed, locate the correct seed command in package.json/scripts; do not run without explicit approval; after running, re-verify DB + map.
7. Report with evidence only.
