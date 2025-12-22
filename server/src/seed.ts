import { db } from './firebaseAdmin';

const venues = [
    {
        id: 'brotherhood-lounge',
        name: 'The Brotherhood Lounge',
        type: 'Dive Bar',
        status: 'chill',
        vibe: 'Classic dive with great atmosphere',
        checkIns: 0,
        coordinates: { x: 45, y: 32 }, // Relative map mockup
        location: { lat: 47.0449, lng: -122.9016 },
        address: '119 Capitol Way N, Olympia, WA 98501',
        phone: '(360) 352-4153',
        website: 'https://thebrotherhoodlounge.com/',
        hours: {
            monday: { open: '16:00', close: '02:00' },
            tuesday: { open: '16:00', close: '02:00' },
            wednesday: { open: '16:00', close: '02:00' },
            thursday: { open: '16:00', close: '02:00' },
            friday: { open: '16:00', close: '02:00' },
            saturday: { open: '16:00', close: '02:00' },
            sunday: { open: '16:00', close: '02:00' }
        },
        amenities: ['Shuffleboard', 'Pool Table', 'Pinball', 'Covered Patio', 'Vending Machine (Koozies)'],
        deals: [{
            title: 'Happy Hour',
            description: '$1 off wells and drafts',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            start: '16:00',
            end: '19:00'
        }]
    },
    {
        id: 'hannahs-bar-grille',
        name: 'Hannah\'s Bar & Grille',
        type: 'Bar & Grill',
        status: 'lively',
        vibe: 'Friendly local favorite',
        checkIns: 0,
        coordinates: { x: 52, y: 78 },
        location: { lat: 47.0438, lng: -122.9030 },
        address: '123 5th Ave SW, Olympia, WA 98501',
        phone: '(360) 357-9890',
        website: 'https://hannahsoly.com/',
        hours: {
            monday: { open: '11:00', close: '02:00' },
            tuesday: { open: '11:00', close: '02:00' },
            wednesday: { open: '11:00', close: '02:00' },
            thursday: { open: '11:00', close: '02:00' },
            friday: { open: '11:00', close: '02:00' },
            saturday: { open: '11:00', close: '02:00' },
            sunday: { open: '11:00', close: '02:00' }
        },
        amenities: ['Pull Tabs', 'Pool Tables', 'Digital Jukebox', 'Karaoke', 'Breakfast'],
        deals: [
            { title: 'Weekday Happy Hour', description: 'Discounted drafts', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], start: '15:00', end: '19:00' },
            { title: 'Sunday Funday', description: 'Happy Hour pricing all day', days: ['Sunday'], start: '11:00', end: '02:00' }
        ]
    },
    {
        id: 'cryptatropa-bar',
        name: 'Cryptatropa Bar',
        type: 'Gothic Bar',
        status: 'chill',
        vibe: 'Absinthe and gothic atmosphere',
        checkIns: 0,
        coordinates: { x: 75, y: 44 }, // Corrected for East placement
        location: { lat: 47.0460, lng: -122.8953 }, // Corrected longitude
        address: '421 4th Ave E, Olympia, WA 98501',
        website: 'http://thecryptbar.com/',
        hours: {
            monday: { open: '16:00', close: '02:00' },
            tuesday: { open: '16:00', close: '02:00' },
            wednesday: { open: '16:00', close: '02:00' },
            thursday: { open: '16:00', close: '02:00' },
            friday: { open: '16:00', close: '02:00' },
            saturday: { open: '16:00', close: '02:00' },
            sunday: { open: '16:00', close: '02:00' }
        },
        amenities: ['Outdoor Seating', 'Live Music', 'Gothic Decor', 'Absinthe'],
        deals: []
    },
    {
        id: 'china-clipper',
        name: 'China Clipper',
        type: 'Tiki Bar',
        status: 'chill',
        vibe: 'Iconic Olympia tiki bar',
        checkIns: 0,
        coordinates: { x: 40, y: 60 },
        location: { lat: 47.0428, lng: -122.9023 },
        address: '402 4th Ave W, Olympia, WA 98501',
        website: 'https://www.chinaclipperolympia.com/',
        hours: {
            monday: { open: '12:00', close: '02:00' },
            tuesday: { open: '12:00', close: '02:00' },
            wednesday: { open: '12:00', close: '02:00' },
            thursday: { open: '12:00', close: '02:00' },
            friday: { open: '12:00', close: '02:00' },
            saturday: { open: '12:00', close: '02:00' },
            sunday: { open: '12:00', close: '02:00' }
        },
        amenities: ['Strong Drinks', 'Tiki Decor', 'Friendly Staff'],
        deals: []
    },
    {
        id: 'well-80',
        name: 'Well 80 Brewhouse',
        type: 'Brewhouse',
        status: 'lively',
        vibe: 'Home of Artie and built on the Artesian Well',
        checkIns: 0,
        coordinates: { x: 55, y: 85 },
        location: { lat: 47.0424, lng: -122.9009 },
        address: '514 4th Ave E, Olympia, WA 98501',
        website: 'https://well80.com/',
        hours: {
            monday: { open: '11:30', close: '22:00' },
            tuesday: { open: '11:30', close: '22:00' },
            wednesday: { open: '11:30', close: '22:00' },
            thursday: { open: '11:30', close: '23:00' },
            friday: { open: '11:30', close: '00:00' },
            saturday: { open: '11:30', close: '00:00' },
            sunday: { open: '11:30', close: '22:00' }
        },
        amenities: ['Artesian Beer', 'Brew Garden', 'Event Space', 'Family Friendly'],
        deals: []
    }
];

async function clearCollection(collectionName: string) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Cleared collection: ${collectionName}`);
}

async function seedVenues() {
    console.log('Starting venue seeding with clean slate...');

    try {
        await clearCollection('venues');
        await clearCollection('signals');

        const venuesRef = db.collection('venues');
        for (const venue of venues) {
            const { id, ...venueData } = venue;
            await venuesRef.doc(id).set(venueData);
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
