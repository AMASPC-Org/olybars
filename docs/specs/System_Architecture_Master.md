# System Architecture Master

This document serves as the single source of truth for the OlyBars system architecture, covering infrastructure, security, compliance, and deployment strategies.

---

## 1. Core Engineering Philosophy
*   **Zero Trust & Least Privilege**: Security is prioritized, especially given the sensitive nature of user location data.
*   **Serverless-First**: We utilize a serverless approach to minimize fixed costs and scale dynamically.
*   **FinOps ("The $0 Startup")**: The architecture is designed to stay within the Google Cloud Platform (GCP) Free Tier limits as long as possible.

## 2. Infrastructure Stack (GCP)

### 2.1 Compute: Cloud Run
*   **`api-gateway`**: Node.js 20 / Express. Handles authentication, rate limiting, and routing.
    *   **Strict Mode**: TypeScript `strict: true` enforced for type safety.
    *   **Decoupled Architecture**: `server` logic independent of `functions` to prevent cross-dependency bloat.
*   **`league-engine`**: Handles gamification logic, point calculation, and anti-cheat systems.
*   **`artie-brain`**: LangChain container handling LLM orchestration and RAG.
*   **Scale to Zero**: Instances automatically turn off when not in use to eliminate costs.

### 2.2 Database & Storage
*   **Firestore**: Primary NoSQL document store with real-time listeners for "Buzz" status updates.
*   **Cloud Storage**: Used for venue assets and optimized media files.

### 2.3 Event Bus: Pub/Sub
*   Decouples writes from heavy processing (e.g., User Check-In -> API Write -> Pub/Sub -> League Engine processing).

### 2.4 Networking & Caching
*   **Firebase Hosting**: CDN for static assets.
*   **Aggressive Caching**: Static assets on CDN and dynamic queries (e.g., Redis/Memorystore) to minimize Firestore reads and LLM tokens.

## 3. Intelligence Layer (Artie)
*   **Model**: Vertex AI (Gemini 2.0 Pro).
*   **Memory**: Firestore Vector Search for vibe-based discovery.
*   **Optimization**: Redis (Memorystore) for frequent local queries.
*   **Persona**: "Artie" - The Spirit of the Artesian Well. Helpful, slightly mystical, local expert.
*   **Constraints**: Prioritizes `knowledgeBase.json` and local data. Never hallucinates prices/hours.

### 3.1 The Intelligence Loop
1.  **Static**: Venue Docs (Hours, Menus).
2.  **Dynamic**: Real-time "Buzz" levels, User location.
3.  **Tools**: `venueSearch`, `checkStatus`, `getPromo`.

## 4. Security & Privacy

### 4.1 Privacy by Design
*   **Stalking Prevention**: Fuzzy location and aggregated public data. Location sharing is OFF by default.
*   **PII Minimization**: No credit cards stored (handled by Stripe). No selling of location data.

### 4.2 Auth & Access Control
*   **Identity Service**: Handles session management and RBAC.
*   **Age Verification**: Signup requires 21+ attestation. Bars remain responsible for physical ID checks.

## 5. Compliance

### 5.1 WSLCB Alignment
*   **No Binge Gamification**: Rewards are for attendance and exploration, not volume.
*   **Safe Rides**: Persistent "Get a Ride" feature in the UI after 10 PM.

### 5.2 Artie Safety Guardrails
*   Constitutional AI wrappers prevent hallucinations (fake deals), brand conflict, and dangerous advice (over-consumption).

## 6. Frontend Architecture & UX

### 6.1 The "Bar-Ready" Standard
Bar environments are unique. Our UI must pass the **"Drunk Thumb" Test**:
1.  **High Contrast**: Dark mode default. Text must be readable in dim lighting.
2.  **Big Targets**: Buttons must be 44px+ height for impaired motor skills.
3.  **One-Handed**: Primary navigation (Nav Bar, FAB) must be reachable with a thumb.

### 6.2 Offline-First (PWA)
Cell service in Olympia bars (e.g., The Brotherhood basement) is unreliable.
*   **Strategy**: App loads "stale" data from local storage immediately, then background refreshes.
*   **Check-ins**: Queued locally if offline, synced when connection returns.

### 6.3 State Management
*   **Framework**: React (v18+) + Vite.
*   **Styling**: Tailwind CSS (Utility-first).
*   **State**: React Query (Server-state sync) + Zustand (Client-side UI state).

## 7. Operations & DevOps

### 7.1 CI/CD Pipeline (GitHub Actions)
*   **CI**: Linting, testing, and building of containers.
*   **CD**: Terraform for infra; Cloud Build for container deployment.

### 7.2 Environment Strategy
*   **Local**: Docker Compose with local emulators.
*   **Dev**: Commits to `main` deploy to `olybars-dev`.
*   **Prod**: Tagged releases (`v*.*.*`) deploy to `olybars-prod`.

### 7.3 Financial Guardrails
*   Hard budget alerts configured at $50/month to prevent runaway billing.

## 8. Core Algorithms (The "Game" & "Buzz")

### 8.1 The League Engine (Scoring)
| Action | Points | Frequency Cap | Method |
| :--- | :--- | :--- | :--- |
| **Check-In** | 10 pts | 1/venue/12h | Geofence + Device ID |
| **Vibe Report** | 5 pts | 1/venue/night | User Selection |
| **Vibe Photo** | 15 pts | 1/venue/night | CV Analysis |
| **Explorer Bonus** | 50 pts | 5 unique/7 days | System Logic |

### 8.2 The "Buzz" Algorithm
Calculates real-time venue activity.
*   **Inputs**: Hard Check-in (10.0), Vibe Report (3.0).
*   **Decay**: Score drops by 50% every 60 mins without signals.
*   **States**: Chill (0-20), Lively (21-60), Buzzing (61+).

### 8.3 Anti-Cheat ("The Bouncer")
*   **Superman Rule**: Velocity checks (distance/time) to prevent teleportation.
*   **Camper Rule**: Debouncing repetitive signals from same location.

## 9. Data Schema (Firestore)

### 9.1 `venues`
*   `current_buzz`: { score, label, last_updated }
*   `happyHourRules`: Array of time-based rules.
*   `tier_config`: Subscription level features.

### 9.2 `signals`
*   Immutable event stream (TTL 12h).
*   `type`: check_in, vibe_report.
*   `metadata`: Location, consensus.

### 9.3 `users`
*   `stats`: { seasonPoints, lifetimeCheckins, currentStreak }
*   `venuePermissions`: RBAC map { venueId: role }
