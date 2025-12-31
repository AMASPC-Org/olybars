import { SystemRole, VenueRole } from './types/auth_schema';

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

  // Deprecated / Mapped fields (Keep for TS compatibility during migration if needed, or remove if strict)
  // category: 'Dive' | 'Cocktail Lounge' | 'Brewery' | 'Restaurant Bar' | 'Club' | 'Arcade/Activity'; // REMOVED
  // attributes: ... // REMOVED -> Mapped to top level fields

  tier_config: {
    is_directory_listed: boolean;
    is_league_eligible: boolean;
  };

  attributes: {
    has_manned_bar: boolean;
    minors_allowed: boolean;
    noise_level: 'Conversational' | 'Lively' | 'Loud/Music';
    // food_service moved to top level
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

  // assets?: Record<string, boolean>; // REMOVED -> use gameFeatures

  hasGameVibeCheckEnabled?: boolean;
  liveGameStatus?: Record<string, GameStatus>;

  manualStatus?: VenueStatus;
  manualStatusExpiresAt?: number;
  manualCheckIns?: number;
  manualCheckInsExpiresAt?: number;

  pointBank?: number;
  pointBankLastReset?: number;

  updatedAt?: number;
  managersCanAddUsers?: boolean;
  lastGoogleSync?: number;

  // [NEW] Visuals & Relationships
  photos?: {
    id?: string;
    url: string;
    caption?: string;
    allowMarketingUse?: boolean;
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

export interface GameStatus {
  status: 'open' | 'taken' | 'out_of_order';
  timestamp: number;
  reportedBy?: string;
  expiresAt?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface UserAlertPreferences {
  nightlyDigest: boolean;
  weeklyDigest: boolean;
  followedVenues: string[];
  interests: string[];
}

export interface CheckInRecord {
  venueId: string;
  timestamp: number;
}

export type SignalType = 'check_in' | 'vibe_report' | 'photo_upload';

export interface Signal {
  id: string;
  venueId: string;
  userId: string;
  type: SignalType;
  value: any;
  timestamp: number;
  verificationMethod?: 'gps' | 'qr'; // Added for Vibe Check QR System
}

export interface AmenityDetail {
  id: string; // e.g. "darts"
  name: string; // e.g. "Darts"
  count: number; // total units
  available?: number; // currently free
  isLeaguePartner?: boolean; // If this specific amenity is part of the league
  artieLore?: string; // Specific lore for this amenity
}

export type PointsReason = 'checkin' | 'photo' | 'share' | 'vibe' | 'redeem' | 'bonus' | 'play' | 'social_share';

export interface ActivityLogItem {
  userId: string;
  type: PointsReason;
  venueId?: string;
  points: number;
  timestamp: number;
  metadata?: any;
}

export type UserRole = 'guest' | 'user' | 'manager' | 'owner' | 'admin' | 'super-admin' | 'PLAYER';

export interface UserProfile {
  uid: string;
  handle?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  favoriteDrink?: string; // Legacy
  favoriteDrinks?: string[];
  homeBase?: string;
  role: UserRole;
  lastVibeChecks?: Record<string, number>;
  lastGlobalVibeCheck?: number;
  stats?: {
    seasonPoints: number;
    lifetimeCheckins: number;
    currentStreak: number;
    vibeCheckCount: number;
    competitionPoints: number;
  };
  handleLastChanged?: number;
  playerGamePreferences?: string[];
  favorites?: string[];
  weeklyBuzz?: boolean;
  showMemberSince?: boolean;
  createdAt?: number;
  updatedAt?: number;
  badges?: Record<string, UserBadgeProgress>; // Map of badgeId -> Progress

  // RBAC Fields (Optional for backward compat until migration)
  systemRole?: SystemRole;
  venuePermissions?: Record<string, VenueRole>;

  // Maker's Trail
  makersTrailProgress?: number; // 0-5
  hasCompletedMakerSurvey?: boolean;
  vouchers?: UserVoucher[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: string;
  venueId?: string;
  points: number;
  timestamp: number;
  hasConsent?: boolean;
  metadata?: any;
  verificationMethod?: 'gps' | 'qr';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  points: number;
  criteria: {
    type: 'checkin_set' | 'count';
    venueIds?: string[];
    count?: number;
    category?: string;
    isHistoricalAnchor?: boolean;
    timeWindowDays?: number;
  };
  secret?: boolean;
}

export interface UserBadgeProgress {
  badgeId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: number;
  completedVenueIds?: string[];
}

export interface MerchItem {
  id: string;
  venueId: string;
  name: string;
  description: string;
  price: number;
  imageURL: string;
  category: 'T-Shirt' | 'Hoodie' | 'Hat' | 'Other';
  sizes?: string[];
}

export interface UserVoucher {
  id: string;
  userId: string;
  itemId: string;
  venueId: string;
  status: 'active' | 'redeemed' | 'cancelled';
  purchaseDate: number;
  redeemedAt?: number;
  qrToken: string;
}
export interface AppEvent {
  id: string;
  venueId: string;
  venueName: string;
  title: string;
  type: 'karaoke' | 'trivia' | 'live_music' | 'bingo' | 'openmic' | 'other';
  date: string;
  time: string;
  description?: string;
  points?: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string; // userId or 'guest'
  createdAt: number;
  updatedAt?: number;
  isLeagueEvent?: boolean;
  analysis?: EventAnalysis;
}

export interface EventAnalysis {
  confidenceScore: number; // 0-100
  issues: string[];
  lcbWarning: boolean;
  suggestions: string[];
  summary: string;
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
