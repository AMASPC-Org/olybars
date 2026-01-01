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
            { term: 'Bar League', def: 'The overarching season-based competition where Users (Players) and Venues (Members) interact to earn points and climb the standings.' },
            { term: 'Artesian Bar League', def: 'The official name of the Olympia-based league, celebrating the city\'s brewing heritage.' },
            { term: 'Buzz', def: 'The real-time energy level of a venue (Chill, Lively, or Buzzing), reported by the community.' },
            { term: 'The Weekly Buzz', def: 'The official League dispatch. It highlights legendary bartenders, explores local bar history, and contains exclusive "Trivia Cheat Codes".' },
            { term: 'Clock In', def: 'The primary scoring action. Players verify their location at an Anchor Venue. Pays 10 pts. Boost to 25 pts with "Marketing Consent". Limited to 2 per 12-hour window.' },
            { term: 'Vibe Check', def: 'A user-submitted report confirming or updating a venue\'s current Buzz. Pays 5 pts. Boost to 20 pts with "Marketing Consent".' },
            { term: 'Game Vibe Check', def: 'Reporting active games (Karaoke, Trivia, etc.) during a Vibe Check. Pays +2 pts per game updated (Max 10 per check).' },
            { term: 'Marketing Consent', def: 'An optional toggle during any Clock In that grants OlyBars the right to display your Vibe Photo on venue pages. Unlocks a significant "Premium Point Bonus" (+15 pts).' },
            { term: 'Buzz Clock', def: 'The real-time countdown logic that prioritizes Happy Hour deals based on how much time is left to enjoy them.' },
            { term: 'Streak', def: 'Consecutive days/weeks of active participation by a League Player.' },
            { term: 'Badge', def: 'A digital trophy earned by completing specific sets of visits or challenges.' },
            { term: 'Game Preferences', def: 'A set of player-defined interests (e.g., preferred bar games or vibes) used by Artie to suggest the perfect venue.' },
        ]
    },
    {
        category: 'Roles & People',
        terms: [
            { term: 'User', def: 'A visitor to OlyBars.com browsing anonymously without being signed in.' },
            { term: 'Guest', def: 'A registered account holder who has not yet opted into the League via the "Join League" process.' },
            { term: 'League Player', def: 'A registered member who has officially joined the League. Players earn points, track progress, and unlock digital trophies (Badges).' },
            { term: 'League Partner', def: 'A verified venue (bar or pub) inducted into the League. Partners have access to the Command Center to manage their vibe.' },
            { term: 'Venue Owner', def: 'The primary contact and operator of a League Partner venue, responsible for their "60-Second Handover".' },
            { term: 'Artie', def: 'The official OlyBars concierge, powered by Well 80. Artie is an AI guide that helps players find the right vibe and helps partners manage their presence.' },
            { term: 'Maker', def: 'Local artisans (Brewers, Distillers, Roasters) whose products are featured on the Maker\'s Trail.' },
            { term: 'The AMA Network', def: 'The underlying infrastructure powering the OlyBars ecosystem.' },
        ]
    },
    {
        category: 'Features & Tools',
        terms: [
            { term: 'The Manual', def: 'The colloquial name for the OlyBars app/website ("The Artesian Bar League Manual").' },
            { term: 'The 60-Second Handover', def: 'The streamlined onboarding process for venue owners to claim their listing and activate their partner benefits.' },
            { term: 'Partner Status', def: 'The membership tier of a League Partner (e.g., Starter, Pro, Legend), determining available tools and visibility.' },
            { term: 'Flash Deal', def: 'A time-limited special offer created by a League Partner to drive immediate traffic.' },
            { term: 'Maker\'s Trail', def: 'A discovery feature guiding players to venues that serve products from local Makers.' },
            { term: 'Safe Ride', def: 'The League\'s commitment to safety, providing direct links to Red Cab and ride-share services.' },
        ]
    },
    {
        category: 'Compliance & Legal',
        terms: [
            { term: 'LCB Compliance', def: 'Strict adherence to Washington State Liquor Control Board rules to protect our partners\' licenses.' },
            { term: 'Artie Pivot', def: 'A compliant alternative suggested by Artie when marketing copy risks violating LCB rules.' },
            { term: 'Anti-Volume', def: 'A core rule: the League never encourages rapid or excessive alcohol consumption. Points are for presence, not pints.' },
            { term: 'Undue Influence', def: 'The separation of gameplay and alcohol. Points are never directly tied to the purchase of liquid volume.' },
            { term: 'Stool Test', def: 'The requirement that a venue must have a manned bar and social-centric seating to be eligible for Partner induction.' },
        ]
    }
];
