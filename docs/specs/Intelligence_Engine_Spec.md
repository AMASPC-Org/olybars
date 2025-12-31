# Intelligence Engine Spec

This document details the software "brain" of OlyBars, encompassing the AI agent (Artie), the gamified League Engine, and the data models that power them.

---

## 1. Artie: The Spirit of the Artesian Well

### 1.1 Persona & Identity
*   **Name**: Artie.
*   **Tone**: Helpful, slightly mystical, deeply knowledgeable about Olympia history and nightlife, "chill local."
*   **Constraints**: ALWAYS prioritize local data. NEVER hallucinate drink prices or hours. If unsure, check tools or admit ignorance.

### 1.2 The Intelligence Loop (Architecture)
Artie is an orchestration layer using **Gemini 1.5 Pro (Vertex AI)**.
1.  **Static context**: Venue documentation (Hours, Menus, Vibes).
2.  **Dynamic context**: Current "Buzz" levels, User location, Time of night.
3.  **Skill Registry (Tools)**: 
    *   `find_venue`: Vector search for vibes (e.g., "dive bar with pool").
    *   `check_status`: Fetch real-time vibe status.
    *   `get_promo`: Retrieve active Flash Deals.
    *   `suggest_route`: Generate proximity-based bar crawls.

## 2. The League Engine (Scoring Logic)

### 2.1 The Point Economy
| Action | Points | Frequency Cap | Verification Method |
| :--- | :--- | :--- | :--- |
| **Check-In** | 10 pts | 1 per venue per 12h | Geolocation + Device ID |
| **Vibe Report** | 5 pts | 1 per venue per night | User selection |
| **Vibe Photo** | 15 pts | 1 per venue per night | AI Vision Analysis |
| **Regular Bonus** | 20 pts | 3 visits/7 days | System logic |
| **Explorer Bonus** | 50 pts | 5 unique venues/7 days | System logic |

### 2.2 Hierarchy & Tiers
*   **Seasons**: Points reset quarterly. Lifetime stats (check-ins, badges) persist.
*   **Tiers**: Rookie (0-100), Regular (101-500), Local Legend (500+).

### 2.3 Anti-Cheat (The "Bouncer" Logic)
*   **Superman Rule**: Distance/Time validation (no impossible travel).
*   **Camper Rule**: Debouncing repetitive signals.
*   **Photo Validation**: Vision API analysis to prevent blurry/blatant/duplicate uploads.

## 3. The "Buzz" Algorithm
Determines the current activity level of a venue.

### 3.1 Inputs & Weights
*   **Hard Check-in (Verified)**: 10.0 pts.
*   **Vibe Report (User)**: 3.0 pts.
*   **Recency Decay**: Score drops by 50% every 60 minutes without new signals.

### 3.2 Output States
*   **Chill**: 0 - 20 pts.
*   **Lively**: 21 - 60 pts.
*   **Buzzing**: 61+ pts.

## 4. Data Models (Firestore)

### 4.1 Collection: `venues`
Primary document store for bars.
*   `current_buzz`: Object containing status, score, and `last_updated`.
*   `vibes`: Array of tags (e.g., "pool", "patio").
*   `active_promos`: Array of current Flash Deals.

### 4.2 Collection: `signals`
Immutable input stream. TTL = 12 hours.
*   `type`: check_in, vibe_report, or photo_upload.
*   `value`: Payload (e.g., "lively" or `photo_url`).

### 4.3 Collection: `users`
League status and minimal PII.
*   `stats`: season_points, lifetime_checkins, etc.
*   `playerGamePreferences`: (Favorite activities/drinks).

## 5. Intelligence Guardrails
*   **Constitutional AI**: Prompt wrappers ensure Artie remains compliant with WSLCB (no encouraging binge drinking) and stays focused on nightlife (no politics/religion).
*   **Safe Ride Trigger**: Proactive Uber/Lyft/Red Cab (360-555-0100) prompts when intoxication is implied or after 10 PM.
