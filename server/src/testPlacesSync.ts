import { syncVenueWithGoogle } from './venueService';

async function testSync() {
    console.log('--- STARTING PLACES SYNC TEST ---');
    const testVenueId = 'well-80'; // Well 80 Artesian Brewing

    try {
        const result = await syncVenueWithGoogle(testVenueId);
        console.log('SUCCESS:', result.message);
        console.log('UPDATED FIELDS:', JSON.stringify(result.updates, null, 2));
    } catch (error: any) {
        console.error('FAILED:', error.message);
    }
    console.log('--- TEST COMPLETE ---');
    process.exit(0);
}

testSync();
