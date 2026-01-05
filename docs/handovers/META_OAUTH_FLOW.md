# Handover: Meta Integration (Artie Social Engine & User Auth)

## Objective
Implement a dual-track Meta integration:
1. **Venue-to-OlyBars (Business Logic)**: Connect venue's Instagram/Facebook business accounts for Artie's auto-sync engine.
2. **User-to-OlyBars (Authentication)**: Allow general players to log in using Facebook/Instagram.

## The "Two Worlds" of Meta Integration

### World A: Venue Content Sync (The Marketing Co-Pilot)
- **Goal**: Give Artie access to the venue's public data (IG posts, FB events).
- **Complexity**: High. Requires FB Business Login, Token Exchange (Short -> Long-lived), and Page-to-IG ID mapping.
- **Storage**: Tokens are stored in the `venues` collection (encrypted).

### World B: Player Authentication (The Social Login)
- **Goal**: Let users log in with Facebook (similar to our Google flow).
- **Complexity**: Low. Handled via Firebase Authentication.
- **Storage**: Auth state is managed by Firebase.

## Current State
- **Schema**: `src/types/venue.ts` already contains the `MetaSyncConfig` interface and `metaSync` field in `PartnerConfig`.
- **Taxonomy**: `src/types/taxonomy.ts` is finalized with the 5-pillar structure for event classification.
- **Service Skeleton**: `server/src/services/SocialManager.ts` exists as a pseudocode skeleton ready for implementation.

## Technical Requirements & Complexity
> [!NOTE]
> **Complexity Level**: Moderate. The challenge isn't the OAuth redirect, but the "Token Exchange" logic:
> 1. User Authenticates via Facebook Login.
> 2. Exchange Short-lived User Token for a **Long-lived User Token** (60 days).
> 3. List the User's Facebook Pages.
> 4. Identify the **Instagram Business Account** linked to a specific Page.
> 5. Generate a **Page Access Token** for background sync.

### Required Permissions (Meta Developer Portal)
- `public_profile`
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `instagram_basic`
- `instagram_content_publish` (for future writing)

## Proposed Architecture

### 1. Frontend (The Handshake)
- Location: `ListingManagementTab.tsx` or a new `SocialSyncTab.tsx`.
- Component: A "Connect Instagram" button that initiates the `window.location` redirect to Meta's Dialog.
- Callback: A route like `/oauth/callback` that captures the `code` and sends it to the OlyBars backend.

### 2. Backend (The Vault)
- Endpoint: `POST /api/venue/auth/meta/exchange`
- Logic:
    - Receive OAuth code.
    - Call Meta's `/oauth/access_token` to get User Token.
    - Exchange for long-lived token.
    - Query `/me/accounts` to find the Page ID and IG Business ID.
    - **Encryption**: Encrypt the `accessToken` before storing it in Firestore (`venues/{venueId}/partnerConfig/metaSync`).

## Immediate Next Steps

### Track A: Venue Sync
1. Implement the Backend `metaAuthController.ts` for the token exchange loop.
2. Verify the link by fetching the first 3 Instagram posts.

### Track B: User Auth
1. Enable the **Facebook Provider** in the Firebase Console.
2. Add `signInWithFacebook()` to `AuthService.ts`.
3. Add a "Facebook" button to the `LoginScreen`.

## Reference Files
- [venue.ts](file:///c:/Users/USER1/olybars/src/types/venue.ts) (Fields: `PartnerConfig.metaSync`)
- [taxonomy.ts](file:///c:/Users/USER1/olybars/src/types/taxonomy.ts) (The classification target)
- [SocialManager.ts](file:///c:/Users/USER1/olybars/server/src/services/SocialManager.ts) (The implementation site)
- [Master_Business_Plan.md](file:///c:/Users/USER1/olybars/docs/Master_Business_Plan.md) (Section 3.1: Distribution Strategy)
