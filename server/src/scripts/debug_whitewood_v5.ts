
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';

console.log('Initializing with ADC...');

try {
    initializeApp({ projectId: 'ama-ecosystem-prod' });
    const db = getFirestore();

    const GOOGLE_PLACE_ID = 'ChIJixQ1knZzkVQR5OlplvOiO_k'; // Whitewood Cider

    async function unclaimVenue() {
        console.log(`Unclaiming venue with Google Place ID: ${GOOGLE_PLACE_ID}`);
        const snapshot = await db.collection('venues').where('googlePlaceId', '==', GOOGLE_PLACE_ID).get();

        if (snapshot.empty) {
            console.log('RESULT: Venue NOT FOUND to unclaim.');
        } else {
            for (const doc of snapshot.docs) {
                console.log(`Unclaiming ${doc.id} (Current Owner: ${doc.data().ownerId})...`);
                await doc.ref.update({
                    ownerId: FieldValue.delete(),
                    managerIds: FieldValue.delete()
                });
                console.log('SUCCESS: Venue Unclaimed.');
            }
        }
    }

    unclaimVenue().catch(console.error);

} catch (e: any) {
    console.error('Failed to init/run:', e.message);
}
