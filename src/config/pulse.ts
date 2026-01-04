/**
 * OlyBars Pulse Logic Configuration
 * Single Source of Truth for "Buzz" calculations.
 */

export const PULSE_CONFIG = {
    // Scoring Weights
    POINTS: {
        CHECK_IN: 10.0,
        VIBE_REPORT: 5.0,
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
        PACKED: 100,   // > 100 = Packed
        BUZZING: 40,   // > 40 = Buzzing
        CHILL: 10,     // > 10 = Chill
        DEAD: 0,       // > 0 = Dead (Base state)
        FLASH_DEAL: 180, // < 180 mins remaining = Flash Deal
        BUZZ_CLOCK_PRIORITY: 240 // < 240 mins = High priority in list
    },

    // Display Strings (User/Owner Facing)
    DESCRIPTIONS: {
        LIVE_MEANING: "Unique people checked in within the last 60 minutes.",
        PACKED_MEANING: "Max energy! Extremely high attendance.",
        BUZZING_MEANING: "High activity! The venue is lively.",
        CHILL_MEANING: "Steady flow. Plenty of room to hang out.",
        DEAD_MEANING: "Minimal activity. Quiet vibes.",
        FLASH_DEAL_MEANING: "Ending soon! High urgency."
    }
};
