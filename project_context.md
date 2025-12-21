# OlyBars.com Project Context

## 1. Executive Summary
* **App:** OlyBars (Olympia Bar League Management)
* **Parent Org:** American Marketing Alliance SPC
* **Founder/CTO:** Ryan Rutledge
* **Vision:** The "Nightlife Operating System" for Olympia, WA.
* **Core Value:** Gamifying nightlife for guests; providing hyper-local intelligence for owners.

## 2. Technical Stack & Environment
* **Frontend:** React (v18+), Vite, TypeScript.
* **Styling:** Tailwind CSS (configured via `index.html` classes), Lucide-React icons.
* **Backend:** Google Cloud Native (Cloud Run, Firebase Hosting).
* **Database:** Firestore (NoSQL).
* **AI:** Gemini 3.0 Pro (via `services/geminiService.ts`).
* **Region:** `us-central1` (GCP Default).

## 3. Tooling & Workflow Strategy
We utilize specific tools for specific phases of development to maximize efficiency:

| Task Type | Recommended Tool | Environment |
| :--- | :--- | :--- |
| **Logic/Bugfixes** | **Gemini Code Assist** | VS Code (Local) |
| **Architecting/Scaffolding** | **Google Antigravity** | Antigravity IDE |
| **Automation/Docs/System** | **Gemini CLI** | VS Code Terminal / Cloud Shell |
| **Quick Fixes/Remote** | **Cloud Shell Editor** | Browser |
| **Deployment/Ops** | **gcloud / Terminal** | Cloud Shell Terminal |

* **Standard Install:** `npm install`
* **Run Local:** `npm run dev`
* **Build:** `npm run build`

## 4. Current Priorities (Aligned with Doc 10)
1. **Foundation Deployment:** Deploy "Hello World" to Cloud Run to establish the pipeline.
2. **Developer Experience:** Configure Gemini CLI in VS Code for efficient AI-assisted coding.
3. **Security Baseline:** Initialize basic `firestore.rules` before adding business logic.

---

## 5. Coding Standards & Conventions
* **Structure:**
    * Keep all components in `src/`.
    * Single App entry: `src/App.tsx`.
* **Philosophy:**
    * **Small, Focused Components:** Avoid monolithic files. Break logic down.
    * **TypeScript:** Strict typing required. No `any`.
    * **Dependencies:** No new npm packages without explicit CTO approval.

---

## 6. Functionality Preservation (Do Not Break)
1. **BuzzClock:** Real-time header/filtering.
2. **League Passport:** Check-in flow, photo capture, scoring.
3. **Artie:** Chat panel integration.
4. **Compliance:** Onboarding modal, 21+ gate.
5. **Owner Dashboard:** `OwnerMarketingPromotions` tab.
6. **User Profile:** Follow/unfollow, alerts.
7. **Mock Data:** Preserve `MOCK_VENUES` until migration is complete.

---

## 7. 🧠 AI INTERACTION RULES (REQUIRED)

### A. The "Step-by-Step" Execution Rule
**Crucial:** The AI must **NOT** generate long lists of unverified steps.
1. Issue **one** command or instruction.
2. Specify **where** to run it (CLI, Terminal, Editor).
3. **Wait** for the user to paste the output.
4. Analyze the output before generating the next step.

### B. Efficient File Generation
When requesting a new file, the AI must provide the **full file path** and the **full code content** immediately in the same response. Do not ask the user to create a file manually and then fill it later.

### C. Code Output Standards
* **Full Files Only:** Unless a file is **>600 lines**, always output the **full file content**.
* **Circuit Breaker:** If an update fails twice, invoke **Manual Override Mode** with a timestamp comment (`// MANUAL OVERRIDE: [Date]`).

### D. Context Management
* **Monitor Topic Drift:** If the user jumps domains (Frontend -> Backend), suggest a new chat session.
* **Transition Prompt:** When ending a session, summarize: "Continuing from [Task]. Current state: [X]. Next objective: [Y]."

---

## 8. Documentation Map (Deep Specs)
* **Logic:** `02_League_Engine_and_Scoring_Logic.md`
* **AI Agent:** `03_Artie_Agent_System_Design.md`
* **Ops:** `04_Venue_Operations_Product_Spec.md`
* **Data:** `05_Hyperlocal_Intelligence_and_Data_Models.md`
* **Safety:** `06_Security_Privacy_and_Compliance_Spec.md`
* **UX:** `07_Frontend_Architecture_Guidelines.md`
* **Backend:** `08_Backend_Services_and_Infra.md`
* **DevOps:** `09_DevOps_FinOps_and_Deployment.md`
* **Status:** `10_Master_Roadmap_and_Current_Status.md`