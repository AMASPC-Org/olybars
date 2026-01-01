import { db } from '../server/src/firebaseAdmin.js';

async function checkVenue() {
    const doc = await db.collection('venues').doc('well-80').get();
    if (!doc.exists) {
        console.log('Venue not found');
        return;
    }
    const data = doc.data();
    console.log('Venue Owner ID:', data?.ownerId);
    console.log('Venue Manager IDs:', data?.managerIds);
    console.log('Current Happy Hour:', JSON.stringify(data?.happyHour, null, 2));
}

checkVenue();
