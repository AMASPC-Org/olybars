
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) initializeApp();
const db = getFirestore();

async function inspect() {
    console.log('--- Checking Octapas ---');
    const octapas = await db.collection('venues').where('name', '>=', 'Octapas').where('name', '<=', 'Octapas\uf8ff').get();
    octapas.docs.forEach(d => {
        const data = d.data();
        console.log(`ID: ${d.id}`);
        console.log(`Name: ${data.name}`);
        console.log(`Tags: ${JSON.stringify(data.sceneTags || [])}`);
        console.log(`GoogleID: ${data.googlePlaceId}`);
        console.log('---');
    });

    console.log('--- Checking Wine Loft ---');
    const wineloft = await db.collection('venues').where('name', '>=', 'The Wine Loft').where('name', '<=', 'The Wine Loft\uf8ff').get();
    wineloft.docs.forEach(d => {
        const data = d.data();
        console.log(`ID: ${d.id}`);
        console.log(`Name: ${data.name}`);
        console.log(`Tags: ${JSON.stringify(data.sceneTags || [])}`);
        console.log(`GoogleID: ${data.googlePlaceId}`);
        console.log('---');
    });

    console.log('--- Checking State & Central ---');
    const sc = await db.collection('venues').doc('state-and-central').get();
    if (sc.exists) {
        console.log(`ID: ${sc.id}`);
        console.log(`Name: ${sc.data().name}`);
        console.log(`GoogleID: ${sc.data().googlePlaceId}`);
    } else {
        console.log('State & Central not found by ID!');
    }
}

inspect();
