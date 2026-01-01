import { db } from '../server/src/firebaseAdmin.js';

async function verifyWell80() {
    const doc = await db.collection('venues').doc('well-80').get();
    const data = doc.data();
    console.log('WELL 80 DATA:', JSON.stringify(data, null, 2));
}

verifyWell80();
