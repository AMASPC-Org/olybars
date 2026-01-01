import { db } from '../server/src/firebaseAdmin.ts';

const HANNAHS_ID = 'hannahs';

async function updateHannahs() {
    console.log('--- UPDATING HANNAH\'S BAR & GRILL PRODUCTION DATA ---');

    const venueRef = db.collection('venues').doc(HANNAHS_ID);

    const updates = {
        // Taxonomy
        name: "Hannah's Bar & Grill",
        venueType: 'bar_pub',
        makerType: null, // It's a bar/grill, not a brewery
        vibeTags: ['dive', 'sports', 'Community Hub', 'Karaoke', 'Trivia'],

        // Brand Identity
        vibe: 'Olympia\'s Friendliest Bar since 1980',
        insiderVibe: 'Olympia’s friendliest bar! Legendary burgers, largest liquor selection (downtown\'s largest), and the home of late-night karaoke.',
        description: 'A downtown staple at 5th and Columbia since the late ’80s. Known for hearty classics, the largest liquor selection in town, and a full menu of delicious lunch and dinner options.',
        originStory: `Welcome to Hannah’s Bar & Grill, proudly serving Olympia, WA since the late ’80s! As the friendliest bar in Olympia, we’ve built a reputation for great food, unbeatable drinks, and a welcoming atmosphere where everyone feels at home.

From day one, our mission has been simple: create a place where friends gather, laughter flows, and memories are made. Over the years, we’ve become a local favorite for our famous burgers, ice-cold beer, and the largest liquor selection in downtown Olympia—because we believe every pour should be perfect.

But we’re more than just great food and drinks. At Hannah’s, entertainment is part of the experience! Shoot a game on our Diamond pool tables, test your luck with pull tabs, or dive into the fun with arcade games. Love music? You’ll feel right at home with our jukebox tunes, Trivia Wednesdays, and the crowd-favorite Karaoke Nights every Thursday, Friday, and Saturday. Plus, don’t miss Open Mic Night on the first Tuesday of every month at 7 PM, where local talent shines.`,

        // Physical Location & Contact
        address: '123 5th Ave SW, Olympia, WA 98501',
        email: 'hannahsbarandgrilloly@gmail.com',
        phone: '360-357-3768',
        website: 'https://hannahsoly.com/',
        facebook: 'https://www.facebook.com/Hannahsbarandgrille',
        coordinates: { x: 50, y: 50 }, // Standardized

        // Operations & Hours
        hours: '11:00 AM - 2:00 AM Daily',
        foodService: 'full_kitchen',
        isAllAges: true,
        isDogFriendly: false, // Usually no dogs inside bars in Oly unless patio
        hasOutdoorSeating: false,

        // Games & Features (Data Layer)
        gameFeatures: [
            { id: 'pool_table_1', type: 'pool_table', name: 'Diamond Pool Table', status: 'active', count: 1 },
            { id: 'pool_table_2', type: 'pool_table', name: 'Diamond Pool Table', status: 'active', count: 1 },
            { id: 'arcade_room', type: 'arcade_game', name: 'Non-stop Arcade Games', status: 'active', count: 5 },
            { id: 'pull_tabs', type: 'arcade_game', name: 'Pull Tabs', status: 'active', count: 1 },
            { id: 'jukebox', type: 'karaoke', name: 'Digital Jukebox', status: 'active', count: 1 }
        ],

        // Weekly Programming
        weekly_schedule: {
            'Monday': ['Lunch & Dinner Classics'],
            'Tuesday': ['Open Mic Night (1st Tue @ 7PM)', 'Americana Kitchen'],
            'Wednesday': ['Trivia Wednesdays', 'League Knowledge Night'],
            'Thursday': ['Karaoke Nights', 'Late Night Spotlight'],
            'Friday': ['Karaoke Nights', 'Bustling Downtown Vibes'],
            'Saturday': ['Karaoke Nights', 'Legendary Party Energy'],
            'Sunday': ['Industry Reset', 'Sunday Classics']
        },

        // Intelligence Integration
        leagueEvent: 'karaoke',
        triviaTime: '19:00', // Wednesday
        triviaHost: 'Oly Trivia',
        triviaPrizes: 'Bragging Rights & More',
        triviaSpecials: 'Check social for tonight\'s specials!',
    };

    try {
        await venueRef.update(updates);
        console.log('✅ HANNAH\'S UPDATED SUCCESSFULLY');
        const doc = await venueRef.get();
        console.log('Final State Check:', doc.data()?.name);
    } catch (error) {
        console.error('❌ FAILED TO UPDATE HANNAH\'S:', error);
    }
}

updateHannahs();
