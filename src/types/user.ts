import { SystemRole, VenueRole } from './auth_schema';

export type UserRole = 'guest' | 'user' | 'manager' | 'owner' | 'admin' | 'super-admin' | 'PLAYER';

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

export type PointsReason = 'checkin' | 'photo' | 'share' | 'vibe' | 'redeem' | 'bonus' | 'play' | 'social_share';

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

export interface ActivityLogItem {
    userId: string;
    type: PointsReason;
    venueId?: string;
    points: number;
    timestamp: number;
    metadata?: any;
}

export interface UserBadgeProgress {
    badgeId: string;
    progress: number;
    unlocked: boolean;
    unlockedAt?: number;
    completedVenueIds?: string[];
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

    // RBAC Fields
    systemRole?: SystemRole;
    venuePermissions?: Record<string, VenueRole>;

    // Maker's Trail
    makersTrailProgress?: number; // 0-5
    hasCompletedMakerSurvey?: boolean;
    vouchers?: UserVoucher[];
}
