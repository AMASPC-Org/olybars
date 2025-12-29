import { SystemRole, VenueRole } from './types/auth_schema';

export type VenueStatus = 'dead' | 'chill' | 'lively' | 'buzzing' | 'packed';

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
}

export interface Venue {
  id: string;
  name: string;
  type: string;
  status: VenueStatus;
  checkIns: number;
  isPaidLeagueMember?: boolean;
  nicknames?: string[]; // [NEW] AI Resolution Helper // Paid "Venue League Member" status (vs Unpaid Venue)

  // Legacy/Computed fields for Frontend
  deal?: string;         // Title of active, approved flash deal
  dealEndsIn?: number;   // Minutes remaining

  // Robust Deal Data
  flashDeals?: FlashDeal[];
  activeFlashDealId?: string;
  activeFlashDeal?: FlashDeal;

  // ... (rest) ...
  vibe: string;
  coordinates: { x: number; y: number }; // Relative map coordinates
  location?: { lat: number; lng: number }; // Real-world coordinates for geofencing
  currentBuzz?: {
    score: number;
    lastUpdated: number;
  };
  leagueEvent?: 'karaoke' | 'trivia' | 'arcade' | 'events' | 'openmic' | 'bingo' | 'live_music' | 'pool' | 'darts' | 'shuffleboard' | 'pinball' | null;
  triviaTime?: string;
  eventDescription?: string; // [NEW] Unified for Artie
  happyHourSimple?: string;  // [NEW] Unified for Artie
  happyHourSpecials?: string; // [NEW] Unified for Artie
  isHQ?: boolean;
  happyHour?: {
    startTime: string;
    endTime: string;
    description: string;
    days?: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  };
  alertTags?: string[];
  isFavorite?: boolean;
  description?: string;
  address?: string;
  email?: string;
  hours?: string | { [key: string]: { open: string; close: string } };
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  venueName?: string; // This field is not in the original Venue interface, but was in the provided snippet. Assuming it should be added.
  source?: 'google_calendar' | 'facebook' | 'manual'; // This field is not in the original Venue interface, but was in the provided snippet. Assuming it should be added.
  ticketLink?: string; // This field is not in the original Venue interface, but was in the provided snippet. Assuming it should be added.
  cheatCodeUrl?: string; // Link to History Blog for Trivia answers
  ownerId?: string;
  managerIds?: string[];
  amenities?: string[];
  amenityDetails?: AmenityDetail[];
  deals?: {
    title: string;
    description: string;
    days: string[];
    start: string;
    end: string;
  }[];
  isFeatured?: boolean;
  featureWeight?: number;
  isVisible?: boolean;
  photos?: {
    url: string;
    allowMarketingUse: boolean;
    isApprovedForFeed?: boolean;
    isApprovedForSocial?: boolean;
    timestamp: number;
    userId: string;
    id: string; // Add id for management
  }[];
  // Local Maker / Artesian Anchor Fields
  isLocalMaker?: boolean; // Toggled by owner/admin
  localScore?: number; // 0-100 score for impact
  carryingMakers?: string[]; // IDs of other makers this venue carries
  isVerifiedMaker?: boolean; // Gatekeeper: Must be true to enable Maker tools
  isVerifiedHost?: boolean; // Gatekeeper: Must be true to enable League Host tools

  // Local Lore / History Fields
  isHistoricalAnchor?: boolean;
  historySnippet?: string;
  relatedBlogIds?: string[];

  // Strategic Market Audit & Two-Tier Model (Dec 2025)
  category: 'Dive' | 'Cocktail Lounge' | 'Brewery' | 'Restaurant Bar' | 'Club' | 'Arcade/Activity';

  tier_config: {
    is_directory_listed: boolean;   // Passed the Stool Test (Visible on Map)
    is_league_eligible: boolean;    // "Anchor" status (Gamification enabled)
  };

  attributes: {
    has_manned_bar: boolean;        // Hard requirement for listing
    food_service: 'Full Kitchen' | 'Snacks' | 'None' | 'BYOF';
    minors_allowed: boolean;        // Critical for dining/bar separation
    noise_level: 'Conversational' | 'Lively' | 'Loud/Music';
  };

  makerType?: 'Brewery' | 'Distillery' | 'Cidery' | 'Winery';
  physicalRoom?: boolean; // Yes/No - if No, mark as 'Production Only'
  insiderVibe?: string; // 2-sentence 'Insider Vibe' for the app listing
  originStory?: string; // Rich text origin story
  geoLoop?: 'Downtown_Walkable' | 'Warehouse_Tumwater' | 'Destination_Quest';
  isLowCapacity?: boolean; // "Tiny Taproom" warning
  isSoberFriendly?: boolean; // "Self Care" tag
  isBoutique?: boolean; // For small capacity like Whitewood Cider
  isActive?: boolean; // For Ghost List / Legacy soft-delete
  scavengerHunts?: {
    title: string;
    partnerVenues: string[]; // IDs of bars where they are typically tapped
    badgeId: string;
  }[];
  establishmentType?: 'Bar Only' | 'Bar & Restaurant' | 'Restaurant with Bar';
  subtypes?: string[];
  googlePlaceId?: string; // [NEW] For Google Places SDK Sync
  vibeDefault?: 'CHILL' | 'LIVELY' | 'BUZZING'; // [NEW] Onboarding MVP
  assets?: Record<string, boolean>; // [NEW] Grid Toggles (Pool, Darts, etc.)
  // Game Vibe Check (Premium Feature)
  hasGameVibeCheckEnabled?: boolean;
  liveGameStatus?: Record<string, GameStatus>;

  // Owner Manual Overrides
  manualStatus?: VenueStatus;
  manualStatusExpiresAt?: number;
  manualCheckIns?: number;
  manualCheckInsExpiresAt?: number;

  // Point Bank & Yield Management (Proactive Artie)
  pointBank?: number;
  pointBankLastReset?: number;

  updatedAt?: number;
  managersCanAddUsers?: boolean; // [NEW] Multi-User Support
  lastGoogleSync?: number; // [FINOPS] For internal sync throttling
}

export interface GameStatus {
  status: 'open' | 'taken';
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
