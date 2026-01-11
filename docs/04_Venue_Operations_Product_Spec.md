# Venue Operations: Product Specification
**Version:** 1.0
**Status:** Initial Draft

## 1. Introduction
This document outlines the operational protocols and standards for venues participating in the OlyBars network. It focuses on maintaining data integrity and providing a consistent, high-quality experience for League Players.

---

## 4.X The Back Room Protocols
"The Back Room" is a dedicated directory within OlyBars designed to highlight private inventory, nooks, and rental rooms available for squads and parties.

### 4.X.1 Definition of a "Back Room"
To be listed in The Back Room directory, a space must meet at least one of the following criteria:
*   **Private Room**: A fully enclosed space with a door that can be rented or reserved.
*   **The Nook**: A semi-private, demarcated area (e.g., a raised booth area or specialized "corner") that offers a distinct experience from the main floor.
*   **Rental Inventory**: Any space that requires a deposit or minimum spend for exclusive use.

### 4.X.2 Partner Responsibilities
Venue owners are responsible for the following:
*   **Accuracy**: Ensure the `capacity` and `description` are operationally accurate. Do not over-promise space.
*   **Booking Integrity**: If a space is reservable, a valid `bookingLink` (e.g., to Resy, Tock, or a custom form) must be provided.
*   **Vibe Matching**: Descriptions should specify the "vibe" (e.g., "Quiet for meetings" vs. "Loud for parties").

### 4.X.3 Operational Realistic Workflow
We focus on **Low-Friction** management:
1.  **Static Listings**: The Back Room is primarily a directory. We do not manage the real-time calendar *inside* OlyBars (to avoid double-booking errors).
2.  **Handoff**: All booking intent should be handed off to the venue's existing reservation system via the `bookingLink`.
3.  **No Manual Entry**: Owners should not be required to manually "open" or "close" the room in OlyBars daily. Any temporary closures should be noted in the `description`.
