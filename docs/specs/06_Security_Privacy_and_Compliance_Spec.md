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