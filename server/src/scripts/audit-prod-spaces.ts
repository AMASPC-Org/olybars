
import { db } from '../firebaseAdmin.js';

const auditProdSpaces = async () => {
    try {
        console.log('\n🔍 AUDIT: Scanning ALL VENUES for Private Spaces (Production)\n');
        console.log('--------------------------------------------------');

        const venuesSnapshot = await db.collection('venues').get();

        venuesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const spaces = data.privateSpaces || [];

            if (spaces.length > 0) {
                console.log(`\n📍 VENUE: ${data.name} (${doc.id})`);
                console.log(`   ⚠️ privateSpaces FOUND (${spaces.length}):`);
                spaces.forEach((s: any) => {
                    console.log(`      - ${s.name} (Cap: ${s.capacity})`);
                });
            }
        });

        console.log('\n--------------------------------------------------');
        console.log('✅ Audit Complete.');
    } catch (error) {
        console.error('❌ Audit Failed:', error);
    }
};

auditProdSpaces();
