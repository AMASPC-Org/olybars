# 02 – League Engine & Scoring Logic

## 1. Core Philosophy
The OlyBars League is a gamified layer on top of nightlife. It must be fun, but strictly resistant to abuse ("farming"). If points become meaningless due to cheating, the product fails.

## 2. The Point Economy (The "XP" System)

### 2.1 Earning Actions
| Action | Points | Frequency Cap | Verification Method |
| :--- | :--- | :--- | :--- |
| **The Check-In** | 10 pts | 1 per venue per night (rolling 12h) | Geolocation (Lat/Long) + Device Fingerprint |
| **Vibe Report** | 5 pts | 1 per venue per night | User selection (Chill/Lively/Buzzing) |
| **Vibe Photo** | 15 pts | 1 per venue per night | AI Vision Analysis (No faces, verifies context) |
| **The "Regular" Bonus** | 20 pts | 3rd visit to same venue in 7 days | System Logic |
| **The "Explorer" Bonus** | 50 pts | 5 unique venues in 7 days | System Logic |

### 2.2 Seasons
* **Duration:** Quarterly (Winter, Spring, Summer, Fall).
* **Reset:** Points reset to 0 at season end.
* **Persistent Status:** "Lifetime Check-ins" and "Badges" persist forever.

## 3. Leaderboards & Status
1.  **Global Leaderboard:** Top players in Olympia.
2.  **Venue Leaderboard:** "Regulars" at specific bars (e.g., "The Mayor of Brotherhood").
3.  **Tiers:**
    * *Rookie:* 0-100 pts
    * *Regular:* 101-500 pts
    * *Local Legend:* 500+ pts (Unlocks specific IRL perks, TBD).

## 4. Anti-Cheat & Fraud Detection (The "Bouncer" Logic)
We assume adversarial behavior. The backend must enforce:

* **The Superman Rule:** A user cannot check into two venues 5 miles apart within 5 minutes.
* **The Camper Rule:** Multiple check-ins at the same location within short windows are debounced.
* **Device Fingerprinting:** Prevent account cycling on the same phone.
* **Photo Validation:** Use Google Cloud Vision API to detect:
    * Black/Blurry screens (Reject)
    * Explicit content (Reject + Ban)
    * Duplicate image hashes (Reject)

## 5. Technical Implementation Note
* **Service:** `LeagueScoringService` (Cloud Run).
* **Trigger:** Firestore `onWrite` triggers for async point calculation.
* **Data Model:** `users/{userId}/points_ledger` (Immutable append-only log).