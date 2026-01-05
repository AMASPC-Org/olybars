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
            { term: 'Buzzing', def: 'High energy and significant attendance. The venue is active and energetic.' },
            { term: 'Packed', def: 'The venue is at or near its legal capacity. Expect a full house and a high-energy environment.' },
            { term: 'Signal', def: 'A data point used to inform the Current State of a venue. Primary signals include user Clock-ins, Vibe Checks, and administrative updates from The Brew House.' },
            { term: 'Vibe Check', def: 'A manual "Ground Truth" report submitted by a User or Venue Owner. Vibe Checks are critical for accuracy as they account for the many users who do not have location services enabled.' },
            { term: 'Clock In', def: 'The primary scoring action. Players verify their location at an Anchor Venue. Each Clock In serves as an attendance signal, helping the system calculate the real-time Vibe of the room. Limited to 2 per 12-hour window.' },
            { term: 'The Weekly Pulse', def: 'The official League dispatch. It highlights legendary bartenders, explores local bar history, and contains exclusive "Trivia Cheat Codes".' },
            { term: 'Buzz Clock', def: 'The real-time countdown logic that prioritizes Happy Hour deals based on how much time is left to enjoy them.' },
            { term: 'Streak', def: 'Consecutive days/weeks of active participation by a League Player.' },
            { term: 'Time Bounty', def: 'A temporary increase in points awarded for visiting a specific venue during a designated time window, typically used to drive traffic during slow periods (e.g., 2x points from 5 PM - 7 PM). (Formerly Point Bounty).' },
            { term: 'Menu Bounty', def: 'A high-value point incentive awarded for ordering specific high-margin food items. Requires a photo of the item for verification.' },
            { term: 'Badge', def: 'A digital trophy earned by completing specific sets of visits or challenges.' },
            { term: 'Game Preferences', def: 'A set of player-defined interests (e.g., preferred bar games or vibes) used by Artie to suggest the perfect venue.' },
            { term: 'Venue Capacity', def: 'A static data point representing the legal or practical occupancy of a venue. This serves as the denominator for calculating busyness density.' },
        ]
    },
    {
        category: 'Roles & People',
        terms: [
            { term: 'User', def: 'Any human interacting with OlyBars.com. If you can see the screen, you are a User.' },
            { term: 'Visitor', def: 'A User who is browsing anonymously (not logged in).' },
            { term: 'Guest', def: 'A User who has authenticated (logged in) but has not yet joined the League.' },
            { term: 'League Player', def: 'A registered patron (User) who has officially joined the League. Players earn points, track progress, and unlock digital trophies (Badges). (Formerly referred to as Player/Member).' },
            { term: 'Venue Owner', def: 'The human operator authorized to manage a venue\'s profile. This is the person who performs the login action to access The Brew House.' },
            { term: 'Super-Admin', def: 'The platform lighthouse (typically ryan@amaspc.com). Has global authorization to manage any venue, override system settings, and enforce fair play standard across the entire AMA Network.' },
            { term: 'Listed Venue', def: 'A physical location (bar/pub) that appears on the OlyBars map but has not yet claimed their profile or joined the League as a Partner.' },
            { term: 'League Partner', def: 'A venue that has claimed their profile and entered into a marketing agreement with the League. Includes all active tiers: Free, DIY, Pro, and Agency.' },
            { term: 'Artie', def: 'The spirit of the Artesian Well. A permission-gated AI agent that acts as a concierge for Players and a drafter/co-pilot for Partners.' },
            { term: 'Local Maker', def: 'Local artisans (Brewers, Distillers, Roasters) whose products are featured on the Local Maker\'s Trail.' },
            { term: 'The AMA Network', def: 'Powered by the American Marketing Alliance SPC. A network of event-based sites designed to automate marketing for local businesses.' },
        ]
    },
    {
        category: 'Features & Tools',
        terms: [
            { term: 'The Manual', def: 'The colloquial name for the OlyBars app/website ("The Artesian Bar League Manual").' },
            { term: 'The Brew House', def: 'The Partner Portal. The dashboard where Venue Owners manage their profile, listings, events, and "Flash Bounty" activations.' },
            { term: 'The 60-Second Handover', def: 'The streamlined onboarding process for a Venue Owner to claim a Listed Venue and convert it into a League Partner.' },
            { term: 'Partner Status', def: 'The active subscription tier of a League Partner: Free (Claimed), DIY Toolkit, Pro League, or Agency Legend.' },
            { term: 'Flash Bounty', def: 'A time-limited point incentive created by a League Partner to drive immediate traffic. Unlike a "deal", a bounty rewards participation with points rather than discounting alcohol prices.' },
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
    },
    {
        category: 'Economy & Rankings',
        terms: [
            { term: 'Player Points', def: 'The points earned by a League Player for real-world interactions (Check-ins, Vibe Checks). Stored securely in the Player\'s profile and used to calculate League Standings.' },
            { term: 'Venue Point Bank', def: 'The dedicated pool of points owned by a League Partner. Venues "spend" these points to attract traffic by offering multipliers or bounties. Stored in the venue\'s private_data collection to ensure operational confidentiality.' },
            { term: 'League Standings', def: 'The city-wide leaderboard showing the current rankings of all League Players based on their Season Points. Standings are shared publicly to encourage friendly competition.' },
            { term: 'Time Bounty', def: 'A temporary increase in points awarded for visiting a specific venue during a designated time window. Bounties are deducted from the Venue Point Bank.' },
        ]
    }
];
