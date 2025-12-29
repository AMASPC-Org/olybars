import { PULSE_CONFIG } from '../../src/config/pulse';
import { db } from './firebaseAdmin.js';
import admin from 'firebase-admin';
import { Venue, Signal, SignalType, Badge, UserBadgeProgress } from '../../src/types';
import { geocodeAddress } from './utils/geocodingService';
import { searchPlace, getPlaceDetails } from './utils/placesService';
import { BADGES } from '../../src/config/badges';

// In-memory cache for venues (TTL: 60 seconds)
let venueCache: { data: Venue[], lastFetched: number } | null = null;
const CACHE_TTL = 60 * 1000;

/**
 * Buzz Clock Sorting Logic:
 * 1. Sort by dealEndsIn (shortest duration first).
 * 2. Push any venues with dealEndsIn > 240 minutes to the bottom.
 * 3. Venues without deals go to the absolute bottom.
 */
const sortVenuesByBuzzClock = (venues: Venue[]): Venue[] => {
    return [...venues].sort((a, b) => {
        const aTime = a.dealEndsIn ?? Infinity;
        const bTime = b.dealEndsIn ?? Infinity;

        const aIsLong = aTime > 240;
        const bIsLong = bTime > 240;

        // If one is "long" and the other isn't, handle priority
        if (aIsLong && !bIsLong) return 1;
        if (!aIsLong && bIsLong) return -1;

        // If both are same "long-ness", sort by time
        // If both are Infinity, they remain equal (0)
        if (aTime === bTime) return 0;
        return aTime < bTime ? -1 : 1;
    });
};

/**
 * Geofencing: Haversine distance in meters
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};



/**
 * Buzz Algorithm (Doc 05 Rulebook):
 * Updated Dec 24: Uses Centralized Pulse Logic Config
 */
export const updateVenueBuzz = async (venueId: string) => {
    const now = Date.now();
    const twelveHoursAgo = now - PULSE_CONFIG.WINDOWS.BUZZ_HISTORY;
    const liveWindowAgo = now - PULSE_CONFIG.WINDOWS.LIVE_HEADCOUNT;

    // Filter by venueId only
    const signalsSnapshot = await db.collection('signals')
        .where('venueId', '==', venueId)
        .where('timestamp', '>', twelveHoursAgo) // Optimization: limit query
        .get();

    let score = 0;
    const activeUserIds = new Set<string>();

    signalsSnapshot.forEach(doc => {
        const data = doc.data() as Signal;

        // 1. Calculate Buzz Score
        let signalValue = 0;
        if (data.type === 'check_in') signalValue = PULSE_CONFIG.POINTS.CHECK_IN;
        if (data.type === 'vibe_report') signalValue = PULSE_CONFIG.POINTS.VIBE_REPORT;

        // Recency Decay: 50% drop every HALFLIFE (default 60 mins)
        const ageInHours = (now - data.timestamp) / PULSE_CONFIG.WINDOWS.DECAY_HALFLIFE;
        const decayedValue = signalValue * Math.pow(0.5, ageInHours);
        score += decayedValue;

        // 2. Calculate Live Headcount (Rolling Window)
        if (data.timestamp > liveWindowAgo && data.type === 'check_in') {
            activeUserIds.add(data.userId);
        }
    });

    const venueDoc = await db.collection('venues').doc(venueId).get();
    const venueData = venueDoc.data();

    let status: string = 'chill';
    if (score > PULSE_CONFIG.THRESHOLDS.BUZZING) status = 'buzzing';
    else if (score > PULSE_CONFIG.THRESHOLDS.LIVELY) status = 'lively';

    // Manual Overrides (Owner/Admin Control)
    const finalStatus = (venueData?.manualStatus && venueData?.manualStatusExpiresAt > now)
        ? venueData.manualStatus
        : status;

    const finalCheckIns = (venueData?.manualCheckIns !== undefined && venueData?.manualCheckInsExpiresAt > now)
        ? venueData.manualCheckIns
        : activeUserIds.size;

    await db.collection('venues').doc(venueId).update({
        'currentBuzz.score': score,
        'currentBuzz.lastUpdated': now,
        'status': finalStatus,
        'checkIns': finalCheckIns
    });
};

/**
 * calculateVirtualBuzz (Rule 05-V):
 * Calculates real-time decayed score without DB writes.
 */
