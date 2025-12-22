# Contextual UX Logic Rule

## Objective
Ensure the OlyBars platform provides a seamless, personalized experience across all user states and device types.

## Logic
Every implementation plan and UI design MUST explicitly define variations for the following contexts:
1. **Device Type**: 
   - Mobile: Focus on touch targets, stack layouts, and bottom navigation.
   - Desktop: Focus on data density, hover states, and sidebar navigation.
2. **Authentication State**:
   - Logged-out (Guest): Focus on 
Join
Now CTAs, previewing features, and standard login/onboarding.
   - Logged-in: Focus on personalized data, profile quick-links, and activity history.
3. **League Membership**:
   - Non-Member: Display Join
the
League promotions, prizes overview, and benefits.
   - League Member: Display current rank, seasonal points, specific league events, and HQ status.

## Enforcement
- UI components MUST handle these states gracefully via props or context.
- Hardcoded guest/member content is prohibited; always use state-driven logic.
