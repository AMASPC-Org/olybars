# OlyBars.com: The Nightlife Operating System
## Master Business Plan & Verification Strategy
**Version:** 2.0  
**Status:** Production Live  
**Date:** 2026-01-04

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Core Personas](#2-product-vision--core-personas)
3. [Business Strategy: Automated Compliance](#3-business-strategy-automated-compliance)
4. [Financial Moat: Zero-Cost Infrastructure](#4-financial-moat-zero-cost-infrastructure)
5. [Security & Trust Architecture](#5-security--trust-architecture)
6. [Brand & Growth Operations](#6-brand--growth-operations)
7. [Technical Advantage: The AI-Native Cloud](#7-technical-advantage-the-ai-native-cloud)
8. [Master Roadmap](#8-master-roadmap)
9. [Appendix A: The League Glossary](#9-appendix-a-the-league-glossary)
10. [Appendix B: Annual Membership Tiers](#10-appendix-b-annual-membership-tiers)
11. [Appendix C: Official Rulebook](#11-appendix-c-official-rulebook)
12. [Appendix D: The OlyBars Taxonomy](#12-appendix-d-the-olybars-taxonomy)
13. [Appendix E: Artie Venue Action Matrix](#13-appendix-e-artie-venue-action-matrix)
14. [Appendix F: OlyBars Sales Playbook](#14-appendix-f-olybars-sales-playbook)
15. [Appendix G: WSLCB Sales Compliance](#15-appendix-g-wslcb-sales-compliance)

---

## 1. Executive Summary
OlyBars is the **Nightlife Operating System for Olympia, WA**, built around the **Artesian Bar League**. It serves as a dual-sided marketplace:
*   **For Guests**: A gamified "pocket concierge" centered on real-time "Vibe" data.
*   **For Venue Owners**: An automated intelligence layer that operationalizes promotions and compliance via **The Brew House**.

**Key Value Proposition**: We don't sell data; we sell *answers*. Developed by the **American Marketing Alliance SPC** (Social Purpose Corporation), OlyBars eliminates the "Marketing Burn" for small businesses by automating discovery, distribution, and compliance.

---

## 2. Product Vision & Core Personas

### 2.1 The Mission
To differentiate between "being at a bar" and "playing a game." OlyBars creates a digital layer over the physical world that encourages social discovery without inducing irresponsible consumption.

### 2.2 User Archetypes & Access Hierarchy
OlyBars operates on a permission-gated hierarchy to ensure data integrity and compliance.

| Role | Access Level | Primary Product Surface | Key Actions |
| :--- | :--- | :--- | :--- |
| **Visitor** | Anonymous | Public Map / Venues | Browse vibes, view public profiles. |
| **Guest** | Authenticated | Member Profile | Save Favorites, track basic visit history. |
| **League Player** | Athlete | League HQ / Leaderboards | Earn Points, Claim Badges, Compete in Season. |
| **Partner** | Venue Owner | The Brew House | Manage Listing, Activate Deals, Add Menu Items. |
| **Super-Admin** | System Architect | Admin Dashboard | Global overrides, System health, Dispute resolution. |

> [!NOTE]
> **Super-Admin Access**: `ryan@amaspc.com` maintains master oversight. Use the `/api/admin/setup-super` endpoint with the `MASTER_SETUP_KEY` for manual elevation.

### 2.3 The AI Concierge: "Artie"
Anchoring the experience is **Artie**, the "Spirit of the Artesian Well." Artie is a **Dual-Core AI Agent** designed for frictionless interaction.

#### A. Player Concierge (The Guide)
Artie helps Guests and Players navigate the 98501:
*   **Vibe Discovery**: "Artie, where is it chill right now?"
*   **League Support**: "How many points do I need for the next badge?"
*   **Compliance Guardrails**: Proactively suggests safe rides (Lyft/Red Cab) during late-night queries.

#### B. Partner Co-pilot (The Operational Assistant)
Artie acts as a hands-free manager for busy Venue Owners via "The Brew House":
*   **Listing Management**: `update_hours`, `update_order_url`, `emergency_closure`.
*   **Menu Intelligence**: `add_menu_item`, `promote_menu_item`.
*   **Marketing Engine**: `schedule_flash_deal`, `draft_social_post`, `ideate_event`.
*   **Pit Rule Safety**: Artie *drafts* and *confirms* operational changes but requires a human "Confirm" tap before publishing live.

---

### 2.4 Product Surfaces

#### A. OlyBars Web App (The Client)
*   **Buzz Clock**: The real-time happy hour scheduler (Upcoming, Current, Soon-to-End).
*   **Vibe Signal**: Real-time energy status (Dead, Chill, Buzzing, Packed).
*   **League Passport**: Geolocation check-ins as attendance signals.
*   **Artie Chat**: Conversational UI for local discovery.

#### B. The Brew House (The Dashboard)
*   **Venue Profile (SSOT)**: Single source of truth for hours, menus, and local maker rules.
*   **Marketing Center**: Artie-generated social copy and "Flash Deal" (Bat Signal) activations.

---

## 3. Business Strategy: The AMA Network Logic

OlyBars.com is the lighthouse site of **The AMA Network** (American Marketing Alliance SPC). As a **Social Purpose Corporation**, our mission is to solve the "Marketing Burn"—the phenomenon where local businesses waste thousands on ineffective ads simply because they lack the time to manage complex marketing funnels.

### 3.1 Submit Once, Distribute Everywhere
We leverage automation to turn a single entry into a city-wide campaign:
*   **Artesian Bar League Calendar**: Instant visibility for events.
*   **The Weekly Pulse**: Automated inclusion in our high-engagement newsletter.
*   **Social Ad Copy**: Artie drafts specific ad descriptions for Facebook/Instagram based on the event vibe.

### 3.2 Automated Compliance (Legal Moat)
Legal compliance is our primary competitive advantage. By enforcing "Law-as-Code," we eliminate human error and protect our partners.
*   **The Smart Gatekeeper**: Users are mathematically capped at **2 check-ins per 12 hours** globally, satisfying Washington LCB "Anti-Volume" regulations.
*   **Separation of Church & State**: We maintain a strict firewall between **Venue Attendance** (compliance-heavy signals) and **League Participation** (skill-based gamification).

### 3.3 Fairness Algorithms (Exposure Equity)

To maintain a healthy, competitive ecosystem and prevent "The Drowning Effect" (where large or high-volume venues dominate visibility), OlyBars enforces algorithmic fairness through **Exposure Equity** within the **Buzz Clock** and **Pulse List**.

*   **Global 5-Minute Rotation**: The system applies a time-based "sliding window" to key visibility areas. Every 5 minutes, the internal priority logic for the **Buzz Clock** and the **Pulse List** shifts globally. This ensures that every active partner rotates through top-tier visibility multiple times per hour.
*   **The "Anti-Drowning" Logic**: Within the **Pulse List**, partners are prioritized at the top, but their internal order is shuffled every 5 minutes based on the system rotation. This prevents the same few venues from permanently occupying the top fold of the screen.
*   **Partner Fallback Visibility**: When user filters (e.g., searching for "Trivia") return no results, OlyBars does not show a blank screen. Instead, the **Pulse List** provides a rotating selection of partner venues, giving league members high-intent exposure even when they don't exactly match the current specific search.
*   **Deal Anti-Spam (Flash Deals)**: **Flash Deals** and Happy Hour items are sorted by *urgency* and *relevance* rather than bidding. The rotation ensures that a neighborhood pub’s deal has the same visibility opportunities as a larger downtown venue.

---

## 4. Technology & Infrastructure Strategy
We have engineered a "Zero-Weight" architecture that maximizes performance while minimizing fixed costs. This creates a sustainable specific financial moat that competitors using traditional software cannot match.

> **Note for Tech Teams**: Full engineering specifications are available in [System_Architecture_Master.md](specs/System_Architecture_Master.md).

### 4.1 The "Cloud-Native" Advantage
Instead of renting expensive dedicated servers that sit idle during the day, OlyBars is built on **Serverless Technology (Google Cloud Platform)**.
*   **Scale-to-Zero**: When no one is using the app (e.g., 4 AM on a Tuesday), our infrastructure costs drop to near $0.
*   **Infinite Scale**: When the "Buzz" hits (e.g., Friday night at 10 PM), the system automatically expands to handle thousands of users instantly.

### 4.2 Financial Moat: The $0.00 Operating Model
By leveraging "Free Tier" enterprise quotas, we achieve a cost structure that allows us to be profitable with just a handful of partner venues.
*   **Identity & Security**: SMS/Phone Auth secured for **Free (up to 10k users)**.
*   **Real-Time Engagement**: Push technology for thousands of users at **Zero Cost**.

### 4.3 Signal Integrity (Real-World Accuracy)
Since not everyone has location services enabled, OlyBars cross-references three critical data points (The "Holy Trinity" of Signals) to determine the "Current State":
1.  **Clock-ins**: High-intent attendance verification (The "Gold Standard").
2.  **Vibe Checks**: Manual "Ground Truth" reports from users on the floor.
3.  **Venue Capacity**: The denominator for density. Knowing a venue holds 50 people allows 15 verified check-ins to correctly register as "Buzzing" (30%), whereas the same 15 people in a 300-person hall would remain "Chill" (5%).

---

## 5. Security & Trust Architecture
We treat partner strategy and user privacy as sacred. Our "Fort Knox" approach is critical for B2B sales.

### 5.1 The "Venue Confidentiality" Promise (B2B)
*   **Zero-Trust Separation**: Partner data (Margins, Strategy) is physically segregated from Public data in **The Brew House**.
*   **MFA Mandate**: Venue Owners *must* use Multi-Factor Authentication.
*   **RBAC**: Role-Based Access Control ensures owners only see *their* data.

### 5.2 The Compliance Shield (B2C)
*   **Transparent Geofencing**: GPS is used *only* for "Proof of Presence" verification.
*   **Cookie Minimalization**: Only essential state (Login, Age Gate).
*   **In-App Policy Hub**: Accessible `/security`, `/cookies`, `/privacy`.

### 5.3 Operational Resilience
*   **Secrets Management**: All API keys in Google Secret Manager.
*   **Audit Trails**: Immutable logs for all "Flash Deal" and "Vibe Check" events to resolve disputes.

---

## 6. Brand & Growth Operations

### 6.1 SEO & Discoverability
*   **Metadata Strategy**: "Know before you go." Titles include `Olympia, WA` and `98501`.
*   **Local Maker's Trail**: Highlight venues supporting regional brewers and roasters.

### 6.2 Prize Governance
We reward with **League Bucks** (Generic Gift Cards), not alcohol.
*   **Legal**: Gift cards are financial instruments, not "free booze."
*   **Brand**: Protects partners from LCB advertising violations.

---


## 7. Technical Advantage: The AI-Native Cloud

OlyBars.com is not a traditional web app. It is a **Google Cloud AI-Native** platform, leveraging "Antigravity" architecture to run at near-zero cost while scaling infinitely.

### 7.1 The Stack (Google Cloud Platform)
We bypass traditional server management ("DevOps") by using fully managed, serverless infrastructure.
*   **Compute**: **Google Cloud Run** (Containers that scale to zero when unused).
*   **Database**: **Firebase Firestore** (NoSQL, real-time syncing, offline-capable).
*   **Edge Logic**: **Cloud Functions** (Event-driven triggers for "Vibe Checks" and notifications).
*   **AI Engine**: **Gemini 1.5 Flash** (via Vertex AI) powers "Artie" for RAG-based local knowledge.

### 7.2 Why This Matters for the Business
*   **Reliability**: Google's own global infrastructure handles our uptime. We don't wake up at 3 AM to restart servers.
*   **Speed**: "Edge Caching" ensures the site loads instantly, even in crowded bars with poor signal.
*   **Security**: We inherit Google's banking-grade security model (IAM, Secret Manager, Firewall).

### 7.3 Artie: The Intelligence Layer (V1.2 Status)
Artie is the "Spirit of the Artesian Well," serving as the LLM-powered engine for RAG (Retrieval Augmented Generation) across the platform.

#### Current Skills (Live)
*   **⚡ Flash Deal Architect**: Automates deal creation with strict 180-minute lead-time enforcement and WSLCB compliance checks.
*   **📅 Event Secretary**: Converts simple prompts or links into structured calendar events with AI-generated descriptions.
*   **🛡️ Compliance Guardian**: Automatically pivots non-compliant marketing language (e.g., "bottomless") to safe alternatives (e.g., "tasting flight").
*   **🔍 Local RAG**: Real-time awareness of Olympia venues, maker culture, and the Artesian Bar League rulebook.

#### Skill Architecture
Artie operates using a **"Skills & Protocols"** framework. Every action (skill) is governed by a protocol that requires specific data validation (params) before an `[ACTION]` tag is produced for the frontend to execute.

---

---

## 8. Master Roadmap

### 8.1 Status: **PRODUCTION LIVE** 🚀
*   **Domain**: [olybars.com](https://olybars.com)
*   **Stack**: See [System_Architecture_Master.md](specs/System_Architecture_Master.md)

### 8.2 Completed Milestones
*   ✅ **Core Engine**: Standardized `venues`, `signals`, and `users`.
*   ✅ **The Brew House**: Integrated owner dashboard.
*   ✅ **Geofencing**: Backend-verified check-ins.
*   ✅ **Artie Intelligence**: Level 1 RAG (Persona responses).
*   ✅ **Security Framework**: MFA, RBAC, and Policy Docs.

### 8.3 Imminent Objectives (Artie V2.0 Roadmap)
1.  **Phase 6: The League Season 1**: Finalize points-to-prizes logic.
2.  **Phase 7: Artie Pro (The Partner Co-pilot)**: 
    *   **Holistic Listing Management**: "Artie, update my hours for tonight" or "Add a website link."
    *   **Menu Intelligence**: "Artie, add a local IPA to the drafts list" or "Promote our burgers."
    *   **Voice/Audio Pipeline**: Direct voice-to-action interface for busy bartenders/owners.
    *   **Flash Deal Ideas**: AI suggestions based on slow nights and venue-specific data.
3.  **Phase 8: Mobile Native**: Progressive Web App (PWA) "Add to Home Screen" optimization.

---

## 9. Appendix A: The League Glossary

### 9.1 User Taxonomy
*   **User**: Any human interacting with OlyBars.com.
*   **Visitor**: A User who is browsing anonymously (not logged in).
*   **Guest**: A User who has authenticated (logged in) but has not yet joined the League.
*   **League Player**: A registered patron (User) who has officially joined the League. Players earn points, track progress, and unlock digital trophies (Badges). (Formerly referred to as Member).
*   **Venue Owner**: The human operator authorized to manage a venue's profile. This is the person who performs the login action to access The Brew House.
*   **Super-Admin**: The platform lighthouse (typically `ryan@amaspc.com`). Has global authorization to manage any venue, override system settings, and enforce fair play standard across the entire AMA Network.
*   **Listed Venue**: A physical location (bar/pub) that appears on the OlyBars map but has not yet claimed their profile or joined the League as a Partner.
*   **League Partner**: A venue that has claimed their profile and entered into a marketing agreement with the League. Includes all active tiers: Free, DIY, Pro, and Agency.

### 9.2 Key Concepts
*   **Artie**: The spirit of the Artesian Well. A permission-gated AI agent that acts as a concierge for Players and a drafter/co-pilot for Partners.
*   **Current State**: The real-time energy level of a venue (Dead, Chill, Buzzing, Packed). Calculated via the three primary signals: Clock-ins, Vibe Checks, and Venue Capacity.
*   **The Weekly Pulse**: The official Artesian Bar League newsletter.
*   **The Brew House**: The Partner Portal. The dashboard where Venue Owners manage their profile, listings, events, and "Flash Deal" activations.
*   **Venue Capacity**: A static data point representing the legal or practical occupancy of a venue. This serves as the baseline for determining density and busyness levels.
*   **Vibe Check**: A manual "Ground Truth" report submitted by a user. Essential for accurate data when GPS density is low.
*   **The 60-Second Handover**: The streamlined onboarding process for a Venue Owner to claim a Listed Venue and convert it into a League Partner.
*   **Partner Status**: The active subscription tier of a League Partner: Free (Claimed), DIY Toolkit, Pro League, or Agency Legend.
*   **Local Maker**: Regional producers (Brewers, Roasters) celebrated on the "Local Maker's Trail."
*   **The AMA Network**: Powered by the American Marketing Alliance SPC. A network of event-based sites designed to automate marketing for local businesses.
*   **The Manual**: The official name for the OlyBars app/website ("The Artesian Bar League Manual").

---

## 10. Appendix B: Annual Membership Tiers

| Tier Name | Monthly | Badge | Key Features | "One-Click" Sell |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Free** | Free | "The List" | Basic Listing, Buzz Clock Inclusion | "Get listed, get found." |
| **Tier 2: DIY** | $99 | "The Operator" | 1 Flash Deal/mo, Manual Dashboard | "Tap 'Flash Deal' and boom—you're live. No typing." |
| **Tier 3: Pro** | $399 | "The Competitor" | 4 Flash Deals/mo, **2x Point Bank**, Content Engine | "Dominate the 98501. Double our points at your spot." |
| **Tier 4: Agency** | $799 | "The Anchor" | Unlimited Deals, **4x Point Bank**, Auto-Sync Vibe | "Massive player incentive. Host the big events." |

---

## 11. Appendix C: Official Rulebook

### 1. Scoring Mechanics
* **Clock In:** 10 Points. Requires geolocation verification within 100ft of the venue.
* **Vibe Check:** 5 Points. Confirm energy levels to update the city map.
* **Marketing Bonus:** +15 Points. Grant consent to display your vibe photo on the venue profile.
* **Game Vibe Check:** +2 Points per game status updated (Max 10 per check).

### 2. Velocity & Safety (LCB Compliance)
* **Nightly Cap:** You may clock into a maximum of **2 venues** per 12-hour window.
* **Cool-down:** The system prevents rapid-fire point accumulation.
* *Why?* To encourage enjoying the venue, not just sprinting for points. We build for vibes, not over-consumption.

### 3. Disqualification
* Any use of GPS spoofers, emulators, or account sharing results in a Season Ban.
* Harassment of venue staff or other players results in a permanent platform ban.
* Excessive false reporting will result in a point reset.

---

## 12. Appendix D: The OlyBars Taxonomy

### 1. PLAY (Interactive)
*Definition*: Items physically present 24/7 or during open hours.
* **Skill / Barcade**: Pinball, Pool / Billiards, Darts, Arcade Cabinets, Skee-Ball, Foosball, Shuffleboard.
* **Social**: Cornhole, Giant Jenga, Ring Toss, Board Games, Dice Kits.
* **Chance**: Pull Tabs, Lottery Kiosk.

### 2. FEATURES (The Setup)
*Definition*: Permanent hardware or architectural elements that define the space.
* **Vibe Hardware**: Dance Floor, Stage, DJ Booth, Jukebox, Piano.
* **Comfort**: Patio / Beer Garden, Fireplace, Photo Booth, TV Walls.

### 3. EVENTS (Calendar)
*Definition*: Activities linked to specific times on the League Calendar.
* **Competition**: Trivia Night, Bar Bingo, League Night, Tournaments.
* **Performance**: Karaoke, Open Mic, Live Band, DJ Set, Theme Night, Viewing Party.

---

## 13. Appendix E: Artie Venue Action Matrix

### 13.1 Executive Summary
This document maps the operational needs of Venue Owners to specific **Artie Capabilities**. It defines the "Intents" Artie must recognize and the "System Actions" (Backend Functions) executed in response. It also establishes the **Vibe Decay Logic**, ensuring real-time data remains accurate without constant manual updates.

### 13.2 Core Listing Management (The "Profile")
*Goal: Remove friction from keeping static data current.*

| Owner Intention ("Hey Artie...") | System Action | Data Impact |
| :--- | :--- | :--- |
| "Update my hours for Saturday." | `updateVenueSchedule(day, hours)` | Updates Firestore `venues/{id}` |
| "Update my website link." | `updateVenueField(field, value)` | Updates Firestore `venues/{id}` |
| "Here is my new Happy Hour menu." | `ingestMenu(image/text)` | OCR/LLM parses text $\rightarrow$ Updates `venues/{id}/menu` |
| "Change my description." | `updateVenueDescription(text)` | Updates `venues/{id}/description` |
| "What do I look like on the app?" | `previewListing()` | Generates a preview link/card |

### 13.3 Marketing & The "Buzz" (Growth)
*Goal: Fill seats during slow periods and leverage the OlyBars network.*

| Owner Intention ("Hey Artie...") | System Action | Data Impact |
| :--- | :--- | :--- |
| "I want to do a Flash Deal." | `createFlashDeal(offer, duration)` | Creates `events` record, triggers Push Notification (if high tier) |
| "Draft a social post about Trivia." | `generateSocialCopy(topic)` | LLM generation (No DB write, just UI return) |
| "Show me this week's Weekly Buzz." | `fetchNewsletter(latest)` | Retrieves cached newsletter content |
| "Are there any new bars in town?" | `fetchMarketIntel(new_listings)` | Queries `venues` sorted by `createdAt` |

### 13.4 Operational & Real-Time Vibe (The "Pulse")
*Goal: Accuracy of real-time signals (`vibe_checks`). Requires strict Decay Logic.*

#### A. Owner Overrides
Owners typically intervene to **correct** inaccurate user data.

| Owner Intention ("Hey Artie...") | System Action | Logic / Constraint |
| :--- | :--- | :--- |
| "Nobody is playing pool right now." | `resetAssetStatus('pool_table')` | **Immediate**: Sets `status: available`, clears active check-ins. |
| "We are at capacity / There's a line." | `setVenueStatus('packed')` | **Overrides** calculated Buzz Score for set duration (e.g., 2 hrs). |
| "It's dead in here." | `setVenueStatus('chill')` | **Overrides** calculated Buzz Score. |
| "Kitchen is closed early." | `updateServiceStatus('kitchen', 'closed')` | Updates real-time flags, distinct from standard hours. |

#### B. The "Vibe Decay" Logic (Time-To-Live)
To ensure accuracy, every "Active" Vibe Check has a specific TTL (Time To Live) based on the nature of the activity.

| Asset / Activity | Estimated Duration (TTL) | Rationale |
| :--- | :--- | :--- |
| **Pool Table** | **15 Minutes** | Average game time. Status resets to "Unknown" after 15m. |
| **Dart Board** | **15 Minutes** | Short turnover time. |
| **Karaoke Queue** | **30 Minutes** | Queue length changes rapidly. |
| **Live Band / Set** | **45 Minutes** | Sets usually last 45m-1h. |
| **Trivia Game** | **90 Minutes** | Long-form event; check-in remains relevant longer. |
| **"Packed" Crowd** | **60 Minutes** | Crowds disperse; requires re-verification after an hour. |

---

## 14. Appendix F: OlyBars Sales Playbook
**Purpose: Diagnosing venue types and delivering the correct "One-Click" pitch.**

### 14.1 Phase 1: The Diagnosis (The Fork in the Road)
*Visual Cue: Does the venue have a full kitchen?*

*   **IF YES: "THE MARGIN PLAY" (Food Bars/Gastropubs)**
    *   *Target Profile*: Hannah's, Well 80, Spar, Rumors.
    *   *The Pain Point*: "People buy cheap beer, not my high-end food."
    *   *The Pitch*: "We automate your upselling. We attach 'League Bounties' to your high-margin food items. Players buy the burger to get the Badge."
    *   *The Result*: Higher Check Average.

*   **IF NO: "THE TRAFFIC PLAY" (Drink/Dive Bars)**
    *   *Target Profile*: Brotherhood, McCoy's, Eastside, Legends.
    *   *The Pain Point*: "My room is empty on Tuesdays."
    *   *The Pitch*: "We automate your door traffic. We put a 'Point Bounty' on your venue for Tuesday at 5 PM. Players show up just to collect the points."
    *   *The Result*: Filled Stools (Volume).

### 14.2 Phase 2: Selling the "One-Click" Automation
Owners hate "marketing" because it feels like homework. We offer "Bubbles" on their dashboard: **[Flash Deal]**, **[Add Event]**, **[Boost Vibe]**.

*   *The Script*: "I know you don't have time to write emails. That's why we built the One-Click system. You see the slow Tuesday, you tap 'Flash Deal'. Artie asks 'Food or Cover?'. You tap 'Food'. Done. Artie instantly pushes a 'Double Points on Apps' alert to everyone nearby. You didn't type a thing."

---

## 15. Appendix G: WSLCB Sales Compliance
**Purpose: Keeping the sales pitch legal and protecting the brand.**

1.  **THE "MARGIN PLAY" RULE**: When pitching "Menu Optimization," ALWAYS use food items as examples (Burgers, Apps, Mocktails). NEVER use "Double Points for Double Shots." *Safe Phrase*: "Increase check average through food and merch attachment."
2.  **THE "TRAFFIC PLAY" RULE**: Focus on "Visits" and "Dwell Time." NEVER promise "We will get them to drink more." *Safe Phrase*: "We get them in the door; your service keeps them there."
3.  **TIED HOUSE WARNING**: We cannot pay a venue to carry specific alcohol brands. We cannot guarantee a specific volume of alcohol sales.
