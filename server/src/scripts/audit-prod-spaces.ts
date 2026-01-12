
import { db } from '../firebaseAdmin';

const TARGET_VENUES = [
    'hannahs',
    'well-80',
    'anthonys-hearthfire',
    'the-mark-olympia'
];

async function audit() {
    console.log("🔍 AUDITING PROD VENUES...");

    for (const id of TARGET_VENUES) {
        const doc = await db.collection('venues').doc(id).get();
        if (!doc.exists) {
            console.log(`❌ ${id}: Document not found.`);
            continue;
        }

        const data = doc.data();
        const spaces = data?.privateSpaces || [];

        console.log(`\n📍 VENUE: ${data?.name} (${id})`);
        if (spaces.length === 0) {
            console.log(`   ✅ privateSpaces: [] (EMPTY)`);
        } else {
            console.log(`   ⚠️ privateSpaces FOUND (${spaces.length}):`);
            spaces.forEach((s: any) => {
                console.log(`      - ${s.name} (Cap: ${s.capacity})`);
            });
        }
    }
}

audit().catch(console.error);