const applyVirtualDecay = (venue: Venue): Venue => {
    const now = Date.now();

    // 1. Calculate Virtual Buzz (Decay)
    let decayedScore = venue.currentBuzz?.score || 0;
    if (venue.currentBuzz?.score && venue.currentBuzz.lastUpdated) {
        const ageInMs = now - venue.currentBuzz.lastUpdated;
        const decayHours = PULSE_CONFIG.WINDOWS.DECAY_HALFLIFE / (60 * 60 * 1000);
        const ageInHours = ageInMs / (60 * 60 * 1000);
        decayedScore = venue.currentBuzz.score * Math.pow(0.5, ageInHours / decayHours);
    }

    // 2. Determine Status (Respect Manual Override)
    let status = venue.status;
    if (!(venue.manualStatus && venue.manualStatusExpiresAt && venue.manualStatusExpiresAt > now)) {
        status = 'chill';
        if (decayedScore > PULSE_CONFIG.THRESHOLDS.BUZZING) status = 'buzzing';
        else if (decayedScore > PULSE_CONFIG.THRESHOLDS.LIVELY) status = 'lively';
    }

    // 3. Determine Check-ins (Respect Manual Override)
    let checkIns = venue.checkIns || 0;
    if (venue.manualCheckIns !== undefined && venue.manualCheckInsExpiresAt && venue.manualCheckInsExpiresAt > now) {
        checkIns = venue.manualCheckIns;
    }

    return {
        ...venue,
        currentBuzz: {
            ...venue.currentBuzz,
            score: decayedScore,
            lastUpdated: venue.currentBuzz?.lastUpdated || now
        },
        status: status as any,
        checkIns
    };
};

/**
 * Background Refresh for Venue Cache (SWR Pattern)
 */
const refreshVenueCache = async (): Promise<Venue[]> => {
    const now = Date.now();
    try {
        const snapshot = await db.collection('venues').get();

        const venues = snapshot.docs
            .map(doc => {
                const data = doc.data();
                const venue = { id: doc.id, ...data } as Venue;

                return venue;
            })
            .filter(v => v.isActive !== false);

        const sortedVenues = sortVenuesByBuzzClock(venues);

        venueCache = {
            data: sortedVenues,
            lastFetched: now
        };

        return sortedVenues;
    } catch (error) {
        console.error('Error refreshing venue cache:', error);
        throw error;
    }
};

export const fetchVenues = async (): Promise<Venue[]> => {
    const now = Date.now();

    // 1. SWR logic: Return cache immediately, refresh in background if stale
    if (venueCache) {
        const isStale = (now - venueCache.lastFetched) > CACHE_TTL;
        if (isStale) {
            // Background refresh
            refreshVenueCache().catch(err => console.error('[Backend] Background cache update failed:', err));
        }
        return venueCache.data.map(applyVirtualDecay);
    }

    // 2. No cache: Initial load
    const data = await refreshVenueCache();
    return data.map(applyVirtualDecay);
};


