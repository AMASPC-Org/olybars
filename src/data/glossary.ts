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
            { term: 'The Vibe', def: 'The real-time energy level of a venue. There are four distinct Vibes: Dead, Chill, Buzzing, or Packed.' },
            { term: 'The Pulse', def: 'The algorithmic "heartbeat" score that determines a venue\'s Vibe. The Pulse is calculated by weighing multiple Signals: Clock-ins, Vibe Checks, Venue Capacity, Active Happy Hours, League Events, and active Flash Bounties.' },
            { term: 'Dead', def: 'The venue is extremely quiet with minimal activity. Perfect for a private conversation.' },
            { term: 'Chill', def: 'A relaxed, steady atmosphere. Plenty of seating available.' },
            { term: 'Buzzing', def: 'High energy and significant attendance. The venue is active and energetic.' },
            { term: 'Packed', def: 'The venue is at or near its legal capacity. Expect a full house and a high-energy environment.' },
            { term: 'Signal', def: 'A data point used to inform The Pulse. Primary signals include user Clock-ins, Vibe Checks, active Happy Hour timers, and administrative updates.' },
            { term: 'Vibe Check', def: 'A manual "Ground Truth" report submitted by a User or Venue Owner regarding the crowd energy. Critical for accuracy as it accounts for users without location services.' },
            { term: 'Game Vibe Check', def: 'A specific status report regarding the availability of amenities (e.g., "Pool Tables Open," "Karaoke List Full," "Pinball Tournament Starting").' },
            { term: 'Clock In', def: 'The primary scoring action. Players verify their location at an Anchor Venue. Each Clock In acts as a verified attendance signal. Limited to 2 per 12-hour window.' },
            { term: 'The Weekly Buzz', def: 'The official League dispatch (email/newsletter). It highlights legendary bartenders, explores local bar history, and contains exclusive "Trivia Cheat Codes."' },
            { term: 'Buzz Clock', def: 'The real-time countdown logic that prioritizes Happy Hour deals based on how much time is left to enjoy them.' },
            { term: 'Streak', def: 'Consecutive days/weeks of active participation by a League Player.' },
            { term: 'Flash Bounty', def: 'A time-limited point incentive created by a Partner to drive traffic. Includes Time Bounties (multiplier windows), Menu Bounties (food), and Drink Bounties (featured beverages, compliant with LCB rules).' },
            { term: 'Badge', def: 'A digital trophy earned by completing specific sets of visits or challenges.' },
            { term: 'Game Preferences', def: 'A set of player-defined interests (e.g., preferred bar games or scenes) used by Artie to suggest the perfect venue.' },
            { term: 'Venue Capacity', def: 'A static data point representing the legal or practical occupancy of a venue. This serves as the denominator for calculating busyness density.' },
        ]
    },
    {
        category: 'Roles & People',
        terms: [
            { term: 'User', def: 'Any human interacting with OlyBars.com. If you can see the screen, you are a User.' },
            { term: 'Visitor', def: 'A User who is browsing anonymously (not logged in).' },
            { term: 'Guest', def: 'A User who has authenticated (logged in) but has not yet joined the League.' },
            { term: 'League Player', def: 'A registered patron (User) who has officially joined the League. Players earn points, track progress, join Teams, and unlock Badges.' },
            { term: 'Venue Owner', def: 'The human operator authorized to manage a venue\'s profile. This is the person who performs the login action to access The Brew House.' },
            { term: 'Super-Admin', def: 'The platform lighthouse (typically ryan@amaspc.com). Has global authorization to manage any venue, override system settings, and enforce fair play standards across the entire AMA Network.' },
            { term: 'Listed Venue', def: 'A physical location (bar/pub) that appears on the OlyBars map but has not yet claimed their profile or joined the League as a Partner.' },
            { term: 'League Partner', def: 'A venue that has claimed their profile and entered into a marketing agreement with the League. Includes all active tiers: Free, DIY, Pro, and Agency.' },
            { term: 'Artie', def: 'The spirit of the Artesian Well. A permission-gated, multimodal AI agent serving distinct roles: Visitor Concierge, Guest Utility Guide, Player Referee, and Partner Co-Pilot.' },
            { term: 'Local Maker', def: 'Local artisans (Brewers, Distillers, Ciderys) whose products are featured on the Local Maker\'s Trail.' },
            { term: 'The AMA Network', def: 'Powered by the American Marketing Alliance SPC. A network of event-based sites designed to automate marketing for local businesses.' },
        ]
    },
    {
        category: 'Features & Tools',
        terms: [
            { term: 'The Manual', def: 'The official Help Center and FAQ knowledge base for OlyBars.com.' },
            { term: 'The Brew House', def: 'The Partner Portal. The dashboard where Venue Owners manage their profile, listings, events, menus, and Flash Bounty activations.' },
            { term: 'The 60-Second Handover', def: 'The streamlined onboarding process for a Venue Owner to claim a Listed Venue and convert it into a League Partner.' },
            { term: 'Partner Status', def: 'The active subscription tier of a League Partner: Free (Claimed), DIY Toolkit, Pro League, or Agency Legend.' },
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
        category: 'App Architecture',
        terms: [
            { term: 'Header & Nav Hub', def: 'The persistent identity and global module switching area (AppShell), housing the branding and primary app modules like Map, League, and Play.' },
            { term: 'Pulse Feed', def: 'The live venue list sorted by "The Pulse." It ranks venues based on real-time activity, ensuring the most "Alive" places appear at the top.' },
            { term: 'Discovery Engine', def: 'The unified search and filter layer (FilterEngine). Houses the Global Search input and 5 primary filter chips.' },
            { term: 'Conversion Banner', def: 'A high-visibility call-to-action (Weekly Buzz CTA) designed to convert Guests into email subscribers or League Players.' },
            { term: 'User Status Strip', def: 'A state-aware UI element that displays personal points and rank for Players, or a "Join the League" promotion for guests.' },
            { term: 'Global Tray', def: 'The responsive sticky footer that stays compact during active scrolling but expands at the page bottom to show full site links.' },
        ]
    },
    {
        category: 'The OlyBars Taxonomy',
        terms: [
            { term: 'Pulse Selector', def: 'A primary filter chip that allows users to sort the city by The Vibe: Dead, Chill, Buzzing, or Packed.' },
            { term: 'Scene Selector', def: 'A primary filter chip for static venue characteristics (Scene Tags) such as "Sports Bar," "Dive," "Speakeasy," or "LGBTQ+."' },
            { term: 'Play', def: 'A filter category for interactive games (Pool, Darts, Arcade, Pinball). Searchable via the GameFilter chip.' },
            { term: 'Features', def: 'A filter category for venue amenities and hardware (Patio, Firepits, Dog Friendly). Searchable via the AmenityFilter chip.' },
            { term: 'Events', def: 'Activities that only happen at specific times (Trivia Night, Live Music) and are pinned to the Global League Calendar (PulseEventFilter).' }
        ]
    },
    {
        category: 'Economy & Rankings',
        terms: [
            { term: 'Player Points', def: 'The points earned by a League Player for real-world interactions (Check-ins, Vibe Checks). Stored securely in the Player\'s profile.' },
            { term: 'Venue Point Bank', def: 'The dedicated pool of points owned by a League Partner. Venues "spend" these points to attract traffic by offering Flash Bounties.' },
            { term: 'League Standings', def: 'The city-wide leaderboard showing the current rankings of all League Players and League Teams based on their Season Points.' },
        ]
    }
];
