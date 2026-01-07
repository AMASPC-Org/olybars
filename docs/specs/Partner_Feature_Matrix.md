# Partner Feature Matrix: The Nightlife Operating System
**Version:** 1.0 (Core Engine)
**Status:** Living Knowledge Base
**Target Consumers:** Artie AI, Partner Sales, Venue Onboarding

---

## Executive Summary
This matrix serves as the **Single Source of Truth (SSOT)** for all OlyBars partner features. It bridges the gap between high-level business goals and technical system logic. AI agents (Artie, Antigravity) should use these definitions to enforce consistency across responses and system actions.

---

## 1. Core Feature Pillars

### Pillar 1: Presence & Attendance (The Game)
| Feature | Intent (User Goal) | System Logic (Technical) | Data Signals | Sales Value (The Pitch) | Artie Protocol |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Clock-In** | Verify real-world attendance. | GPS verification within 100ft. | `users/{uid}/stats/seasonPoints` | "We drive verified, physical traffic, not just digital impressions." | N/A |
| **Vibe Check** | Report real-time energy. | Crowdsourced ground truth (15m-60m TTL). | `vibe_score`, `buzz_decay` | "Your venue is never 'dead' if the energy is right." | `setVenueStatus` |
| **League Standing** | Track local status. | Real-time leaderboard query. | `users` collection order | "Turn your regulars into city-wide champions." | `fetchStandings` |

### Pillar 2: Velocity & Traffic (The Steering Wheel)
| Feature | Intent (User Goal) | System Logic (Technical) | Data Signals | Sales Value (The Pitch) | Artie Protocol |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Flash Bounty** | fill empty seats immediately. | points-based incentive with push alerts. | `events` (type: flash) | "An emergency steering wheel to fill your room on a slow Tuesday." | `createFlashBounty` |
| **Buzz Clock** | Automate FOMO. | Countdown-based deal visibility. | `venues/{id}/hours`, `specials` | "Ensure your happy hour is seen right when people are deciding." | `updateVenueSchedule` |
| **Time Bounty** | Incentivize specific slots. | Point multipliers for 120-180m windows. | `point_bank_transactions` | "Move the crowd precisely when you need them." | `createTimeBounty` |

### Pillar 3: Automation & Growth (The Co-Pilot)
| Feature | Intent (User Goal) | System Logic (Technical) | Data Signals | Sales Value (The Pitch) | Artie Protocol |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Artie Co-Pilot** | Eliminate "Marketing Burn". | Multimodal LLM (Gemini 1.5 Flash). | `social_drafts`, `lastArtieDraft` | "OlyBars is the marketing co-pilot you can't afford to hire." | `ArtieSkillRegistry` |
| **Meta Sync** | Submit once, distribute everywhere. | IG/FB Read-Write Graph API. | `venues/{id}/meta_config` | "Update your bar in one place; we handle the rest of the web." | `syncSocialFeed` |
| **Press Agent** | Professional distribution. | Automated press release drafting/email. | `media_contacts` | "Get your events featured in Thurston Talk and VCB automatically." | `distributeEvent` |

---

## 2. Global Logic & Thresholds
These constants govern how features interact with each other.

| Logic Name | Value | Description |
| :--- | :--- | :--- |
| **Rule of Two** | 2 / 12 Hours | Max global clock-ins to prevent "Point Chasing" and over-consumption. |
| **Buzz Decay** | 50% / 60 Mins | Vibe Checks lose half their weight every hour to ensure signal freshness. |
| **Bounty Lead-Time** | 180 Mins | Default max duration for a Flash Bounty to maintain urgency. |
| **Signal Trinity** | Clock-In + Vibe + Capacity | The formula for calculating the "Real-Time Pulse" status. |

---

## 3. Operational Integrity
- **LCB Compliance**: Points are never directly tied to alcohol volume. Features must pivot to "Vibe" and "Presence."
- **Data Segregation**: Point Banks and Margins are stored in `private_data` and never exposed to the public API.
- **Fairness Rotation**: The Buzz Clock rotates visibility every 5 minutes to prevent "Drowning" of smaller partners.
