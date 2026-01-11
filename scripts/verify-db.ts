import { db } from '../server/src/firebaseAdmin';

async function verify() {
    console.log('🔍 Checking Firestore Emulator...');
    try {
        const snapshot = await db.collection('venues').get();
        console.log(`📊 Total venues in emulator: ${snapshot.size}`);

        const theLocal = snapshot.docs.find(doc => doc.data().name === 'The Local');
        const theLocalYelm = snapshot.docs.find(doc => doc.data().name === 'The Local Yelm');
        const eagles = snapshot.docs.find(doc => doc.data().name.includes('Eagles Olympia'));

        console.log('--- Results ---');
        console.log('The Local exists:', !!theLocal);
        if (theLocal) console.log('  ID:', theLocal.id);

        console.log('The Local Yelm exists:', !!theLocalYelm);
        if (theLocalYelm) console.log('  ID:', theLocalYelm.id);

        console.log('Eagles Olympia exists:', !!eagles);
        if (eagles) console.log('  Name:', eagles.data().name);

        process.exit(0);
    } catch (e) {
        console.error('❌ Verification failed:', e);
        process.exit(1);
    }
}

verify();
