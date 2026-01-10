const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const serviceAccountPath = path.join(__dirname, '../service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('? FATAL: service-account.json missing!');
    process.exit(1);
}

try {
    // Use path directly
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath)
    });
    console.log('? Firebase initialized successfully!');
} catch (error) {
    console.error('? Firebase Init Failed:', error);
    process.exit(1);
}

const db = admin.firestore();

async function syncVenues() {
    const dataDir = path.join(__dirname, '../data');

    if (!fs.existsSync(dataDir)) {
        console.error('? Data directory not found.');
        return;
    }

    const venues = fs.readdirSync(dataDir);

    console.log(`? Starting Safer Sync (Draft Mode) for ${venues.length} potential venues...`);

    for (const slug of venues) {
        const jsonPath = path.join(dataDir, slug, 'data.json');

        if (!fs.existsSync(jsonPath)) continue;

        try {
            const rawData = fs.readFileSync(jsonPath, 'utf-8');
            const venueData = JSON.parse(rawData);

            // SAFE UPDATE: We write to 'ai_draft_profile' instead of overwriting the root.
            // This allows manual review in the Admin Dashboard before going live.
            await db.collection('venues').doc(slug).set({
                ai_draft_profile: {
                    ...venueData,
                    synced_at: admin.firestore.FieldValue.serverTimestamp(),
                    status: 'needs_review' // Flag for the Admin UI
                }
            }, { merge: true });

            console.log('? Draft Saved: ' + slug + ' (Live profile untouched)');

        } catch (error) {
            console.error(`? Failed to sync ${slug}: `, error);
        }
    }
    console.log('? Sync Complete.');
}

syncVenues();
