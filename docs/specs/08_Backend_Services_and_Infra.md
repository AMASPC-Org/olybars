# 08 – Backend Services & Infrastructure

## 1. Infrastructure: Google Cloud Platform (GCP)
We use a **Serverless** approach to minimize fixed costs (FinOps).

### 1.1 Compute: Cloud Run
* **`api-gateway`:** Node.js/Express. Handles auth, rate limiting, and routing.
* **`league-engine`:** The gamification logic (Point calculation, anti-cheat).
* **`artie-brain`:** LangChain container handling LLM orchestration and RAG.

### 1.2 Database: Firestore
* Primary NoSQL document store.
* Real-time listeners enabled for "Buzz" status updates.

### 1.3 Event Bus: Pub/Sub
* Decouples writes from heavy processing.
* *Example:* User Checks In -&gt; API writes to Firestore -&gt; Pub/Sub triggers `league-engine` to calculate points.

## 2. Artie's Architecture (The Brain)
* **Model:** Vertex AI (Gemini 2.x/3.x).
* **Memory:** Firestore Vector Search (for finding venues by "vibe").
* **Cache:** Redis (Memorystore) for frequent queries ("What's happening tonight?") to save LLM tokens.

## 3. DevOps & CI/CD
* **Repo:** GitHub Monorepo.
* **CI:** GitHub Actions (Lint, Test, Build).
* **CD:** Terraform applies infrastructure changes; Cloud Build deploys containers.