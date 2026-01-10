import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Initialize Firebase (Requires Service Account)
const serviceAccountPath = path.join(__dirname, '../service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('? FATAL: service-account.json missing!');
    console.error('   -> Go to Firebase Console > Project Settings > Service Accounts');
    console.error('   -> Generate New Private Key');
    console.error('   -> Save it as refinery/service-account.json');
    process.exit(1);
}

// Use path directly to avoid JSON parsing issues
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
});

const db = admin.firestore();

async function syncVenues() {
    const dataDir = path.join(__dirname, '../data');

    if (!fs.existsSync(dataDir)) {
        console.error('? Data directory not found.');
        return;
    }

    const venues = fs.readdirSync(dataDir);

    console.log(`? Starting Sync for ${venues.length} potential venues...`);

    for (const slug of venues) {
        const jsonPath = path.join(dataDir, slug, 'data.json');

        // Skip if no data.json (e.g., .DS_Store or empty folders)
        if (!fs.existsSync(jsonPath)) continue;

        try {
            // 2. Read the Local JSON
            const rawData = fs.readFileSync(jsonPath, 'utf-8');
            const venueData = JSON.parse(rawData);

            // 3. Add Metadata
            const finalPayload = {
                ...venueData,
                last_updated: admin.firestore.FieldValue.serverTimestamp(),
                slug: slug,
                source: 'refinery_v3'
            };

            // 4. Push to Firestore
            // Uses { merge: true } so we don't wipe out manual edits (like photos) if they exist
            await db.collection('venues').doc(slug).set(finalPayload, { merge: true });

            console.log(`? Synced: ${slug}`);

        } catch (error) {
            console.error(`? Failed to sync ${slug}: `, error);
        }
    }
    console.log('? Sync Complete.');
}

syncVenues();
