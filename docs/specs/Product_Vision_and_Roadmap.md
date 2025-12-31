# Product Vision & Roadmap

This document defines the core mission of OlyBars, the people we build for, and our trajectory for growth.

---

## 1. Executive Summary: The Nightlife Operating System
OlyBars is the **Nightlife Operating System for Olympia, WA**, built around the **Olympia Bar League**. 

The platform is anchored by **Artie**, an AI agent (the "Spirit of the Artesian Well") who acts as a concierge for guests and a co-pilot for bar owners.

### 1.1 Core Value Proposition
*   **For Guests (League Players)**: Answering "Where should we go tonight?" with real-time "Vibe" data and gamified league incentives (points, leaderboards).
*   **For Owners (League Members)**: Providing a "Hyper-Local Intelligence Layer" that fills slow nights, operationalizes promotions, and converts casual traffic into regulars.

## 2. Core User Personas

### 2.1 The League Player (Guest)
*   **Profile**: 21+ residents/visitors going out 1–3 nights/week.
*   **Motivation**: Finding the "right vibe" (Buzzing vs. Chill), earning points, and social discoverability.
*   **Interaction**: Mobile-first web app. Checks "Buzz," logs check-ins, and interacts with Artie.

### 2.2 The Venue Owner / GM (League Member)
*   **Profile**: Busy, tech-averse operators of independent venues (e.g., Brotherhood, Well 80).
*   **Motivation**: Filling seats on slow nights, simplified marketing, and actionable local data.
*   **Constraint**: "Zero-Click Intelligence"—if it requires daily manual effort, it fails.
*   **Interaction**: Command Center dashboard for managing profiles, "Bat Signal" promos, and intel reports.

### 2.3 Venue Staff / Managers
*   **Profile**: Bartenders, floor managers, and security.
*   **Motivation**: Managing crowd flow and reporting real-time vibe status.
*   **Interaction**: Simplified "Vibe Reporter" view within the Command Center.

### 2.4 League HQ (Ops)
*   **Profile**: Internal admin (Ryan + CTO).
*   **Motivation**: Platform stability, data integrity, and fair play enforcement.

## 3. Product Surfaces

### A. OlyBars Web App (The Client)
*   **Buzz Clock**: Real-time vibe status (Chill, Lively, Buzzing).
*   **League Passport**: Geolocation check-ins.
*   **Artie Chat**: Conversational UI for local discovery.

### B. Owner Command Center (The Dashboard)
*   **Venue Profile (SSOT)**: Single source of truth for hours, menus, and rules.
*   **Marketing Center**: AI-generated social copy and "Flash Deal" (Bat Signal) activations.
*   **Intel Deck**: Comparative performance metrics and visitor sentiment.

## 4. Strategic Principles
1.  **Operationally Realistic**: Automate owner tasks. "We don't give you data; we give you answers."
2.  **Mobile-First**: 95% of traffic is mobile, often in low-light environments. UI must be high-contrast and thumb-friendly.
3.  **Privacy-First**: Stalking prevention (fuzzy location) and PII minimization (no selling data).
4.  **Local Mastery**: Focused exclusively on Olympia, WA. "Pivot" non-local queries back to local alternatives.

## 5. Master Roadmap & Status

### 5.1 Project Status: **PRODUCTION LIVE** 🚀
*   **Backend**: Cloud Run (Active)
*   **Frontend**: Firebase Hosting (Active)
*   **Domain**: [olybars.com](https://olybars.com)

### 5.2 Completed Milestones
*   ✅ **Structural Realignment**: Feature-based architecture and Tailwind CSS configuration.
*   ✅ **Core Engine**: Standardized patterns for `venues`, `signals`, and `users`.
*   ✅ **Geofencing & Buzz**: Backend-verified check-ins and density-based sorting.
*   ✅ **Artie Intelligence**: Level 1 RAG with persona-driven response profiles.
*   ✅ **Multi-site Deployment**: `dev` vs `prod` pipelines with GitHub Actions.

### 5.3 Next High-Level Objectives
1.  **Phase 6: The League Season 1**: Finalize points-to-prizes logic and season-based leaderboards.
2.  **Phase 7: Artie Pro**: Activate Level 2 RAG with personalized user history (tastes/preferences).
3.  **Phase 8: Mobile Native (Web-Wrapped)**: Add-to-Home-Screen optimization and manifest refinement.
