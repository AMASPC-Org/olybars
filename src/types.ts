import { SystemRole, VenueRole } from './types/auth_schema';

export type VenueStatus = 'chill' | 'lively' | 'buzzing';

export interface Venue {
  id: string;
  name: string;
  type: string;
  status: VenueStatus;
  checkIns: number;
  deal?: string;
  dealEndsIn?: number; // minutes
  vibe: string;
  coordinates: { x: number; y: number }; // Relative map coordinates
  location?: { lat: number; lng: number }; // Real-world coordinates for geofencing
  currentBuzz?: {
    score: number;
    lastUpdated: number;
  };
  leagueEvent?: 'karaoke' | 'trivia' | 'arcade' | 'events' | 'openmic' | 'bingo' | 'live_music' | null;
  isHQ?: boolean;
  happyHour?: {
    startTime: string;
    endTime: string;
    description: string;
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
  ownerId?: string;
  managerIds?: string[];
  amenities?: string[];
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

  // Strategic Market Audit Fields (Dec 2025)
  originStory?: string; // Rich text origin story
  geoLoop?: 'Downtown_Walkable' | 'Warehouse_Tumwater' | 'Destination_Quest';
  isLowCapacity?: boolean; // "Tiny Taproom" warning
  isSoberFriendly?: boolean; // "Self Care" tag
  isActive?: boolean; // For Ghost List / Legacy soft-delete
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
}

export type PointsReason = 'checkin' | 'photo' | 'share' | 'vibe' | 'redeem' | 'bonus';

export interface ActivityLogItem {
  userId: string;
  type: PointsReason;
  venueId?: string;
  points: number;
  timestamp: number;
  metadata?: any;
}

export type UserRole = 'guest' | 'user' | 'manager' | 'owner' | 'admin' | 'super-admin';

export interface UserProfile {
  uid: string;
  handle?: string;
  email?: string;
  phone?: string;
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
  leaguePreferences?: string[];
  favorites?: string[];
  weeklyBuzz?: boolean;
  showMemberSince?: boolean;
  createdAt?: number;

  // RBAC Fields (Optional for backward compat until migration)
  systemRole?: SystemRole;
  venuePermissions?: Record<string, VenueRole>;

  // Maker's Trail
  makersTrailProgress?: number; // 0-5
  hasCompletedMakerSurvey?: boolean;
}
