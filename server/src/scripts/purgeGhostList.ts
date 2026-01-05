
import { db } from '../firebaseAdmin';

const GHOST_LIST = [
    "Locust Cider",
    "Finnriver",
    "Madsen Family Cellars",
    "Scatter Creek Winery",
    "Fish Tale Brew Pub",
    "Fish Tale"
];

async function purgeGhostList() {
    console.log("👻 Starting Ghost List Purge...");
    const venuesRef = db.collection('venues');
    const snapshot = await venuesRef.get();

    let updatedCount = 0;

    const updates = snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const venueName = data.name;

        // Check if name contains any ghost keyword (case insensitive)
        const isGhost = GHOST_LIST.some(ghost => venueName.toLowerCase().includes(ghost.toLowerCase()));

        if (isGhost) {
            console.log(`🚫 Marking as INACTIVE: ${venueName} (${doc.id})`);
            await venuesRef.doc(doc.id).update({
                isActive: false,
                description: `[LEGACY/INACTIVE] ${data.description || ''}`
            });
            updatedCount++;
        }
    });

    await Promise.all(updates);
    console.log(`✅ Purge Complete. ${updatedCount} venues marked as inactive.`);
    process.exit(0);
}

purgeGhostList().catch(err => {
    console.error("❌ Purge Failed:", err);
    process.exit(1);
});
