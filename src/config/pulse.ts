/**
 * OlyBars Pulse Logic Configuration
 * Single Source of Truth for "Buzz" calculations.
 */

export const PULSE_CONFIG = {
    // Scoring Weights
    POINTS: {
        CHECK_IN: 10.0,
        VIBE_REPORT: 3.0,
        PHOTO_VIBE: 10.0,
        VERIFIED_BONUS: 15.0 // For verified QR/GPS consent
    },

    // Time Windows (in milliseconds)
    WINDOWS: {
        LIVE_HEADCOUNT: 60 * 60 * 1000, // 60 Minutes (Rolling Window for Count)
        VIBE_REPORT: 45 * 60 * 1000, // 45 Minutes (Duration of manual vibe/status)
        BUZZ_HISTORY: 12 * 60 * 60 * 1000, // 12 Hours (Lookback for Score)
        STALE_THRESHOLD: 10 * 60 * 1000, // 10 Minutes (Trigger background refresh)
        DECAY_HALFLIFE: 60 * 60 * 1000, // 60 Minutes (Score drops by 50%)
        LCB_WINDOW: 12 * 60 * 60 * 1000, // 12 Hours (WA State LCB Compliance)
        CHECK_IN_THROTTLE: 120 * 60 * 1000, // 120 Minutes (2 Hour Cooldown)
        SAME_VENUE_THROTTLE: 360 * 60 * 1000 // 360 Minutes (6 Hour Cooldown)
    },

    // Spatial Thresholds
    SPATIAL: {
        GEOFENCE_RADIUS: 100 // 100 Meters for valid check-in
    },

    // Status Thresholds
    THRESHOLDS: {
        BUZZING: 60, // > 60 = Buzzing
        LIVELY: 20,  // > 20 = Lively
        FLASH_DEAL: 180, // < 180 mins remaining = Flash Deal
        BUZZ_CLOCK_PRIORITY: 240 // < 240 mins = High priority in list
    },

    // Display Strings (User/Owner Facing)
    DESCRIPTIONS: {
        LIVE_MEANING: "Unique people checked in within the last 90 minutes.",
        BUZZING_MEANING: "High activity! Approx. 6+ recent people.",
        LIVELY_MEANING: "Steady flow. Approx. 2-3 recent people.",
        CHILL_MEANING: "Relaxed atmosphere. Count is low.",
        FLASH_DEAL_MEANING: "Ending soon! High urgency."
    }
};
