import { db } from './firebaseAdmin.js';
import { Venue, Signal, SignalType } from '../../src/types';

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
        const venues = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Venue[];

        return sortVenuesByBuzzClock(venues);
    } catch (error) {
        console.error('Error fetching venues from Firestore:', error);
        throw error;
    }
};

export const checkIn = async (venueId: string, userId: string, userLat: number, userLng: number) => {
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

    // 2. Throttling Logic (Rule 03-C)
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

        // Global Throttle: 120 minutes
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
    const twelveHoursAgo = timestamp - (12 * 60 * 60 * 1000);
    const daySignals = await db.collection('signals')
        .where('userId', '==', userId)
        .where('type', '==', 'check_in')
        .where('timestamp', '>=', twelveHoursAgo)
        .get();

    if (daySignals.size >= 2) {
        throw new Error('League Protocol: Max 2 check-ins per 12-hour window. Take it slow, friend!');
    }

    const signal: Partial<Signal> = {
        venueId,
        userId,
        type: 'check_in',
        timestamp
    };

    await db.collection('signals').add(signal);
    await db.collection('venues').doc(venueId).update({
        checkIns: (venueData.checkIns || 0) + 1
    });

    // Calculate points (placeholder for user service)
    console.log(`User ${userId} earned 10 points for checking in at ${venueId}`);

    // Recalculate Buzz
    await updateVenueBuzz(venueId);

    return { success: true, message: `Checked in at ${venueData.name}!` };
};
