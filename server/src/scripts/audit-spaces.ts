import { db } from '../firebaseAdmin';

async function run() {
    console.log('AUDIT: Listing ALL Private Spaces in DB...');
    const snapshot = await db.collection('venues').get();

    let count = 0;
    snapshot.forEach(doc => {
        const d = doc.data();
        if (d.privateSpaces && d.privateSpaces.length > 0) {
            console.log(`\nVenue: ${d.name} (${doc.id})`);
            d.privateSpaces.forEach((s: any, i: number) => {
                console.log(` [${i}] Name: "${s.name}" | Capacity: ${s.capacity} | Link: "${s.bookingLink}"`);
            });
            count++;
        }
    });

    if (count === 0) {
        console.log('NO PRIVATE SPACES FOUND IN DB.');
    }
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
