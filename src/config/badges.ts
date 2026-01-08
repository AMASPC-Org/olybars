import { Badge } from '../types';

export const BADGES: Badge[] = [
    {
        id: 'warehouse_warrior',
        name: 'Warehouse Warrior',
        description: "You’ve conquered the Tumwater industrial front. From the 80s synth-pop hop-bombs at Matchless to the dangerously drinkable 'Strawberry Golden' at Triceratops and the nautical grit of Rainwater Brewing, you’ve tasted the heart of the warehouse district.",
        points: 150,
        criteria: {
            type: 'clockin_set',
            venueIds: ['matchless', 'triceratops', 'rainwater'] // IDs must match venue IDs in DB
        }
    },
    {
        id: 'downtown_wanderer',
        name: 'Downtown Wanderer',
        description: "The core of the 98501. You’ve tapped the mythical 1896 aquifer at Well 80, witnessed the 'punk rock' resurrection of the old Fish Tale space at Ilk Lodge, and found the 'Third Place' at Three Magnets.",
        points: 100,
        criteria: {
            type: 'clockin_set',
            venueIds: ['well80', 'ilklodge', 'threemagnets']
        }
    },
    {
        id: 'lager_legend',
        name: 'Lager Legend',
        description: "A purist’s journey. From the Leopold Schmidt heritage at Well 80 to the curated taps at The Double Tap Tap House, you appreciate the craft in every pour.",
        points: 125,
        criteria: {
            type: 'clockin_set',
            venueIds: ['double-tap', 'well80', 'ilklodge']
        }
    },
    {
        id: 'long_haul',
        name: 'The Long Haul',
        description: "A true regional explorer. You’ve visited the shrine of Tenino stone-carving at Sandstone Distillery and the monument to tribal sovereignty at Talking Cedar. Some legends are worth the drive.",
        points: 250,
        criteria: {
            type: 'clockin_set',
            venueIds: ['sandstone', 'talkingcedar', 'toprung']
        }
    },
    {
        id: 'clear_headed',
        name: 'Clear Headed',
        description: "The ultimate wingman. You’ve explored the national leaders of the sober-curious movement at Three Magnets and shared a fresh-pressed autumn tradition at Lattin's Cider Mill.",
        points: 100, // Points not specified in summary, assuming 100 based on standard
        criteria: {
            type: 'clockin_set',
            venueIds: ['threemagnets', 'lattins']
        }
    },
    {
        id: 'artesian_well',
        name: 'Artesian Well',
        description: "You are an Artesian Anchor. By visiting five core makers, you’ve proved that 'It’s in the Water.' You don't just drink in Oly; you sustain the empire.",
        points: 500,
        criteria: {
            type: 'count',
            count: 5,
            venueIds: ['well80', 'ilklodge', 'threemagnets', 'double-tap', 'whitewood'] // Core 5 Assumption
        }
    },
    {
        id: 'the_historian',
        name: 'The Historian',
        description: "You've walked in the footsteps of loggers and politicians. By visiting 3 historic landmarks in a single moon, you've unlocked the secrets of the past.",
        points: 500,
        icon: 'icon_scroll_parchment.svg',
        criteria: {
            type: 'count', // Fallback type, simplified for TS, specific logic handled in service
            count: 3,
            isHistoricalAnchor: true,
            timeWindowDays: 30
        }
    }
];
