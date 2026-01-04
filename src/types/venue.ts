export type VenueStatus = 'dead' | 'chill' | 'buzzing' | 'packed';

export enum PartnerTier {
    FREE = 'FREE',    // 1 Token/mo
    DIY = 'DIY',      // 2 Tokens/mo
    PRO = 'PRO',      // 4 Tokens/mo
    AGENCY = 'AGENCY' // 8 Tokens/mo
}

export const TIER_LIMITS: Record<PartnerTier, number> = {
    [PartnerTier.FREE]: 1,
    [PartnerTier.DIY]: 2,
    [PartnerTier.PRO]: 4,
    [PartnerTier.AGENCY]: 8
};

export interface PartnerConfig {
    tier: PartnerTier;
    billingCycleStart: number; // Timestamp for monthly reset
    flashDealsUsed: number;    // Counter
}

export interface FlashDeal {
    id?: string;
    venueId?: string;
    title: string;
    description: string;
    price?: string;
    startTime: number;
    endTime: number;
    isActive: boolean;
    isApproved?: boolean; // Admin approval required
    termsAccepted?: boolean;
    offerDetails?: string; // [NEW] e.g. "BOGO"
    terms?: string; // [NEW] e.g. "Limit 2"
}

export interface ScheduledDeal {
    id?: string;
    venueId?: string;
    title: string;
    description: string;
    price?: string;
    startTime: number;
    endTime: number;
    durationMinutes: number;
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    createdBy: 'ARTIE' | 'MANUAL';
    staffBriefingConfirmed: boolean;
    offerDetails?: string;
    terms?: string;
    createdAt?: any; // Firestore serverTimestamp
}

export type VenueType = 'bar_pub' | 'restaurant_bar' | 'brewery_taproom' | 'lounge_club' | 'arcade_bar' | 'brewpub';

// [PHASE 1] Menu Module Schema
export enum MenuItemType {
    Crisp = 'Crisp',
    Hoppy = 'Hoppy',
    Malty = 'Malty',
    Dark = 'Dark',
    Sour = 'Sour',
    Cider = 'Cider',
    Seltzer = 'Seltzer',
    Cocktail = 'Cocktail',
    Wine = 'Wine',
    Food = 'Food',
    Other = 'Other'
}

export enum MenuItemStatus {
    Live = 'Live',
    Library = 'Library',
    Archived = 'Archived'
}

export enum MarginTier {
    High = 'High',       // High Profit
    Medium = 'Medium',   // Standard
    Low = 'Low',         // Low Profit
    LossLeader = 'LossLeader'
}

export enum MenuSource {
    Manual = 'Manual',
    Untappd = 'Untappd',
    Internal_Library = 'Internal_Library'
}

export interface MenuItemStats {
    abv?: number; // Required for alcohol
    ibu?: number;
    price?: string; // e.g. "$7"
}

export interface MenuItem {
    id: string; // UUID
    name: string;
    type: MenuItemType;
    description?: string; // Max 140 chars
    stats: MenuItemStats;

    // [CRITICAL] AI & Ops Fields
    margin_tier: MarginTier;
    ai_tags?: string[]; // Auto-generated
    source: MenuSource;
    status: MenuItemStatus;
    last_toggled_at?: number; // Timestamp
}

export interface HappyHourMenuItem {
    id: string;
    name: string;
    description?: string;
    price: string;
    category: 'food' | 'drink';
}

export interface HappyHourRule {
    id: string;
    startTime: string;
    endTime: string;
    days: string[];
    description: string;
    specials?: string;
}

export type VibeTag =
    | 'dive'
    | 'speakeasy'
    | 'sports'
    | 'tiki_theme'
    | 'wine_focus'
    | 'cocktail_focus'
    | 'lgbtq'
    | 'patio_garden';

export type FoodServiceLevel = 'none_byof' | 'snacks' | 'limited_kitchen' | 'full_kitchen';

export type GameFeatureStatus = 'active' | 'out_of_order';

