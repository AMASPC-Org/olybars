import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import venues from './data/venues_master.json' with { type: 'json' };

dotenv.config({ path: '.env.local' });
dotenv.config();

const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'olybars-dev';

if (!admin.apps.length) {
    admin.initializeApp({
        projectId
    });
}

const db = admin.firestore();

const targetIds = [
    'dos-hermanos-olympia',
    'octapas-cafe',
    'oly-taproom',
    'briggs-taphouse'
];

async function syncNewVenues() {
    console.log(`🚀 Syncing to project: ${projectId}`);

    for (const id of targetIds) {
        const venue = venues.find(v => v.id === id);
        if (!venue) {
            console.error(`❌ Could not find venue with id: ${id}`);
            continue;
        }

        console.log(`✨ Syncing: ${venue.name} (${id})...`);
        await db.collection('venues').doc(id).set(venue, { merge: true });
        console.log(`✅ Success: ${venue.name}`);
    }

    console.log('🎉 Done!');
    process.exit(0);
}

syncNewVenues().catch(err => {
    console.error('💥 Error:', err);
    process.exit(1);
});
