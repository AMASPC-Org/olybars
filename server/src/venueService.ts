import { db } from './firebaseAdmin.js';
import admin from 'firebase-admin';
import { Venue, Signal, SignalType, Badge, UserBadgeProgress } from '../../src/types';
import { BADGES } from '../../src/config/badges';

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
 * - Hard Check-in: 10.0 pts
 * - Vibe Report: 3.0 pts
 * - Decay: -50% every 60 mins
 */
export const updateVenueBuzz = async (venueId: string) => {
    const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000);
    // Filter by venueId only to avoid needing a composite index in dev
    const signalsSnapshot = await db.collection('signals')
        .where('venueId', '==', venueId)
        .get();

    let score = 0;
    const now = Date.now();

    signalsSnapshot.forEach(doc => {
        const data = doc.data() as Signal;
        if (data.timestamp < twelveHoursAgo) return; // In-memory filtering
        let signalValue = 0;
        if (data.type === 'check_in') signalValue = 10;
        if (data.type === 'vibe_report') signalValue = 3;

        // Recency Decay: 50% drop every 60 mins
        const ageInHours = (now - data.timestamp) / (60 * 60 * 1000);
        const decayedValue = signalValue * Math.pow(0.5, ageInHours);
        score += decayedValue;
    });

    let status: 'chill' | 'lively' | 'buzzing' = 'chill';
    if (score > 60) status = 'buzzing';
    else if (score > 20) status = 'lively';

    await db.collection('venues').doc(venueId).update({
        'currentBuzz.score': score,
        'currentBuzz.lastUpdated': now,
        'status': status
    });
};