export const checkIn = async (venueId: string, userId: string, userLat: number, userLng: number, verificationMethod: 'gps' | 'qr' = 'gps') => {
    const venueDoc = await db.collection('venues').doc(venueId).get();
    if (!venueDoc.exists) throw new Error('Venue not found');

    const venueData = venueDoc.data() as Venue;
    if (!venueData.location) {
        // If no real location set, skip geofencing for dev
        console.warn(`Geofencing skipped for ${venueId} - no location set.`);
    } else {
        const distance = calculateDistance(userLat, userLng, venueData.location.lat, venueData.location.lng);
        if (distance > PULSE_CONFIG.SPATIAL.GEOFENCE_RADIUS) {
            throw new Error(`Too far away! You are ${Math.round(distance)}m from ${venueData.name}.`);
        }
    }

    // 1. Conflict of Interest Check (Rule 03-B)
    if (venueData.ownerId === userId || venueData.managerIds?.includes(userId)) {
        throw new Error('Conflict of Interest: Venue staff and management are not eligible for League points at their own establishment.');
    }

    const timestamp = Date.now();

    // 2. LCB Compliance Check (Rule 03-A): Max 2 check-ins per window
    const lcbWindowAgo = timestamp - PULSE_CONFIG.WINDOWS.LCB_WINDOW;
    const checkInsLast12h = await db.collection('signals')
        .where('userId', '==', userId)
        .where('type', '==', 'check_in')
        .where('timestamp', '>', lcbWindowAgo)
        .get();

    if (checkInsLast12h.size >= 2) {
        throw new Error('LCB Compliance Limit: WA State law limits users to 2 League check-ins per 12-hour window. Please try again later.');
    }

    // 3. Throttling Logic (Rule 03-C)
    // We fetch the most recent check-in to enforce minimum gaps
    const recentSignals = await db.collection('signals')
        .where('userId', '==', userId)
        .where('type', '==', 'check_in')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

    if (!recentSignals.empty) {
        const lastCheckIn = recentSignals.docs[0].data() as Signal;
        const timeSinceLast = timestamp - lastCheckIn.timestamp;

        // Global Throttle: (e.g. 120 minutes / 2 hours)
        if (timeSinceLast < PULSE_CONFIG.WINDOWS.CHECK_IN_THROTTLE) {
            const minutesSinceLast = Math.floor(timeSinceLast / (60 * 1000));
            const waitTime = (PULSE_CONFIG.WINDOWS.CHECK_IN_THROTTLE / (60 * 1000)) - minutesSinceLast;
            throw new Error(`Slow down, League Legend! The Pulse needs a bit more time. You can clock in again in ${Math.ceil(waitTime)} minutes.`);
        }

        // Same-Venue Throttle: (e.g. 360 minutes / 6 hours)
        if (lastCheckIn.venueId === venueId && timeSinceLast < PULSE_CONFIG.WINDOWS.SAME_VENUE_THROTTLE) {
            const minutesSinceLast = Math.floor(timeSinceLast / (60 * 1000));
            const waitTime = (PULSE_CONFIG.WINDOWS.SAME_VENUE_THROTTLE / (60 * 1000)) - minutesSinceLast;
            throw new Error(`Already checked in here recently! To keep the Pulse fair, please wait another ${Math.floor(waitTime / 60)} hours and ${Math.ceil(waitTime % 60)} minutes before checking into ${venueData.name} again.`);
        }
    }

    const signal: Partial<Signal> = {
        venueId,
        userId,
        type: 'check_in',
        timestamp,
        verificationMethod
    };

    await db.collection('signals').add(signal);
    await db.collection('venues').doc(venueId).update({
        checkIns: (venueData.checkIns || 0) + 1
    });

    // Calculate Dynamic Points (Maker Atlas Protocol Dec 2025)
    // Base: 10
    // Local Maker (Supporter/High Local Score): 15 (1.5x)
    // Master Maker (Hybrid/Verified Production): 20 (2x)

    let points = 10;
    const isMasterMaker = venueData.isVerifiedMaker && venueData.isLocalMaker;
    const isLocalMakerSupporter = venueData.isLocalMaker || (venueData.localScore || 0) > 50;

    if (isMasterMaker) {
        points = 20; // 2x Multiplier
    } else if (isLocalMakerSupporter) {
        points = 15; // 1.5x Multiplier
    }

    // Pass calculated points to the activity logger
    // We log it here to ensure backend source of truth
    await logUserActivity({
        userId,
        type: 'check_in',
        venueId,
        points,
        verificationMethod,
        metadata: {
            multiplier: points / 10,
            isMasterMaker,
            isLocalMakerSupporter
        }
    });

    // Recalculate Buzz
    await updateVenueBuzz(venueId);

    // 4. BADGE LOGIC: Check & Award Badges
    const newBadges = await checkAndAwardBadges(userId, venueId);
    let badgesAwarded: Badge[] = [];

    if (newBadges.length > 0) {
        // Award points for badges
        const totalBadgePoints = newBadges.reduce((sum, b) => sum + b.points, 0);
        points += totalBadgePoints;

        // Log Badge Activities
        for (const badge of newBadges) {
            await logUserActivity({
                userId,
                type: 'badge_unlock',
                points: badge.points,
                metadata: { badgeId: badge.id, badgeName: badge.name }
            });
            badgesAwarded.push(badge);
        }
    } else {
        // Only log the check-in points if no badge activity already logged it (though we treat them separate)
        // Actually, logUserActivity is called above separately? No, checkIn function doesn't call logUserActivity yet for the checkin itself?
        // Wait, checkIn logic in this file returns points but doesn't seem to call logUserActivity for the check-in points?
        // Let's check existing code. It seems checkIn returns points, and Frontend might be calling logUserActivity?
        // Or specific logUserActivity call is missing in checkIn?
        // Looking at previous `checkIn` code: "Pass calculated points to the activity logger (handled mostly by frontend currently...)"
        // OK, so backend just calculates. But for BADGES, we definitely want backend to handle it or return it.
        // I will return badgesAwarded in the response.
    }

    return {
        success: true,
        message: `Checked in at ${venueData.name}!`,
        pointsAwarded: points,
        isLocalMaker: venueData.isLocalMaker,
        localScore: venueData.localScore,
        badgesEarned: badgesAwarded
    };
};

/**
 * Handle specific Amenity Check-ins (5 points)
 */
