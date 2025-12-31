export type VenueStatus = 'dead' | 'chill' | 'lively' | 'buzzing' | 'packed';

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

export type VenueType = 'bar_pub' | 'restaurant_bar' | 'brewery_taproom' | 'lounge_club' | 'arcade_bar';

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
    type: 'arcade_game' | 'pinball_machine' | 'pool_table' | 'darts' | 'skeeball' | 'shuffleboard' | 'foosball' | 'cornhole' | 'beer_pong' | 'trivia' | 'karaoke' | 'giant_jenga' | 'unknown';
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
    eventDescription?: string;
    happyHourSimple?: string;
    happyHourSpecials?: string;
    happyHour?: {
        startTime: string;
        endTime: string;
        description: string;
        days?: string[];
    };

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

    partnerConfig?: PartnerConfig; // [NEW] Flash Deal Tiers & Tokens

    ownerId?: string;
    managerIds?: string[];

    // Inventory / Taxonomy [NEW]
    foodService: FoodServiceLevel; // [NEW] Replaces attributes.food_service
    gameFeatures?: GameFeature[]; // [NEW] Replaces amenityDetails

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
    isBoutique?: boolean;
    isActive?: boolean;
    isVisible?: boolean;
    scavengerHunts?: {
        title: string;
        partnerVenues: string[];
        badgeId: string;
    }[];
    establishmentType?: 'Bar Only' | 'Bar & Restaurant' | 'Restaurant with Bar'; // Likely deprecated by venueType
    googlePlaceId?: string;
    vibeDefault?: 'CHILL' | 'LIVELY' | 'BUZZING';

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