export const fetchVenues = async (): Promise<Venue[]> => {
    try {
        const snapshot = await db.collection('venues').get();
        const venues = snapshot.docs
            .map(doc => {
                const data = doc.data();
                const venue = { id: doc.id, ...data } as Venue;

                // Injecting mock amenities for the "Play" feature demo
                if (venue.id === 'well-80') {
                    venue.amenityDetails = [
                        { id: 'cornhole', name: 'Cornhole', count: 2, isLeaguePartner: true },
                        { id: 'arcade', name: 'Arcade Cabinets', count: 12, isLeaguePartner: true },
                        { id: 'trivia', name: 'Pub Trivia', count: 1, isLeaguePartner: true }
                    ];
                } else if (venue.id === 'hannahs') {
                    venue.amenityDetails = [
                        { id: 'pool', name: 'Pool Tables', count: 4, isLeaguePartner: true },
                        { id: 'darts', name: 'Electronic Darts', count: 6, isLeaguePartner: true },
                        { id: 'karaoke', name: 'Stage Karaoke', count: 1, isLeaguePartner: true }
                    ];
                } else if (venue.id === 'brotherhood-lounge' || venue.id === 'brotherhood') {
                    venue.amenityDetails = [
                        { id: 'pool', name: 'Pool Tables', count: 4, isLeaguePartner: true },
                        { id: 'arcade', name: 'Retro Arcade', count: 5, isLeaguePartner: false }
                    ];
                }

                return venue;
            })
            .filter(v => v.isActive !== false); // Filter out Ghost List / Legacy

        return sortVenuesByBuzzClock(venues);
    } catch (error) {
        console.error('Error fetching venues from Firestore:', error);
        throw error;
    }
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
        if (distance > 100) {
            throw new Error(`Too far away! You are ${Math.round(distance)}m from ${venueData.name}.`);
        }
    }

    // 1. Conflict of Interest Check (Rule 03-B)
    if (venueData.ownerId === userId || venueData.managerIds?.includes(userId)) {
        throw new Error('Conflict of Interest: Venue staff and management are not eligible for League points at their own establishment.');
    }

    const timestamp = Date.now();

    // 2. LCB Compliance Check (Rule 03-A): Max 2 check-ins per 12-hour window
    const twelveHoursAgo = timestamp - (12 * 60 * 60 * 1000);
    const checkInsLast12h = await db.collection('signals')
        .where('userId', '==', userId)
        .where('type', '==', 'check_in')
        .where('timestamp', '>', twelveHoursAgo)
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
        const minutesSinceLast = Math.floor(timeSinceLast / (60 * 1000));

        // Global Throttle: 120 minutes (2 hours)
        if (timeSinceLast < (120 * 60 * 1000)) {
            const waitTime = 120 - minutesSinceLast;
            throw new Error(`Slow down, League Legend! The Pulse needs a bit more time. You can clock in again in ${waitTime} minutes.`);
        }

        // Same-Venue Throttle: 360 minutes (6 hours)
        if (lastCheckIn.venueId === venueId && timeSinceLast < (360 * 60 * 1000)) {
            const waitTime = 360 - minutesSinceLast;
            throw new Error(`Already checked in here recently! To keep the Pulse fair, please wait another ${Math.floor(waitTime / 60)} hours and ${waitTime % 60} minutes before checking into ${venueData.name} again.`);
        }
    }

    // 3. WA State LCB Compliance: Max 2 check-ins per 12h window
    const twelveHoursAgoCheck = timestamp - (12 * 60 * 60 * 1000);
    const daySignals = await db.collection('signals')
        .where('userId', '==', userId)
        .where('type', '==', 'check_in')
        .where('timestamp', '>=', twelveHoursAgoCheck)
        .get();

    if (daySignals.size >= 2) {
        throw new Error('League Protocol: Max 2 check-ins per 12-hour window. Take it slow, friend!');
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
    // Optimization: retrieving all signals might be expensive.
    // For now, valid for small scale.
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
            // For "visit 5 venues"
            // If category is specified, we'd need venue types. Assuming 'venueIds' list is the "Core 5" list for Artesian Well
            if (badge.criteria.venueIds) {
                const matchCount = badge.criteria.venueIds.filter(vid => uniqueVenues.has(vid)).length;
                if (matchCount >= badge.criteria.count) unlocked = true;
            }
        }

        if (unlocked) {
            newBadges.push(badge);
            // Update User Profile with new Badge
            await userRef.update({
                [`badges.${badge.id}`]: {
                    badgeId: badge.id,
                    progress: 1, // Full
                    unlocked: true,
                    unlockedAt: Date.now()
                }
            });
        } else {
            // Update progress if checkin_set
            if (badge.criteria.type === 'checkin_set' && badge.criteria.venueIds) {
                const visitedCount = badge.criteria.venueIds.filter(vid => uniqueVenues.has(vid)).length;
                const progress = visitedCount / badge.criteria.venueIds.length;
                // Only update if changed or doesn't exist? (Optional, skipping for perf/locking needed?)
                // Updating progress map
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
export const updateVenue = async (venueId: string, updates: Partial<Venue>) => {
    const venueRef = db.collection('venues').doc(venueId);

    // Whitelist allowable fields for owner updates to prevent integrity issues
    const allowedFields: (keyof Venue)[] = [
        'description', 'hours', 'phone', 'website',
        'email', 'instagram', 'facebook', 'twitter',
        'amenities', 'vibe',
        // Maker Fields
        'originStory', 'insiderVibe', 'geoLoop',
        'isLowCapacity', 'isSoberFriendly',
        'makerType', 'physicalRoom', 'carryingMakers',
        'isLocalMaker', 'localScore'
    ];

    const filteredUpdates: any = {};
    Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key as keyof Venue)) {
            filteredUpdates[key] = updates[key as keyof Venue];
        }
    });

    if (Object.keys(filteredUpdates).length === 0) {
        throw new Error('No valid update fields provided');
    }

    filteredUpdates.updatedAt = Date.now();
    await venueRef.update(filteredUpdates);

    return { success: true, updates: filteredUpdates };
};