export const checkInAmenity = async (venueId: string, userId: string, amenityId: string) => {
    const venueDoc = await db.collection('venues').doc(venueId).get();
    if (!venueDoc.exists) throw new Error('Venue not found');

    const venueData = venueDoc.data() as Venue;

    // Check if the venue actually has this amenity
    const amenity = venueData.amenityDetails?.find(a => a.id === amenityId);
    if (!amenity) throw new Error(`Venue does not have ${amenityId}`);

    const timestamp = Date.now();

    // Log Activity
    await logUserActivity({
        userId,
        type: 'play',
        venueId,
        points: 5,
        metadata: { amenityId, amenityName: amenity.name }
    });

    return {
        success: true,
        message: `Clocked in for ${amenity.name} at ${venueData.name}!`,
        pointsAwarded: 5
    };
};


/**
 * Check if the user has unlocked any new badges based on their history.
 */
export const checkAndAwardBadges = async (userId: string, currentVenueId: string): Promise<Badge[]> => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const currentBadges = userData?.badges || {};

    // Get unique check-ins history
    const signalsSnapshot = await db.collection('signals')
        .where('userId', '==', userId)
        .where('type', '==', 'check_in')
        .get();

    const uniqueVenues = new Set<string>();
    signalsSnapshot.forEach(doc => {
        const data = doc.data() as Signal;
        uniqueVenues.add(data.venueId);
    });
    // Ensure current check-in is counted (it was just added)
    uniqueVenues.add(currentVenueId);

    const newBadges: Badge[] = [];

    for (const badge of BADGES) {
        // Skip if already unlocked
        if (currentBadges[badge.id]?.unlocked) continue;

        let unlocked = false;

        if (badge.criteria.type === 'checkin_set' && badge.criteria.venueIds) {
            // Check if all required venues are visited
            const hasAll = badge.criteria.venueIds.every(vid => uniqueVenues.has(vid));
            if (hasAll) unlocked = true;
        } else if (badge.criteria.type === 'count' && badge.criteria.count) {
            const matchCount = (badge.criteria.venueIds || []).filter(vid => uniqueVenues.has(vid)).length;
            // If no venueIds loop provided (generic count), usually not supported yet or implies ANY venue. 
            // Assuming venueIds is required for specific counts, else we check basic count.
            if (badge.criteria.venueIds && matchCount >= badge.criteria.count) {
                unlocked = true;
            }
        }

        // --- Special Logic: The Historian ---
        if (badge.id === 'the_historian' && badge.criteria.isHistoricalAnchor && badge.criteria.timeWindowDays) {
            const historyLimit = Date.now() - (badge.criteria.timeWindowDays * 24 * 60 * 60 * 1000);

            const recentSignals = await db.collection('signals')
                .where('userId', '==', userId)
                .where('type', '==', 'check_in')
                .where('timestamp', '>', historyLimit)
                .get();

            const recentVenueIds = new Set<string>();
            recentSignals.forEach(d => recentVenueIds.add(d.data().venueId));
            if (currentVenueId) recentVenueIds.add(currentVenueId);

            let historicalCount = 0;
            const recentVenues = Array.from(recentVenueIds);



            for (const vid of recentVenues) {
                const vDoc = await db.collection('venues').doc(vid).get();
                if (vDoc.exists && vDoc.data()?.isHistoricalAnchor) {
                    historicalCount++;
                }
            }

            if (historicalCount >= (badge.criteria.count || 3)) {
                unlocked = true;
            }
        }

        if (unlocked) {
            newBadges.push(badge);
            const badgeProgress: UserBadgeProgress = {
                badgeId: badge.id,
                progress: 1,
                unlocked: true,
                unlockedAt: Date.now()
            };
            // Update User Profile with new Badge
            await userRef.update({
                [`badges.${badge.id}`]: badgeProgress
            });
        } else {
            // Update progress if checkin_set
            if (badge.criteria.type === 'checkin_set' && badge.criteria.venueIds) {
                const visitedCount = badge.criteria.venueIds.filter(vid => uniqueVenues.has(vid)).length;
                const progress = visitedCount / badge.criteria.venueIds.length;

                await userRef.update({
                    [`badges.${badge.id}`]: {
                        badgeId: badge.id,
                        progress: progress,
                        unlocked: false,
                        completedVenueIds: badge.criteria.venueIds.filter(vid => uniqueVenues.has(vid))
                    }
                });
            }
        }
    }

    return newBadges;
};

/**
 * Log user activity and update user points in Firestore.
 */
