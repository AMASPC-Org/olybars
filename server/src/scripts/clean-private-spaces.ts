
import { db } from '../firebaseAdmin';

const UPDATES = [
    {
        id: 'well-80',
        spaces: [
            {
                name: "Back Barrel Room",
                capacity: 40,
                description: "A semi-private space behind the main bar, perfect for casual gatherings.",
                amenities: ["TV", "Long Tables"],
                price_range: "$$",
                booking_link: "https://well80.com/private-events"
            }
        ]
    },
    {
        id: 'anthonys-hearthfire',
        spaces: []
    },
    {
        id: 'hannahs',
        spaces: []
    }
];

async function clean() {
    console.log("🧹 STARTING CLEANUP (ROUND 2 - Force Set)...");
    const batch = db.batch();

    for (const update of UPDATES) {
        const ref = db.collection('venues').doc(update.id);
        // [IMPORTANT] Use set with merge:true to force update the specific field
        // update() can sometimes fail silently if doc doesn't exist, though here they do.
        batch.set(ref, { privateSpaces: update.spaces }, { merge: true });
        console.log(`Prepared update for ${update.id}`);
    }

    await batch.commit();
    console.log("✅ Batch committed.");
}

clean().catch(console.error);
