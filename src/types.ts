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
  leagueEvent?: 'karaoke' | 'trivia' | 'arcade' | 'cornhole' | 'openmic' | 'bingo' | null;
  isHQ?: boolean;
  happyHour?: {
    startTime: string; // e.g. "16:00"
    endTime: string;   // e.g. "18:00"
    description: string;
  };
  alertTags?: string[];
  isFavorite?: boolean;
  description?: string;
  address?: string;
  hours?: string;
  phone?: string;
  website?: string;
  ownerId?: string;       // UID of the venue owner
  managerIds?: string[];  // UIDs of managers authorized by the owner
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

export type PointsReason = 'checkin' | 'photo' | 'share';

export type UserRole = 'guest' | 'user' | 'manager' | 'owner' | 'admin';

export interface UserProfile {
  uid: string;
  handle?: string;
  email?: string;
  phone?: string;
  favoriteDrink?: string;
  homeBase?: string;
  role: UserRole;
  stats?: {
    seasonPoints: number;
    lifetimeCheckins: number;
    currentStreak: number;
  };
}
