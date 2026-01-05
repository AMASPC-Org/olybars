export type VibeLevel = 'dead' | 'chill' | 'buzzing' | 'packed';

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
        GEOFENCE_RADIUS: 22 // 22 Meters (approx. 75ft) to prevent crosstalk
    },

    // Status Thresholds
    THRESHOLDS: {
        PACKED: 90,    // > 90 = Packed (Triggers SMS)
        BUZZING: 60,   // > 60 = Buzzing (Busy but no SMS)
        CHILL: 20,     // > 20 = Chill
        DEAD: 0,       // > 0 = Dead (Base state)
        FLASH_BOUNTY: 180, // < 180 mins remaining = Flash Bounty
        BUZZ_CLOCK_PRIORITY: 240 // < 240 mins = High priority in list
    },

    // Consensus Algorithm (User-Generated Pulse)
    CONSENSUS: {
        CHECKINS_REQUIRED: 3,      // 3 Unique users
        CHECKIN_WINDOW: 15 * 60 * 1000, // 15 Minutes
        VIBE_REPORTS_REQUIRED: 2,   // 2 Unique users reporting 'Packed'
        VIBE_WINDOW: 10 * 60 * 1000     // 10 Minutes
    },

    // Display Strings (User/Owner Facing)
    DESCRIPTIONS: {
        LIVE_MEANING: "Unique people checked in within the last 60 minutes.",
        DEAD_MEANING: "Quiet. Quick service. < 20% cap.",
        CHILL_MEANING: "Easy conversation. Date night vibes.",
        BUZZING_MEANING: "High energy. Tables full.",
        PACKED_MEANING: "Standing room only. The party is here.",
        FLASH_BOUNTY_MEANING: "Ending soon! High urgency."
    }
};
