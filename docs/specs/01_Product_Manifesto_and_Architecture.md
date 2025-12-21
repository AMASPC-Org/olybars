# 01 – Product Manifesto & High-Level Architecture

## 1. Executive Summary & Vision
OlyBars is the **Nightlife Operating System for Olympia, WA**, built around the **Olympia Bar League**.

Our core value proposition addresses two sides of the market:
1.  **For Guests:** Answering "Where should we go tonight?" with real-time "Vibe" data and gamified league incentives (points, leaderboards).
2.  **For Owners:** Providing a "Hyper-Local Intelligence Layer" that fills slow nights, operationalizes promotions, and converts casual traffic into regulars.

The platform is anchored by **Artie**, an AI agent (the "Spirit of the Artesian Well") who acts as a concierge for guests and a co-pilot for bar owners.

---

## 2. Core User Personas

### 2.1 The League Player (Guest)
* **Profile:** 21+ residents/visitors going out 1–3 nights/week.
* **Motivation:** Finding the "right vibe" (Buzzing vs. Chill), earning points, avoiding dead nights.
* **Key Friction:** Fragmented info (Facebook, flyers) and fear of missing out (FOMO).
* **App Interaction:** Mobile-first web app. Checks "Buzz," logs check-ins, uploads vibe photos.

### 2.2 The Bar Owner / GM
* **Profile:** Busy operators of independent venues (Brotherhood, Hannah’s, Well 80).
* **Motivation:** Filling seats on slow nights, simplified marketing, actionable data.
* **Key Friction:** Tech fatigue, staffing shortages, unpredictable social media algorithms.
* **App Interaction:** "Command Center" dashboard. Manages hours, approves promos, views simple analytics.

### 2.3 League HQ (Ops)
* **Profile:** Internal admin team (Ryan + CTO).
* **Motivation:** Data integrity, fair play enforcement, platform stability.
* **App Interaction:** Admin panels, fraud detection monitoring, master configuration.

---

## 3. Product Surfaces

### A. OlyBars Web App (The Client)
* **Target:** Guests & Players.
* **Tech:** PWA (Progressive Web App).
* **Key Features:**
    * **Buzz Clock:** Real-time vibe status (Chill, Lively, Buzzing).
    * **League Passport:** Check-in mechanism (Geolocation + Time-boxed).
    * **Artie Chat:** Conversational UI for "What's happening?" inquiries.

### B. Owner Command Center (The Dashboard)
* **Target:** Bar Owners & Staff.
* **Key Features:**
    * **Venue Profile:** Single source of truth for hours, menus, rules.
    * **Marketing Center:** AI-generated social copy and flash deals.
    * **Intel Deck:** Comparative performance metrics (anonymized).

### C. The Hyper-Local Intelligence Layer (The Backend)
* **Function:** The "Brain" processing check-ins, vibe reports, and historical data to generate recommendations.
* **Key Features:**
    * **Algorithmic Vibe Scoring:** Aggregating user signals.
    * **Artie's Context:** RAG (Retrieval-Augmented Generation) pipeline for venue knowledge.

---

## 4. Technical Architecture Stack

### Frontend
* **Framework:** React (v18+) with TypeScript.
* **Build Tool:** Vite.
* **Styling:** Tailwind CSS (Mobile-first utility classes).
* **State Management:** React Query (Server state) + Zustand (Client state).
* **Hosting:** Firebase Hosting or Cloud Run (Frontend serving).

### Backend & Database
* **Compute:** Google Cloud Run (Serverless containers for API services).
* **Database:** Google Cloud Firestore (NoSQL, document-oriented).
    * *Rationale:* Flexible schema for varying venue data; real-time listeners for "Buzz" updates.
* **Language:** Node.js / TypeScript.

### Artificial Intelligence (Artie)
* **Core Model:** Vertex AI (Gemini 2.x/3.x Pro).
* **Orchestration:** LangChain or Google GenAI SDK.
* **Context:** Vector Search (Vertex AI Search) for RAG over venue documents.

### DevOps & FinOps
* **Repo:** GitHub (Monorepo structure preferred).
* **CI/CD:** GitHub Actions (Automated lint, build, deploy).
* **Infrastructure:** Terraform (IaC) for reproducible GCP environments.
* **Security:** Zero-Trust architecture. Identity Platform (Firebase Auth) for rigorous role-based access control (RBAC).

---

## 5. Strategic Constraints & Principles

1.  **Operationally Realistic:** If a feature requires a bar owner to log in daily, it will fail. Automate everything possible.
2.  **FinOps-Aware:** "Cheapest architecture that meets SLOs." Aggressively cache static data to minimize Firestore reads and LLM token costs.
3.  **Privacy-First:** Minimize PII retention. Use aggregate data for insights.
4.  **Mobile-First:** 95% of traffic will be on mobile devices in low-light, high-distraction environments (bars). UX must be thumb-friendly and high-contrast.