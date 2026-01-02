import { db } from '../server/src/firebaseAdmin.ts';
import { venues } from '../server/src/seed.ts';

async function syncVenues() {
    console.log('🚀 Starting Safe Venue Sync to Production...');

    let updatedCount = 0;
    let failedCount = 0;

    for (const venue of venues) {
        try {
            const { id, ...venueData } = venue as any;
            const venueRef = db.collection('venues').doc(id);

            // Using set with merge: true to avoid blowing away live fields 
            // if we missed any in the static seed.
            await venueRef.set({
                ...venueData,
                updatedAt: Date.now()
            }, { merge: true });

            console.log(`✅ Synced: ${venueData.name} (${id})`);
            updatedCount++;
        } catch (error) {
            console.error(`❌ Failed to sync ${venue.name}:`, error);
            failedCount++;
        }
    }

    console.log('\n--- Sync Complete ---');
    console.log(`Updated: ${updatedCount}`);
    console.log(`Failed: ${failedCount}`);
    process.exit(failedCount > 0 ? 1 : 0);
}

syncVenues();
