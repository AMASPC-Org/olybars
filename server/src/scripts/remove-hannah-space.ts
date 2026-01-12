import { db } from '../firebaseAdmin';

async function run() {
    console.log('Fixing Hannahs Private Spaces...');
    // "hannahs" is the ID from my earlier search (implied by file output `venues/hannahs`).
    const ref = db.collection('venues').doc('hannahs');
    const doc = await ref.get();

    if (!doc.exists) {
        console.error('Hannahs not found!');
        process.exit(1);
    }

    const data = doc.data();
    const spaces = data?.privateSpaces || [];
    console.log('Current spaces:', JSON.stringify(spaces, null, 2));

    const originalCount = spaces.length;
    // Filter out spaces containing "Studio 4" in name (catches 49 and 409)
    const newSpaces = spaces.filter((s: any) => !s.name.includes('Studio 4'));

    if (newSpaces.length === originalCount) {
        console.log('No "Studio 4..." spaces found to remove.');
    } else {
        console.log(`Removing ${originalCount - newSpaces.length} spaces.`);
        console.log('New spaces list:', JSON.stringify(newSpaces, null, 2));

        await ref.update({
            privateSpaces: newSpaces,
            hasPrivateRoom: newSpaces.length > 0
        });
        console.log('Update successful.');
    }
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