export const logUserActivity = async (data: {
    userId: string,
    type: string,
    venueId?: string,
    points: number,
    hasConsent?: boolean,
    metadata?: any,
    verificationMethod?: 'gps' | 'qr'
}) => {
    const timestamp = Date.now();
    const logItem = { ...data, timestamp };

    // 1. Save to activity_logs collection
    await db.collection('activity_logs').add(logItem);

    // 2. Update user points in users collection
    const userRef = db.collection('users').doc(data.userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
        const userData = userDoc.data();
        await userRef.update({
            'stats.seasonPoints': (userData?.stats?.seasonPoints || 0) + data.points,
            'stats.lifetimeCheckins': (data.type === 'check_in' || data.type === 'checkin')
                ? (userData?.stats?.lifetimeCheckins || 0) + 1
                : (userData?.stats?.lifetimeCheckins || 0)
        });
    } else {
        await userRef.set({
            uid: data.userId,
            stats: {
                seasonPoints: data.points,
                lifetimeCheckins: data.type === 'checkin' ? 1 : 0,
                currentStreak: 0
            },
            role: 'user'
        });
    }

    return { success: true, pointsAwarded: data.points };
};

/**
 * Aggregate activity statistics for a venue over a specific period.
 */
export const getActivityStats = async (venueId: string, period: string) => {
    const now = Date.now();
    let startTime = now - (7 * 24 * 60 * 60 * 1000); // Default 1 week

    if (period === 'day') startTime = now - (24 * 60 * 60 * 1000);
    else if (period === 'month') startTime = now - (30 * 24 * 60 * 60 * 1000);
    else if (period === 'year') startTime = now - (365 * 24 * 60 * 60 * 1000);

    const snapshot = await db.collection('activity_logs')
        .where('venueId', '==', venueId)
        .where('timestamp', '>=', startTime)
        .get();

    let earned = 0;
    let redeemed = 0;
    const users = new Set();

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === 'redeem') {
            redeemed += Math.abs(data.points);
        } else {
            earned += data.points;
        }
        users.add(data.userId);
    });

    return {
        earned,
        redeemed,
        activeUsers: users.size,
        period
    };
};

/**
 * Update the approval status of a photo within a venue.
 */
export const updatePhotoStatus = async (
    venueId: string,
    photoId: string,
    updates: { isApprovedForFeed?: boolean, isApprovedForSocial?: boolean }
) => {
    const venueRef = db.collection('venues').doc(venueId);
    const venueDoc = await venueRef.get();

    if (!venueDoc.exists) throw new Error('Venue not found');

    const venueData = venueDoc.data() as Venue;
    const photos = venueData.photos || [];

    const updatedPhotos = photos.map(photo => {
        if (photo.id === photoId) {
            return { ...photo, ...updates };
        }
        return photo;
    });

    await venueRef.update({ photos: updatedPhotos });
    return { success: true };
};
/**
 * Update general venue information (Listing management)
 */
