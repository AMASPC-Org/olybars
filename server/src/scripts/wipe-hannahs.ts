import { db } from '../firebaseAdmin';

async function run() {
    console.log('Force-Wiping Private Spaces for Hannah\'s...');
    const ref = db.collection('venues').doc('hannahs');

    // Blindly update to empty, regardless of what we see (fetching might be stale or weird?)
    await ref.update({
        privateSpaces: [],
        hasPrivateRoom: false
    });
    console.log('Wiped.');
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
