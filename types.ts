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
  coordinates: { x: number, y: number };
  leagueEvent?: 'karaoke' | 'trivia' | 'arcade' | 'cornhole' | 'openmic' | 'bingo' | null;
  isHQ?: boolean;
  alertTags?: string[]; // e.g. ['karaoke', 'trivia']
  isFavorite?: boolean; // UI state
  // Detailed Profile Fields
  description?: string;
  address?: string;
  hours?: string;
  phone?: string;
  website?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface UserAlertPreferences {
  nightlyDigest: boolean;
  followedVenues: string[];
  interests: string[];
}

export interface CheckInRecord {
  venueId: string;
  timestamp: number;
}

export type PointsReason = 'checkin' | 'photo' | 'share';

export type UserRole = 'guest' | 'user' | 'owner' | 'admin';

export interface UserProfile {
  handle?: string; // The user's public league name
  email?: string;
  phone?: string; // Optional for text notifications
  favoriteDrink?: string;
  homeBase?: string; // Favorite venue ID
  role: UserRole;
}