export const updateVenue = async (venueId: string, updates: Partial<Venue>, requestingUserId?: string) => {
    const venueRef = db.collection('venues').doc(venueId);
    const venueDoc = await venueRef.get();

    if (!venueDoc.exists) throw new Error('Venue not found');
    const venueData = venueDoc.data() as Venue;

    // [SECURITY REMEDIATION A-01]
    // Verify ownership or management role
    let isAdmin = false;
    let isOwner = false;
    let isManager = false;

    if (requestingUserId) {
        // Fetch the user's role to check for admin bypass
        const userDoc = await db.collection('users').doc(requestingUserId).get();
        const userData = userDoc.data();
        isAdmin = userData?.role === 'super-admin' || userData?.role === 'admin' || userData?.email === 'ryan@amaspc.com';

        isOwner = venueData.ownerId === requestingUserId;
        isManager = venueData.managerIds?.includes(requestingUserId);
    } else {
        // If no user ID is provided, we strictly deny unless it's a known internal call (none yet)
        throw new Error('Unauthorized: Authentication required for venue updates.');
    }

    // Whitelist allowable fields based on role
    const adminOnlyFields: (keyof Venue)[] = [
        'isVerifiedMaker', 'isLocalMaker', 'localScore', 'makerType',
        'isPaidLeagueMember', 'tier_config' as any,
        'hasGameVibeCheckEnabled'
    ];

    const ownerManagerFields: (keyof Venue)[] = [
        'name', 'nicknames',
        'address', 'description', 'hours', 'phone', 'website',
        'email', 'instagram', 'facebook', 'twitter',
        'amenities', 'amenityDetails', 'vibe', 'status',
        'originStory', 'insiderVibe', 'geoLoop',
        'isLowCapacity', 'isSoberFriendly',
        'physicalRoom', 'carryingMakers',
        'leagueEvent', 'triviaTime', 'deal', 'dealEndsIn', 'checkIns',
        'isVisible', 'isActive',
        'googlePlaceId', 'assets',
        'managersCanAddUsers',
        'liveGameStatus', 'photos',
        'manualStatus', 'manualStatusExpiresAt',
        'manualCheckIns', 'manualCheckInsExpiresAt'
    ];

    const playerFields: (keyof Venue)[] = ['status', 'liveGameStatus', 'photos'];

    const filteredUpdates: any = {};
    Object.keys(updates).forEach(key => {
        const field = key as keyof Venue;

        // Admins can change everything in the combined whitelist
        if (isAdmin && (adminOnlyFields.includes(field) || ownerManagerFields.includes(field))) {
            filteredUpdates[field] = updates[field];
        }
        // Owners/Managers can change non-admin fields
        else if (isOwner || isManager) {
            if (ownerManagerFields.includes(field)) {
                filteredUpdates[field] = updates[field];
            }
        }
        // Players/Users can only change status, liveGameStatus, and photos
        else if (playerFields.includes(field)) {
            filteredUpdates[field] = updates[field];
        }
    });

    // Special: If a status or game status update comes from a player, we should also trigger signal-based buzz updates
    if (filteredUpdates.status || filteredUpdates.liveGameStatus) {
        // We trigger buzz update in the background if possible
        // But for now we just rely on the direct update
    }

    // Authorization Check
    if (!isAdmin && !isOwner && !isManager) {
        // Regular players can only update playerFields
        const nonPlayerFields = Object.keys(filteredUpdates).filter(k => !playerFields.includes(k as any));
        if (nonPlayerFields.length > 0) {
            throw new Error('Unauthorized: You only have permission to update vibe and game status.');
        }
    }

    if (Object.keys(filteredUpdates).length === 0) {
        throw new Error('No valid update fields provided or insufficient permissions for selected fields.');
    }

    // [AUTO-GEOCODE] If address changed, resolve coordinates
    if (filteredUpdates.address && filteredUpdates.address !== venueData.address) {
        console.log(`[GEOCODE] Address changed for ${venueId}. Re-resolving coordinates...`);
        const geoResult = await geocodeAddress(filteredUpdates.address);
        if (geoResult) {
            filteredUpdates.location = { lat: geoResult.lat, lng: geoResult.lng };
            console.log(`[GEOCODE] Successfully resolved ${filteredUpdates.address} to ${geoResult.lat}, ${geoResult.lng}`);
        } else {
            console.warn(`[GEOCODE] Failed to resolve address: ${filteredUpdates.address}`);
        }
    }

    filteredUpdates.updatedAt = Date.now();
    await venueRef.update(filteredUpdates);

    return { success: true, updates: filteredUpdates };
};

/**
 * Sync a venue's details with Google Places API.
 */
export const syncVenueWithGoogle = async (venueId: string, manualPlaceId?: string) => {
    const venueRef = db.collection('venues').doc(venueId);
    const venueDoc = await venueRef.get();

    if (!venueDoc.exists) throw new Error('Venue not found');
    const venueData = venueDoc.data() as Venue;

    // [FINOPS] Safeguard: Prevent excessive syncs (max once per 24 hours per venue)
    const SYNC_COOLDOWN = 24 * 60 * 60 * 1000;
    const lastSynced = venueData.lastGoogleSync || 0;
    const now = Date.now();

    if (now - lastSynced < SYNC_COOLDOWN && !manualPlaceId) {
        const hoursRemaining = Math.ceil((SYNC_COOLDOWN - (now - lastSynced)) / (60 * 60 * 1000));
        console.warn(`[PLACES_SYNC] Throttled for ${venueData.name}. Last sync was recent. Try again in ${hoursRemaining}h.`);
        return {
            success: false,
            message: `Sync throttled. This venue was synced recently. Try again in ${hoursRemaining} hours.`
        };
    }

    console.log(`[PLACES_SYNC] Starting sync for ${venueData.name} (${venueId})...`);

    let placeId = manualPlaceId || venueData.googlePlaceId;

    // 1. If no placeId, search for it
    if (!placeId) {
        const searchResult = await searchPlace(venueData.name, venueData.address);
        if (searchResult) {
            placeId = searchResult.place_id;
            console.log(`[PLACES_SYNC] Found placeId: ${placeId} for ${venueData.name}`);
        } else {
            throw new Error(`Could not find a matching place on Google for "${venueData.name}".`);
        }
    }

    // 2. Fetch place details
    let details = await getPlaceDetails(placeId);
    if (!details) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[SYNC_BYPASS] Failed to fetch real details for ${placeId}. Using mock data for testing.`);
            details = {
                place_id: placeId,
                name: "The Brotherhood Lounge (Mock)",
                formatted_address: "119 Capitol Way N, Olympia, WA 98501",
                formatted_phone_number: "(360) 352-4161",
                website: "http://thebrotherhoodlounge.com/",
                geometry: {
                    location: { lat: 47.045, lng: -122.901 }
                }
            };
        } else {
            throw new Error(`Failed to fetch details for Google Place ID: ${placeId}`);
        }
    }

    // 3. Prepare updates
    const updates: Partial<Venue> = {
        googlePlaceId: placeId,
        lastGoogleSync: now,
        updatedAt: now
    };

    if (details.name) updates.name = details.name;
    if (details.formatted_phone_number) updates.phone = details.formatted_phone_number;
    if (details.website) updates.website = details.website;
    if (details.formatted_address) updates.address = details.formatted_address; // [NEW] Sync address

    // Construct Google Photo URL if available
    if (details.photos && details.photos.length > 0) {
        const photoRef = details.photos[0].photo_reference;
        const apiKey = process.env.GOOGLE_BACKEND_KEY;
        (updates as any).googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${apiKey}`;
    }

    // Map geometry to location
    if (details.geometry?.location) {
        updates.location = {
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng
        };
    }

    // Map opening hours (simplified as a string for now, as used in ListingManagementTab)
    if (details.opening_hours?.weekday_text) {
        updates.hours = details.opening_hours.weekday_text.join('\n');
    }

    // 4. Update Database
    await venueRef.update(updates);

    console.log(`[PLACES_SYNC] Successfully synced ${venueData.name} with Google.`);

    return {
        success: true,
        message: `Synced ${venueData.name} with Google Places.`,
        updates
    };
};

