# 09 – DevOps, FinOps & Deployment

## 1. FinOps Strategy: "The $0 Startup"
Our architecture is designed to stay within GCP Free Tier limits as long as possible.
* **Scale to Zero:** Cloud Run instances turn off when not in use.
* **Aggressive Caching:** Static assets on Firebase Hosting CDN. Dynamic queries cached to minimize Firestore reads.
* **Budget Alerts:** Hard stops configured at $50/month to prevent runaway bills.

## 2. Deployment Pipelines (GitHub Actions)
1.  **Dev:** Commits to `main` trigger build & deploy to `olybars-dev`.
2.  **Prod:** Tagged releases (`v1.0.0`) trigger deploy to `olybars-prod`.

## 3. Environment Strategy
* **Local:** Docker Compose (Emulators for Firestore/PubSub).
* **Staging:** GCP Project `olybars-stage`.
* **Production:** GCP Project `olybars-prod`.