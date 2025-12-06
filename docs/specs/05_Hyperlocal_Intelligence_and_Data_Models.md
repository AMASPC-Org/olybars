# 05 – Hyperlocal Intelligence & Data Models

## 1. Core Data Philosophy
* **NoSQL First:** We use Firestore. Schema flexibility is critical as venue data varies wildly (e.g., a dive bar vs. an arcade).
* **Read-Optimized:** Data is duplicated/aggregated to minimize read costs (FinOps).
* **Event Sourced (Lite):** Critical actions (check-ins) are stored as immutable events first, then aggregated into current state.

## 2. Firestore Data Schema

### 2.1 `venues` (Collection)
The single source of truth for every bar.
```typescript
interface Venue {
  id: string; // "brotherhood-lounge"
  name: string;
  type: 'dive' | 'cocktail' | 'brewery' | 'arcade';
  location: GeoPoint;
  hours: { [day: string]: string }; // "16:00-02:00"
  vibes: string[]; // ["pool", "dark", "loud", "patio"]
  current_buzz: {
    status: 'chill' | 'lively' | 'buzzing';
    score: number; // 0-100 (Internal metric)
    last_updated: Timestamp;
  };
  active_promos: Promo[];
  owner_claimed: boolean;
}
2.2 signals (Collection)
The raw inputs feeding the algorithm. TTL (Time To Live) = 12 hours.

TypeScript

interface Signal {
  id: string;
  venue_id: string;
  user_id: string; // Hashed/Anonymized for analysis
  type: 'check_in' | 'vibe_report' | 'photo_upload';
  value: any; // "lively" or photo_url
  timestamp: Timestamp;
}
2.3 users (Collection)
Minimal PII. Focus on League Stats.

TypeScript

interface User {
  uid: string;
  handle: string; // "OlyDrinker99"
  stats: {
    season_points: number;
    lifetime_checkins: number;
    current_streak: number;
  };
  badges: string[];
}
3. The "Buzz" Algorithm
How we determine if a place is "Popping".

3.1 Inputs & Weights
Hard Check-in (Verified): 10.0 points

Vibe Report (User): 3.0 points

Recency Decay: Score drops by 50% every 60 minutes without new signals.

3.2 Output States
Chill: Score 0 - 20

Lively: Score 21 - 60

Buzzing: Score 61+

4. Privacy & Data Safety

Aggregation: We show "5 people here," never "John Smith is here" (Stalking prevention).

Retention: Raw location traces are deleted after 30 days. Only aggregated stats persist.


---

### File 5: `docs/specs/06_Security_Privacy_and_Compliance_Spec.md`

```markdown
# 06 – Security, Privacy & Compliance

## 1. Security Philosophy
**Zero Trust & Least Privilege.** Being a "fun" app is not an excuse for weak security. We hold location data, which is sensitive.

## 2. Privacy by Design

### 2.1 The "Stalking Prevention" Layer 
* **Fuzzy Location:** Users can see "Friends at Brotherhood," but publicly, data is aggregated.
* **Opt-In Sharing:** Location sharing is OFF by default.
* **No History:** We do not provide a public "feed" of a user's past movements to other users.

### 2.2 PII Minimization
* We do not store credit cards (Stripe handles payments).
* We do not sell user location data.

## 3. Compliance: Alcohol & Legal Boundaries

### 3.1 Age Verification 
* **Gate:** App requires 21+ attestation on signup.
* **Venue Responsibility:** We explicitly state (ToS) that the app is *not* ID. Bars must still card.

### 3.2 LCB (Liquor Control Board) Alignment
* **No "Binge" Gamification:** We reward *attendance* and *exploration*, not *volume* of alcohol consumption.
* **Safe Rides:** "Get a Ride" button is persistent in the UI after 10 PM.

## 4. Artie Safety Guardrails
Artie utilizes a "Constitutional AI" prompt wrapper to prevent:
* **Hallucination:** Inventing drink specials that don't exist (Legal risk for bars).
* **Conflict:** Engaging in political/religious debate (Brand risk).
* **Dangerous Advice:** Encouraging over-consumption or driving.