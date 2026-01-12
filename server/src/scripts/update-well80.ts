import { db } from '../firebaseAdmin';

async function run() {
    console.log('Updating Well 80 Profile...');
    const ref = db.collection('venues').doc('well-80');

    // Construct new Private Space object
    const barrelRoom = {
        name: "Back Barrel Room",
        capacity: 24,
        description: "A private space for groups. $650 minimum on Fri/Sat & Event Nights (Trivia Tue/Bingo Wed). $250 minimum all other times. Priority given to Well Heads Club members.",
        bookingLink: "https://well80.com/reservations"
    };

    // Construct reservations string
    const reservationsPolicy = "Parties of 8+ only. No reservations Fri/Sat unless booking the Barrel Room. 24-48hr confirmation time.";

    // Logic to merge weekly schedule
    const doc = await ref.get();
    if (!doc.exists) return;
    const data = doc.data();
    const existingSchedule = data?.weekly_schedule || {};

    const newSchedule = {
        ...existingSchedule,
        'Tuesday': Array.from(new Set([...(existingSchedule['Tuesday'] || []), 'Trivia Night'])),
        'Wednesday': Array.from(new Set([...(existingSchedule['Wednesday'] || []), 'BINGO Night']))
    };

    await ref.update({
        privateSpaces: [barrelRoom],
        reservations: reservationsPolicy,
        weekly_schedule: newSchedule,
        // Ensure hasPrivateRoom logic matches
        hasPrivateRoom: true
    });

    console.log('Well 80 Updated Successfully.');
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