export interface GameFeature {
    id: string; // e.g. "pinball_godzilla" or just "pool_table_1"
    type: 'arcade_game' | 'pinball_machine' | 'pool_table' | 'darts' | 'skeeball' | 'shuffleboard' | 'foosball' | 'cornhole' | 'beer_pong' | 'trivia' | 'karaoke' | 'giant_jenga' | 'console_gaming' | 'unknown';
    name: string; // Display name e.g. "Godzilla Pinball"
    status: GameFeatureStatus;
    count: number;
    highlight?: boolean; // If true, show in summary tags
    description?: string; // [NEW] For artie lore or condition notes
    isLeaguePartner?: boolean; // [NEW] For tracking league assets
}

export interface GameStatus {
    status: 'open' | 'taken' | 'out_of_order';
    timestamp: number;
    reportedBy?: string;
    expiresAt?: number;
}

export interface Venue {
    id: string;
    name: string;
    venueType: VenueType; // [NEW] Primary Business Model
    vibeTags?: VibeTag[]; // [NEW] Vibe Tags

    status: VenueStatus;
    checkIns: number;
    capacity?: number; // [NEW] Total venue capacity for busyness calculations
    isPaidLeagueMember?: boolean;
    nicknames?: string[];

    // Legacy/Computed fields for Frontend
    deal?: string;
    dealEndsIn?: number;

    // Robust Deal Data
    flashDeals?: FlashDeal[];
    activeFlashDealId?: string;
    activeFlashDeal?: FlashDeal;

    vibe: string;
    coordinates: { x: number; y: number };
    location?: { lat: number; lng: number };
    currentBuzz?: {
        score: number;
        lastUpdated: number;
    };

    // Events & Hours
    leagueEvent?: 'karaoke' | 'trivia' | 'arcade' | 'events' | 'openmic' | 'bingo' | 'live_music' | 'pool' | 'darts' | 'shuffleboard' | 'pinball' | null;
    triviaTime?: string;
    triviaHost?: string;
    triviaPrizes?: string;
    triviaSpecials?: string;
    triviaHowItWorks?: string[];
    eventDescription?: string;
    happyHourSimple?: string;
    happyHourSpecials?: string;
    happyHour?: {
        startTime: string;
        endTime: string;
        description: string;
        days?: string[];
    };
    happyHourRules?: HappyHourRule[];

    happyHourMenu?: HappyHourMenuItem[];
    // [PHASE 1] Full Menu (Library + Live)
    fullMenu?: MenuItem[];

    // Bonus Points
    checkin_bonus_points?: number;
    bonus_expires_at?: number;

    alertTags?: string[];
    isFavorite?: boolean;
    isFeatured?: boolean; // [NEW] Added for backward compatibility/visual tagging
    featureWeight?: number; // [NEW] Sort priority for featured venues
    description?: string;
    address?: string;
    email?: string;
    isHistoricalAnchor?: boolean;
    historySnippet?: string;
    hours?: string | { [key: string]: { open: string; close: string } };
    phone?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    venueName?: string;
    source?: 'google_calendar' | 'facebook' | 'manual';
    ticketLink?: string;
    cheatCodeUrl?: string;
    orderUrl?: string;
    giftCardUrl?: string;
    directMenuUrl?: string; // [NEW] Link to Untappd/DigitalPour/Image
    newsletterUrl?: string; // [NEW] Link to Mailchimp/Newsletter

    // Google Places Data
    googleRating?: number;
    googleReviewCount?: number;

    partnerConfig?: PartnerConfig; // [NEW] Flash Deal Tiers & Tokens

    ownerId?: string;
    managerIds?: string[];

    // Inventory / Taxonomy [NEW]
    foodService: FoodServiceLevel; // [NEW] Replaces attributes.food_service
    gameFeatures?: GameFeature[]; // [NEW] Replaces amenityDetails

    // Discovery Attributes
    amenities?: string[]; // e.g. ['Pool', 'Shuffleboard', 'Darts']
    weekly_schedule?: Record<string, string[]>; // e.g. { 'thursday': ['Karaoke'] }

