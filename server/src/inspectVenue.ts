import { db } from './firebaseAdmin';

async function inspectVenue(id: string) {
    try {
        const doc = await db.collection('venues').doc(id).get();
        if (doc.exists) {
            console.log(JSON.stringify(doc.data(), null, 2));
        } else {
            console.log(`Venue ${id} not found.`);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

const venueId = process.argv[2] || 'well-80';
inspectVenue(venueId);