/**
 * Pulse Calculation Service (MVP)
 * Calculates real-time pulse score based on recent check-ins.
 * Weighting: (0-15m): 1.0, (15-30m): 0.8, (30-60m): 0.5
 */
export const getVenuePulse = async (venueId: string): Promise<number> => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const signalsSnapshot = await db.collection('signals')
        .where('venueId', '==', venueId)
        .where('type', '==', 'check_in')
        .where('timestamp', '>', oneHourAgo)
        .get();

    let pulseScore = 0;

    signalsSnapshot.forEach(doc => {
        const data = doc.data() as Signal;
        const ageMinutes = (now - data.timestamp) / (60 * 1000);

        if (ageMinutes <= 15) {
            pulseScore += 1.0;
        } else if (ageMinutes <= 30) {
            pulseScore += 0.8;
        } else if (ageMinutes <= 60) {
            pulseScore += 0.5;
        }
    });

    return Math.round(pulseScore);
};

/**
 * Checks if a venue with the given Google Place ID is already claimed.
 */
export const checkVenueClaimStatus = async (googlePlaceId: string) => {
    const snapshot = await db.collection('venues')
        .where('googlePlaceId', '==', googlePlaceId)
        .limit(1)
        .get();

    if (snapshot.empty) {
        return { isClaimed: false, exists: false };
    }

    const doc = snapshot.docs[0];
    const data = doc.data() as Venue;

    return {
        isClaimed: !!data.ownerId,
        exists: true,
        venueId: doc.id,
        name: data.name
    };
};

/**
 * Onboards a new venue partner by creating or updating a venue and sync with Google.
 */
export const onboardVenue = async (googlePlaceId: string, ownerId: string) => {
    console.log(`[ONBOARDING] Starting onboarding for Google Place: ${googlePlaceId} by User: ${ownerId}`);

    // 1. Check if venue exists with this placeId
    const status = await checkVenueClaimStatus(googlePlaceId);

    if (status.isClaimed) {
        console.warn(`[ONBOARDING] Failed: Venue ${googlePlaceId} already claimed.`);
        throw new Error('Venue is already claimed by another partner.');
    }

    let venueId = status.venueId;

    if (!status.exists) {
        // Create full skeleton venue with MVP defaults
        console.log(`[ONBOARDING] Creating new venue for ${googlePlaceId}`);
        const docRef = await db.collection('venues').add({
            name: 'Pending Sync...',
            googlePlaceId,
            ownerId,
            status: 'OPEN',
            type: 'bar',
            checkIns: 0,
            vibe: 'CHILL',
            vibeDefault: 'CHILL',
            assets: {},
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isVisible: true,
            isActive: true,
            tier_config: {
                is_directory_listed: true,
                is_league_eligible: false
            },
            attributes: {
                has_manned_bar: true,
                food_service: 'None',
                minors_allowed: true,
                noise_level: 'Conversational'
            },
            category: 'Dive'
        });
        venueId = docRef.id;
    } else {
        // Update existing venue with ownerId
        console.log(`[ONBOARDING] Updating existing venue ${venueId} with owner ${ownerId}`);
        await db.collection('venues').doc(venueId!).update({
            ownerId,
            updatedAt: Date.now()
        });
    }

    // 2. User update (Role sync)
    const userRef = db.collection('users').doc(ownerId);
    await userRef.update({
        role: 'owner',
        [`venuePermissions.${venueId}`]: 'owner'
    });

    // 3. Trigger Google Sync
    console.log(`[ONBOARDING] Triggering Google Maps sync for ${venueId}...`);
    try {
        const syncResult = await syncVenueWithGoogle(venueId!);
        console.log(`[ONBOARDING] Success: Venue ${venueId} onboarded and synced.`);
        return {
            venueId,
            syncResult
        };
    } catch (error) {
        console.error(`[ONBOARDING] Warning: Sync failed for ${venueId}:`, error);
        return {
            venueId,
            syncError: (error as Error).message
        };
    }
};

