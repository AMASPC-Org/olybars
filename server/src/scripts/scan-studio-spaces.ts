import { db } from '../firebaseAdmin';

async function run() {
    console.log('Searching for "Studio" spaces in ALL venues...');
    const snapshot = await db.collection('venues').get();

    let found = false;

    snapshot.forEach(doc => {
        const d = doc.data();
        const spaces = d.privateSpaces || [];
        const studios = spaces.filter((s: any) => s.name && s.name.includes('Studio'));

        if (studios.length > 0) {
            found = true;
            console.log(`\nVenue: ${d.name} (${doc.id})`);
            studios.forEach((s: any) => {
                console.log(` - Space: ${s.name} (Booking: ${s.bookingLink || 'none'})`);
            });
        }
    });

    if (!found) {
        console.log('No spaces with "Studio" found in the entire database.');
    }
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
