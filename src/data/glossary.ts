export interface GlossaryTerm {
    term: string;
    def: string;
}

export interface GlossaryCategory {
    category: string;
    terms: GlossaryTerm[];
}

export const glossaryTerms: GlossaryCategory[] = [
    {
        category: 'The Game',
        terms: [
            { term: 'Artesian Bar League', def: 'The official name of the Olympia-based league, celebrating the city\'s brewing heritage.' },
            { term: 'Current State', def: 'The real-time energy level of a venue: Dead, Chill, Buzzing, or Packed. This status is derived from three primary signals: Clock-ins, Vibe Checks, and Venue Capacity.' },
            { term: 'Dead', def: 'The venue is extremely quiet with minimal activity. Perfect for a private conversation.' },
            { term: 'Chill', def: 'A relaxed, steady atmosphere. Plenty of seating available.' },
            { term: 'Buzzing', def: 'High energy and significant attendance. The venue is active and lively.' },
            { term: 'Packed', def: 'The venue is at or near its legal capacity. Expect a full house and a high-energy environment.' },
            { term: 'Signal', def: 'A data point used to inform the Current State of a venue. Primary signals include user Clock-ins, Vibe Checks, and administrative updates from The Brew House.' },
            { term: 'Vibe Check', def: 'A manual "Ground Truth" report submitted by a User or Venue Owner. Vibe Checks are critical for accuracy as they account for the many users who do not have location services enabled.' },
            { term: 'Clock In', def: 'The primary scoring action. Players verify their location at an Anchor Venue. Each Clock In serves as an attendance signal, helping the system calculate the real-time Vibe of the room. Limited to 2 per 12-hour window.' },
            { term: 'The Weekly Pulse', def: 'The official League dispatch. It highlights legendary bartenders, explores local bar history, and contains exclusive "Trivia Cheat Codes".' },
            { term: 'Buzz Clock', def: 'The real-time countdown logic that prioritizes Happy Hour deals based on how much time is left to enjoy them.' },
            { term: 'Streak', def: 'Consecutive days/weeks of active participation by a League Player.' },
            { term: 'Badge', def: 'A digital trophy earned by completing specific sets of visits or challenges.' },
            { term: 'Game Preferences', def: 'A set of player-defined interests (e.g., preferred bar games or vibes) used by Artie to suggest the perfect venue.' },
        ]
    },
    {
        category: 'Roles & People',
        terms: [
            { term: 'User', def: 'Any human interacting with OlyBars.com. If you can see the screen, you are a User.' },
            { term: 'Visitor', def: 'A User who is browsing anonymously and has not logged in.' },
            { term: 'Guest', def: 'A User who has authenticated (logged in) but has not yet joined the League or accepted the "Terms of Competition".' },
            { term: 'League Player', def: 'A registered member who has officially joined the League. Players earn points, track progress, and unlock digital trophies (Badges).' },
            { term: 'League Partner', def: 'A verified venue (bar or pub) inducted into the League. Partners manage their presence via The Brew House.' },
            { term: 'Venue Owner', def: 'The primary contact and operator of a League Partner venue, responsible for their "60-Second Handover".' },
            { term: 'Artie', def: 'The spirit of the Artesian Well. A permission-gated AI agent that acts as a concierge for Players and a drafter/co-pilot for Partners. Artie can automate event descriptions, social media ad copy, and distribution to the OlyBars network.' },
            { term: 'Local Maker', def: 'Local artisans (Brewers, Distillers, Roasters) whose products are featured on the Local Maker\'s Trail. OlyBars prioritizes local producers to support the regional economy.' },
            { term: 'The AMA Network', def: 'Powered by the American Marketing Alliance SPC (Social Purpose Corporation). A network of event-based sites designed to automate marketing for local businesses and non-profits, reducing "Marketing Burn" through a "submit once, distribute everywhere" model.' },
        ]
    },
    {
        category: 'Features & Tools',
        terms: [
            { term: 'The Manual', def: 'The colloquial name for the OlyBars app/website ("The Artesian Bar League Manual").' },
            { term: 'The Brew House', def: 'The owner/partner management dashboard accessed via the side menu. This is where venue operators manage their profile, listings, events, and "Flash Deal" activations.' },
            { term: 'The 60-Second Handover', def: 'The streamlined onboarding process for venue owners to claim their listing and activate their partner benefits.' },
            { term: 'Partner Status', def: 'The membership tier of a League Partner (Free, DIY Toolkit, Pro League, or Agency Legend), determining available tools and visibility.' },
            { term: 'Flash Deal', def: 'A time-limited special offer created by a League Partner to drive immediate traffic.' },
            { term: 'Local Maker\'s Trail', def: 'A discovery feature guiding players to venues that serve products from local artisans.' },
            { term: 'Safe Ride', def: 'The League\'s commitment to safety, providing direct links to Red Cab and ride-share services.' },
        ]
    },
    {
        category: 'Compliance & Legal',
        terms: [
            { term: 'LCB Compliance', def: 'Strict adherence to Washington State Liquor and Cannabis Board rules to protect our partners\' licenses.' },
            { term: 'Anti-Volume', def: 'A core rule: the League never encourages rapid or excessive alcohol consumption. Points are for presence, not pints.' },
            { term: 'Undue Influence', def: 'The separation of gameplay and alcohol. Points are never directly tied to the purchase of liquid volume.' },
            { term: 'Stool Test', def: 'The requirement that a venue must have a manned bar and social-centric seating to be eligible for Partner induction.' },
        ]
    },
    {
        category: 'The OlyBars Taxonomy',
        terms: [
            { term: 'Play', def: 'Interactive items that are physically present at the venue 24/7 (or during open hours). Includes "Barcade" games and "Chance" based games like Pull Tabs.' },
            { term: 'Features', def: 'Permanent hardware or architectural elements that define the space (e.g., Patio, Dance Floor, Jukebox).' },
            { term: 'Events', def: 'Activities that only happen at specific times and must be linked to the League Calendar (e.g., Trivia Night, Karaoke, Live Music).' }
        ]
    }
];