/**
 * Add a member to a venue (Manager or Staff)
 */
export const addVenueMember = async (venueId: string, email: string, role: string, requestingUserId: string) => {
    const venueRef = db.collection('venues').doc(venueId);
    const venueDoc = await venueRef.get();
    if (!venueDoc.exists) throw new Error('Venue not found');
    const venueData = venueDoc.data() as Venue;

    // Verify permissions
    const isOwner = venueData.ownerId === requestingUserId;
    const isManager = venueData.managerIds?.includes(requestingUserId);
    const canAdd = isOwner || (isManager && venueData.managersCanAddUsers);

    if (!canAdd) {
        throw new Error('Unauthorized: You do not have permission to add members to this venue.');
    }

    // 1. Find user by email
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (userSnapshot.empty) {
        throw new Error(`User with email ${email} not found. They must sign in to OlyBars once before being added to a team.`);
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // 2. Update user's venuePermissions
    const venuePermissions = userData.venuePermissions || {};
    venuePermissions[venueId] = role;

    await userDoc.ref.update({ venuePermissions });

    // 3. If role is manager, add to venue's managerIds
    if (role === 'manager' || role === 'owner') {
        const managerIds = venueData.managerIds || [];
        if (!managerIds.includes(userId)) {
            managerIds.push(userId);
            await venueRef.update({ managerIds });
        }
    }

    return { success: true, userId, email, role };
};

/**
 * Remove a member from a venue
 */
export const removeVenueMember = async (venueId: string, memberId: string, requestingUserId: string) => {
    const venueRef = db.collection('venues').doc(venueId);
    const venueDoc = await venueRef.get();
    if (!venueDoc.exists) throw new Error('Venue not found');
    const venueData = venueDoc.data() as Venue;

    // Verify permissions
    const isOwner = venueData.ownerId === requestingUserId;
    const isManager = venueData.managerIds?.includes(requestingUserId);
    const canRemove = isOwner || (isManager && venueData.managersCanAddUsers);

    if (!canRemove) {
        throw new Error('Unauthorized: You do not have permission to remove members from this venue.');
    }

    // 1. Update user's venuePermissions
    const userRef = db.collection('users').doc(memberId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new Error('User not found');
    const userData = userDoc.data();

    const venuePermissions = userData.venuePermissions || {};
    delete venuePermissions[venueId];

    await userRef.update({ venuePermissions });

    // 2. Remove from venue's managerIds if present
    const managerIds = (venueData.managerIds || []).filter(id => id !== memberId);
    await venueRef.update({ managerIds });

    return { success: true };
};

/**
 * Fetch all members associated with a venue
 */
export const getVenueMembers = async (venueId: string) => {
    const usersRef = db.collection('users');
    // We query for users who have ANY role for this venue
    const snapshot = await usersRef.where(`venuePermissions.${venueId}`, 'in', ['owner', 'manager', 'staff']).get();

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            email: data.email,
            displayName: data.displayName,
            role: data.venuePermissions[venueId],
            photoURL: data.photoURL
        };
    });
};

/**
 * Generate proactive AI insights for a venue using Gemini.
 */
export const generateVenueInsights = async (venueId: string) => {
    const stats = await getActivityStats(venueId, 'fortnight');
    const venueDoc = await db.collection('venues').doc(venueId).get();
    if (!venueDoc.exists) throw new Error('Venue not found');

    // Lazy import GeminiService to follow OlyBars AI Infrastructure Rules
    const { GeminiService } = await import('../../functions/src/services/geminiService');
    const gemini = new GeminiService();

    return await gemini.generateManagerSuggestion(stats, { id: venueId, ...venueDoc.data() });
};


