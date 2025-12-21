import { db } from './firebaseAdmin';
import { MOCK_VENUES } from '../../services/mockData';

async function seedVenues() {
    console.log('Starting venue seeding...');
    const venuesRef = db.collection('venues');

    try {
        for (const venue of MOCK_VENUES) {
            // Use the venue ID as the document ID
            const { id, ...venueData } = venue;

            // Inject some real-ish coordinates for geofencing verification
            const venueWithLoc: any = { ...venueData };
            if (id === 'hannahs') venueWithLoc.location = { lat: 47.0435, lng: -122.9025 };
            if (id === 'well80') venueWithLoc.location = { lat: 47.0440, lng: -122.8985 };
            if (id === 'brotherhood') venueWithLoc.location = { lat: 47.0450, lng: -122.9015 };

            await venuesRef.doc(id).set(venueWithLoc);
            console.log(`Seeded venue: ${venue.name} (${id})`);
        }
        console.log('Seeding complete! 🍺');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding venues:', error);
        process.exit(1);
    }
}

seedVenues();
