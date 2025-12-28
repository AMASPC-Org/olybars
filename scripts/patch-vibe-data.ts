import { db } from '../server/src/firebaseAdmin';

async function patchVenueAmenities() {
    console.log('--- 🚀 Starting High-Fidelity Amenity Patch ---');

    // Hannah's Bar & Grill
    const hannahsRef = db.collection('venues').doc('hannahs');
    await hannahsRef.update({
        hasGameVibeCheckEnabled: true,
        amenityDetails: [
            { id: 'pool_1', name: 'Front Pool Table', count: 1 },
            { id: 'pool_2', name: 'Back Pool Table', count: 1 },
            { id: 'pacman', name: 'Pacman', count: 1 },
            { id: 'mspacman', name: 'Ms. Pacman', count: 1 },
            { id: 'pinball', name: 'Pinball Machine', count: 1 }
        ]
    });
    console.log('✅ Patched Hannah\'s (5 Amenities)');

    // The Brotherhood Lounge
    const brotherhoodRef = db.collection('venues').doc('brotherhood-lounge');
    await brotherhoodRef.update({
        hasGameVibeCheckEnabled: true,
        amenityDetails: [
            { id: 'pool_1', name: 'Pool Table', count: 1 },
            { id: 'shuffleboard_1', name: 'Shuffleboard Table', count: 1 },
            { id: 'arcade_1', name: 'Retro Arcade Game', count: 1 }
        ]
    });
    console.log('✅ Patched Brotherhood (3 Amenities)');

    console.log('--- 🍺 Patch Complete ---');
    process.exit(0);
}

patchVenueAmenities().catch(err => {
    console.error('❌ Patch Failed:', err);
    process.exit(1);
});
