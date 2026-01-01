import { db } from '../server/src/firebaseAdmin.ts';

const WELL_80_ID = 'well-80';

async function updateWell80() {
    console.log('--- UPDATING WELL 80 PRODUCTION DATA ---');

    const venueRef = db.collection('venues').doc(WELL_80_ID);

    const updates = {
        // Taxonomy Update
        venueType: 'brewpub',
        makerType: 'Brewery',
        vibeTags: ['Bustling', 'Community Hub', 'Trivia', 'Bingo', 'Game Day'],

        // Profile
        description: 'A brewery and brewpub built on the site of one of Olympia’s famous Artesian wells. Using pure Artesian water for their craft beers, Well 80 is an all-ages destination serving pizza, burgers, and sandwiches with a unique twist.',

        // Access & Amenities
        isAllAges: true,
        isDogFriendly: true,
        hasOutdoorSeating: true,
        hasPrivateRoom: true,
        reservations: 'Accepted Sun-Thu for parties of 8+',
        reservationUrl: 'https://well80.com/reservations/',

        // Operations
        happyHourSimple: 'Daily 3PM - 5PM & 9PM - Close',
        happyHour: {
            startTime: '15:00',
            endTime: '17:00',
            description: '$1 Off Pints & Leopold Pretzels', // Base HH
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        happyHourSpecials: 'Daily Rituals & Specials!',
        openingTime: '11:00 AM',
        happyHourMenu: [
            { id: 'well80-hh-1', name: 'Hand Tossed 10" Pizza', description: "Classic, Margherita, or Plain Ol' Cheese", price: '$11', category: 'food' },
            { id: 'well80-hh-2', name: 'Drive-In Burger', description: 'Add a side of fries or tots for $2 more', price: '$11', category: 'food' },
            { id: 'well80-hh-3', name: 'Big Brewhouse Salad', description: 'Add grilled chicken for $4 more', price: '$10', category: 'food' },
            { id: 'well80-hh-4', name: 'Brewhouse Sprouts', description: 'Add a side of fries or tots for $2 more', price: '$8', category: 'food' },
            { id: 'well80-hh-5', name: 'Drive-In Style Fries or Tots', description: "A big ol' plate of our tasty spuds", price: '$7', category: 'food' },
            { id: 'well80-hh-6', name: 'Draft Pints', description: 'Any standard beer or cider on tap', price: '$6', category: 'drink' },
            { id: 'well80-hh-7', name: 'Brewhouse Wines', description: 'Any wine we pour by the glass', price: '$6', category: 'drink' }
        ],
        triviaTime: '19:00',
        leagueEvent: 'trivia',
        services: ['flights', 'to_go_beer', 'keg_sales', 'growler_fills'],

        // Rich Trivia Ritual Data
        triviaHost: 'Jim Westerling',
        triviaPrizes: 'League Points & Well 80 Gift Cards',
        triviaSpecials: '$2 Scherler Easy & Trivia @ 7PM!',
        triviaHowItWorks: [
            'Assemble a team',
            'Study the clues on social media',
            'Get to Well 80 early',
            'Eat, drink, answer, have fun',
            'Win glory and prizes'
        ],

        // Weekly Programming
        weekly_schedule: {
            'Monday': ['Public Sector Monday | 20% off your tab with your public sector ID', 'Game night @ 5PM!'],
            'Tuesday': ['Tall Boy Tuesday | $2 Scherler Easy', 'Trivia @ 7PM!'],
            'Wednesday': ['Wino Wednesday | 50% off all bottles of wine', 'BINGO @ 7PM!'],
            'Thursday': ['New Beer Day | 2 for 1 crowlers & $12 6-packs!'],
            'Friday': ['Fill ‘em Friday | $5 off all growler fills.'],
            'Saturday': ['Pretzel Saturday | 25% off pretzels.'],
            'Sunday': ['Industry Day | 20% off your tab with your industry ID.']
        }
    };

    try {
        await venueRef.update(updates);
        console.log('✅ WELL 80 UPDATED SUCCESSFULLY');

        // Verify
        const doc = await venueRef.get();
        console.log('Updated Document Data:', JSON.stringify(doc.data(), null, 2));
    } catch (error) {
        console.error('❌ FAILED TO UPDATE WELL 80:', error);
    }
}

updateWell80();
