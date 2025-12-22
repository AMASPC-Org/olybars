# OlyBars Observability (Google-native; no Sentry)

- Prefer Cloud Run Logs (Cloud Logging) for backend debugging; start with newest errors and include request correlation_id if present.
- Prefer Cloud Error Reporting for backend exceptions (Node/Express).
- Prefer Cloud Monitoring for uptime/latency/SLO signals.
- For frontend errors (since no Sentry): capture window.onerror and unhandledrejection and POST to a backend endpoint that logs with severity=ERROR to Cloud Logging (do not log secrets/PII).
- Do not introduce third-party observability vendors unless explicitly approved.