    // [NEW] One-Time & Featured Events
    special_events?: {
        id: string;
        title: string;
        date: string; // ISO 2023-10-31
        startTime: string; // 20:00
        endTime?: string;
        description?: string;
        type: 'music' | 'activity' | 'special';
        is_featured?: boolean; // Manual override (Weight = 100)
        host?: string;
        prizes?: string;
        eventSpecials?: string;
        howItWorks?: string[];
        cluesUrl?: string;
    }[];

    tier_config: {
        is_directory_listed: boolean;
        is_league_eligible: boolean;
    };

    attributes: {
        has_manned_bar: boolean;
        minors_allowed: boolean;
        noise_level: 'Conversational' | 'Lively' | 'Loud/Music';
    };

    makerType?: 'Brewery' | 'Distillery' | 'Cidery' | 'Winery';
    physicalRoom?: boolean;
    insiderVibe?: string;
    originStory?: string;
    geoLoop?: 'Downtown_Walkable' | 'Warehouse_Tumwater' | 'Destination_Quest';
    isLowCapacity?: boolean;
    isSoberFriendly?: boolean;
    soberFriendlyReports?: { userId: string; timestamp: number; reason?: string }[];
    soberFriendlyNote?: string; // Artie's explanation if badge is disabled
    isBoutique?: boolean;
    isActive?: boolean;
    isVisible?: boolean;
    scavengerHunts?: {
        title: string;
        partnerVenues: string[];
        badgeId: string;
    }[];
    establishmentType?: 'Bar Only' | 'Bar & Restaurant' | 'Restaurant with Bar' | 'Brewpub'; // Likely deprecated by venueType
    googlePlaceId?: string;
    vibeDefault?: 'DEAD' | 'CHILL' | 'BUZZING' | 'PACKED';

    hasGameVibeCheckEnabled?: boolean;
    liveGameStatus?: Record<string, GameStatus>;
    assets?: Record<string, boolean>; // Support for legacy asset toggles until fully migrated to gameFeatures

    manualStatus?: VenueStatus;
    manualStatusExpiresAt?: number;
    manualCheckIns?: number;
    manualCheckInsExpiresAt?: number;

    pointBank?: number;
    pointBankLastReset?: number;

    updatedAt?: number;
    managersCanAddUsers?: boolean;
    lastGoogleSync?: number;

    photos?: {
        id?: string;
        url: string;
        caption?: string;
        allowMarketingUse?: boolean;
        marketingStatus?: 'pending-super' | 'pending-venue' | 'approved' | 'rejected';
        superAdminApprovedBy?: string;
        venueAdminApprovedBy?: string;
        isApprovedForFeed?: boolean;
        isApprovedForSocial?: boolean;
        timestamp?: number;
        userId?: string;
    }[];
    isHQ?: boolean;
    isLocalMaker?: boolean;
    carryingMakers?: string[]; // IDs of venues that carry this maker's products
    isVerifiedHost?: boolean;
    isVerifiedMaker?: boolean;
    localScore?: number;

    // Taxonomy Update [NEW]
    isAllAges?: boolean;
    isDogFriendly?: boolean;
    hasOutdoorSeating?: boolean;
    hasPrivateRoom?: boolean;
    reservations?: string;
    reservationUrl?: string;
    openingTime?: string;
    services?: string[];
}

export interface AmenityDetail {
    id: string; // e.g. "darts"
    name: string; // e.g. "Darts"
    count: number; // total units
    available?: number; // currently free
    isLeaguePartner?: boolean; // If this specific amenity is part of the league
    artieLore?: string; // Specific lore for this amenity
}

export interface VenueInsight {
    type: 'YIELD_BOOST' | 'TREND_ALERT' | 'COMPLIANCE_CHECK';
    message: string;
    actionLabel: string;
    actionSkill: string;
    actionParams: any;
    pointCost?: number;
    potentialImpact: 'HIGH' | 'MEDIUM' | 'LOW';
}
