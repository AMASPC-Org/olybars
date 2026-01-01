import { updateVenue, fetchVenues } from '../server/src/venueService';
import { db } from '../server/src/firebaseAdmin';

async function testVenueUpdate() {
    console.log('--- STARTING BACKEND SERVICE VERIFICATION (LIVE DB) ---');
    const venueId = 'well-80';

    const updates = {
        happyHour: {
            startTime: '14:30',
            endTime: '17:30',
            description: 'Refined HH Special',
            days: ['Mon', 'Tue']
        },
        gameFeatures: [
            { id: 'darts_1', type: 'darts', name: 'Refined Darts', count: 1, status: 'active' }
        ]
    } as any;

    try {
        console.log(`[TEST] Updating venue ${venueId}...`);
        // We bypass the token verification by passing a mock requestingUserId that we know is the owner
        // Ryan is usually the owner in seed data
        const result = await updateVenue(venueId, updates, '36zp5z8K8oWZEDemU1u1QpUb48r1');
        console.log('[TEST] Update Result:', JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('[TEST] SUCCESS: Venue updated in Firestore.');

            // Verify Cache Invalidation
            console.log('[TEST] Fetching venues to check cache consistency...');
            const venues = await fetchVenues();
            const updatedVenue = venues.find(v => v.id === venueId);

            if (updatedVenue?.happyHour?.startTime === '14:30') {
                console.log('[TEST] SUCCESS: Cache invalidated and fresh data fetched.');
                console.log('[TEST] Happy Hour:', JSON.stringify(updatedVenue.happyHour));
            } else {
                console.error('[TEST] FAILURE: Data in cache is stale!');
            }

            if (updatedVenue?.gameFeatures?.[0]?.name === 'Refined Darts') {
                console.log('[TEST] SUCCESS: gameFeatures persisted and verified.');
            } else {
                console.error('[TEST] FAILURE: gameFeatures missing from fetch result!');
            }
        }
    } catch (error: any) {
        console.error('[TEST] EXCEPTION:', error.message);
    }
}

testVenueUpdate();
