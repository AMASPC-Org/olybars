import { db } from '../firebaseAdmin.ts';

async function updateWell80() {
    const venuesRef = db.collection('venues');
    const snapshot = await venuesRef.where('name', '==', 'Well 80 Brewhouse').get();

    if (snapshot.empty) {
        console.log('No matching venue found for name: Well 80 Brewhouse');
        // Try searching for the ID 'well-80'
        const doc = await venuesRef.doc('well-80').get();
        if (doc.exists) {
            console.log('Found venue by ID: well-80');
            await updateDoc(doc.ref);
        } else {
            console.log('No venue found by ID: well-80');
        }
        return;
    }

    for (const doc of snapshot.docs) {
        console.log(`Found venue: ${doc.id}`);
        await updateDoc(doc.ref);
    }
}

async function updateDoc(ref: any) {
    const happyHour = {
        startTime: '15:00',
        endTime: '18:00',
        description: '$1 Off Pints & Leopold Pretzels',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    };

    await ref.update({
        happyHour,
        happyHourSpecials: "$1 OFF PINTS & LEOPOLD PRETZELS"
    });
    console.log('Successfully updated Happy Hour for Well 80');
}

updateWell80().catch(console.error);
