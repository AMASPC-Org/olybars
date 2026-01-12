import { db } from '../firebaseAdmin';

async function run() {
    console.log('Updating Well 80 URLs...');
    const url = "https://well80.com/reservations/";
    const ref = db.collection('venues').doc('well-80');

    const doc = await ref.get();
    const data = doc.data();
    if (!data) {
        console.error('Venue not found');
        process.exit(1);
    }

    // Update all private spaces to use the new link
    const spaces = (data.privateSpaces || []).map((s: any) => ({
        ...s,
        bookingLink: url
    }));

    await ref.update({
        reservationUrl: url,
        privateSpaces: spaces
    });
    console.log('Updated links successfully.');
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
