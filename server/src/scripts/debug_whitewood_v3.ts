
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Use CWD (Root) to find key
const keyPath = path.resolve(process.cwd(), 'final_key.json');
console.log('Loading key from:', keyPath);

if (!fs.existsSync(keyPath)) {
    console.error(`FATAL: Key not found at ${keyPath}`);
    process.exit(1);
}

try {
    const serviceAccount = require(keyPath);
    initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore();

    const GOOGLE_PLACE_ID = 'ChIJixQ1knZzkVQR5OlplvOiO_k'; // Whitewood Cider

    async function checkVenue() {
        console.log(`Checking venue with Google Place ID: ${GOOGLE_PLACE_ID}`);
        const snapshot = await db.collection('venues').where('googlePlaceId', '==', GOOGLE_PLACE_ID).get();

        if (snapshot.empty) {
            console.log('RESULT: Venue NOT FOUND in Firestore.');
        } else {
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log('RESULT: Venue FOUND');
                console.log('ID:', doc.id);
                console.log('Name:', data.name);
                console.log('OwnerId:', data.ownerId);
                console.log('Is Claimed:', !!data.ownerId);
            });
        }
    }

    checkVenue().catch(console.error);

} catch (e: any) {
    console.error('Failed to load key/run:', e.message);
}
