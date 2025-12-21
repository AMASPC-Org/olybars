import { db } from './firebaseAdmin';
import { updateVenueBuzz } from './venueService';

async function testBuzz() {
    const testVenueId = 'hannahs';
    console.log(`Testing Buzz for: ${testVenueId}`);

    // 1. Reset venue
    await db.collection('venues').doc(testVenueId).update({
        status: 'chill',
        'currentBuzz.score': 0
    });

    // 2. Add 7 check-ins (7 * 10 = 70 points -> Buzzing)
    console.log('Adding 7 check-ins...');
    for (let i = 0; i < 7; i++) {
        await db.collection('signals').add({
            venueId: testVenueId,
            userId: `test_user_${i}`,
            type: 'check_in',
            timestamp: Date.now()
        });
    }

    // 3. Trigger recalculation
    await updateVenueBuzz(testVenueId);

    // 4. Verify
    const doc = await db.collection('venues').doc(testVenueId).get();
    const data = doc.data();
    console.log(`Current Status: ${data?.status}`);
    console.log(`Current Score: ${data?.currentBuzz?.score}`);

    if (data?.status === 'buzzing' && data?.currentBuzz?.score >= 61) {
        console.log('✅ Buzz Algorithm Verified!');
    } else {
        console.error('❌ Buzz Algorithm Verification Failed.');
    }
}

testBuzz();
