import { updateVenue } from '../server/src/venueService';

async function revertVenue() {
    const venueId = 'well-80';
    const originalUpdates = {
        happyHour: {
            description: "$1 Off Pints & Leopold Pretzels",
            days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            startTime: "15:00",
            endTime: "18:00"
        },
        gameFeatures: [] // Assuming it was empty or base-seeded
    } as any;

    try {
        console.log(`[CLEANUP] Reverting venue ${venueId}...`);
        await updateVenue(venueId, originalUpdates, '36zp5z8K8oWZEDemU1u1QpUb48r1');
        console.log('[CLEANUP] SUCCESS: Venue reverted.');
    } catch (error: any) {
        console.error('[CLEANUP] FAILED:', error.message);
    }
}

revertVenue();
