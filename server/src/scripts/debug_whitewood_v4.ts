
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Use ADC (Application Default Credentials)
console.log('Initializing with ADC...');

try {
    initializeApp({ projectId: 'ama-ecosystem-prod' }); // Harcode prod project ID to be sure
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

                // OPTIONAL: UNCLAIM IT
                // console.log('UNCLAIMING...');
                // doc.ref.update({ ownerId: null, managerIds: [] });
            });
        }
    }

    checkVenue().catch(console.error);

} catch (e: any) {
    console.error('Failed to init/run:', e.message);
}
