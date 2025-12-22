# OlyBars.com - Project Identity

## Overview
**Project:** OlyBars (Olympia Bar League Management)
**Context:** Part of the `ama-agentic-ecosystem`
**Primary Objective:** Optimization of OlyBars.com - The "Artesian Bar League Manual" for Olympia, WA.

## Tech Stack
- **Frontend:** React (v18+), Vite, TypeScript
- **Styling:** Tailwind CSS, Lucide-React
- **Backend:** Node.js/Express on Google Cloud Run
- **Database:** Google Cloud Firestore (NoSQL)
- **AI:** Gemini 3.0 (via `@google/genai` SDK)
- **Infrastructure:** Google Cloud Platform (Region: `us-west1`)

## Source of Truth
Governance and operational rules are strictly defined in the `.agent/rules/` directory.
- See [.agent/rules/olybars-tech-constitution.md](.agent/rules/olybars-tech-constitution.md) for core technical rules.
- See [.agent/rules/olybars-release-guardrails.md](.agent/rules/olybars-release-guardrails.md) for deployment and release procedures.
- See [.agent/rules/full-stack-integrity.md](.agent/rules/full-stack-integrity.md) for systemic autonomy guardrails.
- See [.agent/rules/state-aware-discovery.md](.agent/rules/state-aware-discovery.md) for feature cataloging and dependency auditing.
- See [.agent/rules/contextual-ux-logic.md](.agent/rules/contextual-ux-logic.md) for state-aware UI variation logic.

## Admin Hierarchy
- **Super-Admin**: `ryan@amaspc.com` has global access to system health, user management, and secret management.
- **Access**: Protected route at `/admin` requires `super-admin` role in Firestore.
- **Setup**: Elevate users via the `/api/admin/setup-super` endpoint with the `MASTER_SETUP_KEY`.

## Mandatory Pre-Commit Procedures
To maintain legal compliance and project stability, the following checks must be performed by the agent before proposing any code changes:
- **Guardian Check**: Execute [.agent/workflows/guardian-check.md](file:///.agent/workflows/guardian-check.md) for all changes affecting `src/features/` or `server/`.
- **Compliance Audit**: Execute [.agent/workflows/verify-lcb-compliance.md](file:///.agent/workflows/verify-lcb-compliance.md) for all changes affecting `src/features/venues/` or `server/`.
- **Release Guardrails**: Execute [.agent/workflows/olybars-release-guardrails.md](file:///.agent/workflows/olybars-release-guardrails.md) for all changes affecting `src/features/` or `server/`.
- **Security Audit**: Execute [.agent/workflows/olybars-security-audit.md](file:///.agent/workflows/olybars-security-audit.md) for all changes affecting `src/features/` or `server/`.
- **Performance Audit**: Execute [.agent/workflows/olybars-performance-audit.md](file:///.agent/workflows/olybars-performance-audit.md) for all changes affecting `src/features/` or `server/`.
- **Accessibility Audit**: Execute [.agent/workflows/olybars-accessibility-audit.md](file:///.agent/workflows/olybars-accessibility-audit.md) for all changes affecting `src/features/` or `server/`.
- **Usability Audit**: Execute [.agent/workflows/olybars-usability-audit.md](file:///.agent/workflows/olybars-usability-audit.md) for all changes affecting `src/features/` or `server/`.
