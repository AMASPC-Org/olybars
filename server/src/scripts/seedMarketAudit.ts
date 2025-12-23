
import { db } from '../firebaseAdmin';

const AUDIT_UPDATES = [
    {
        name: "Well 80",
        update: {
            originStory: "Built on one of Olympia's original Artesian wells, Well 80 is a brewhouse and pizzeria that honors our city's brewing heritage. We 'Make Beer, Not War'.",
            geoLoop: "Downtown_Walkable",
            isLocalMaker: true,
            isVerifiedMaker: true,
            localScore: 95
        }
    },
    {
        name: "Ilk Lodge",
        update: {
            originStory: "Taking over the historic Fish Tale spot, Ilk Lodge brings a rustic, personality-driven brewery experience. It's not just a pub; it's a lodge for the modern Olympian.",
            geoLoop: "Warehouse_Tumwater",
            isLocalMaker: true,
            isVerifiedMaker: true,
            isLowCapacity: false
        }
    },
    {
        name: "Whitewood Cider",
        update: {
            originStory: "The 'Teeny Tiny Taproom' focuses on small-batch ciders. Due to our intentionally intimate size, we recommend groups of 4 or fewer for the best experience.",
            geoLoop: "Downtown_Walkable",
            isLocalMaker: true,
            isLowCapacity: true
        }
    },
    {
        name: "The Brotherhood Lounge",
        update: {
            originStory: "Olympia's oldest bar. A reliable dive with deep roots, where industry workers and locals collide.",
            geoLoop: "Downtown_Walkable",
            isSoberFriendly: false
        }
    },
    {
        name: "Three Magnets Brewing",
        update: {
            originStory: "A hub for innovation. Also the home of Self Care non-alcoholic beers, making it a perfect spot for everyone.",
            geoLoop: "Downtown_Walkable",
            isSoberFriendly: true
        }
    }
];

async function seedMarketAudit() {
    console.log("🌱 Seeding Market Audit Data...");
    const venuesRef = db.collection('venues');
    const snapshot = await venuesRef.get();

    let updatedCount = 0;

    for (const updateItem of AUDIT_UPDATES) {
        // Find venue by name (fuzzy match or exact)
        // Since names might vary slightly, we scan.
        let targetDoc = null;
        snapshot.forEach(doc => {
            if (doc.data().name.toLowerCase().includes(updateItem.name.toLowerCase())) {
                targetDoc = doc;
            }
        });

        if (targetDoc) {
            console.log(`📝 Updating: ${targetDoc.data().name} (${targetDoc.id})`);
            await venuesRef.doc(targetDoc.id).update(updateItem.update);
            updatedCount++;
        } else {
            console.warn(`⚠️ Venue not found: ${updateItem.name}`);
        }
    }

    console.log(`✅ Seeding Complete. ${updatedCount} venues updated.`);
    process.exit(0);
}

seedMarketAudit().catch(err => {
    console.error("❌ Seeding Failed:", err);
    process.exit(1);
});
