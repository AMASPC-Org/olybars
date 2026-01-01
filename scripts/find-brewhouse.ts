import { db } from "../server/src/firebaseAdmin";

async function findBrewHouse() {
    console.log("Searching for 'Brew House' in Firestore...");
    const snap = await db.collection("venues").get();
    let found = false;
    snap.forEach(d => {
        const data = d.data();
        if (data.name && (data.name.includes("Brew House") || data.name.includes("Brewhouse"))) {
            console.log(`MATCH FOUND:`);
            console.log(`  ID: ${d.id}`);
            console.log(`  Name: ${data.name}`);
            console.log(`  OwnerID: ${data.ownerId || 'N/A'}`);
            console.log(`  ManagerIDs: ${data.managerIds ? data.managerIds.join(', ') : 'N/A'}`);
            found = true;
        }
    });
    if (!found) {
        console.log("NO BREW HOUSE FOUND IN DB");
        console.log("Listing first 5 venues for context:");
        const limited = await db.collection("venues").limit(5).get();
        limited.forEach(d => console.log(`  - ${d.id}: ${d.data().name}`));
    }
}

findBrewHouse().catch(console.error);
