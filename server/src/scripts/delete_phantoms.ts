
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) initializeApp();
const db = getFirestore();

async function deletePhantoms() {
    console.log('--- Deleting Octapas (New) ---');
    const octapasNew = await db.collection('venues').doc('octapas-cafe-fixed').get();
    if (octapasNew.exists) {
        console.log(`Deleting ${octapasNew.id}...`);
        await db.collection('venues').doc('octapas-cafe-fixed').delete();
        console.log('Deleted.');
    } else {
        console.log('Octapas (New) not found.');
    }

    console.log('--- Finding Duplicate Wine Loft ---');
    // Scan all venues to be sure
    const all = await db.collection('venues').get();
    all.docs.forEach(d => {
        const n = d.data().name.toLowerCase();
        if (n.includes('wine loft')) {
            console.log(`Found: ${d.id} | ${d.data().name} | GID: ${d.data().googlePlaceId}`);
        }
    });
}

deletePhantoms();
