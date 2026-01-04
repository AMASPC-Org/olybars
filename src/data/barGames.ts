import { TAXONOMY_PLAY, TAXONOMY_FEATURES, TAXONOMY_EVENTS } from './taxonomy';

// Helper to create game objects from string lists
const createItems = (names: string[], categoryType: 'Play' | 'Feature' | 'Event') => {
    return names.map(name => {
        // Default descriptions based on category to maintain compatibility
        let description = 'Interactive entertainment.';
        let tags = ['Play'];

        if (categoryType === 'Feature') {
            description = 'Permanent venue amenity.';
            tags = ['Feature', 'Vibe'];
        } else if (categoryType === 'Event') {
            description = 'Scheduled activity.';
            tags = ['Event', 'Social'];
        }

        return {
            name,
            description,
            tags
        };
    });
};

export const barGames = [
    {
        category: 'PLAY (Interactive)',
        games: createItems(TAXONOMY_PLAY, 'Play').map(g => {
            // Restore rich descriptions for key items if needed, or rely on simple defaults for now.
            // For now, we use simple mapping to ensure strict adherence to the taxonomy.
            // Future: We can hydrate this with the specific text from the old file if critical.
            return g;
        })
    },
    {
        category: 'FEATURES (The Setup)',
        games: createItems(TAXONOMY_FEATURES, 'Feature')
    },
    {
        category: 'EVENTS (Calendar)',
        games: createItems(TAXONOMY_EVENTS, 'Event')
    }
];

// Hydrate specific descriptions for critical items to maintain quality
const descriptionMap: Record<string, string> = {
    'Pinball': 'Keep the silver ball alive. Lights, bumpers, and skill shots.',
    'Pool / Billiards': 'The green felt classic. Call your pockets.',
    'Darts': 'Steel or soft tip. Aim for the bullseye.',
    'Pull Tabs': 'State standard chance game. Snap them open to win.',
    'Jukebox': 'Touchtunes or Vinyl. Control the vibe.',
    'Trivia Night': 'Team-based mental combat. Prizes and bragging rights.',
    'Karaoke': 'You are the star. Choose your song and belt it out.'
};

// Apply hydration
barGames.forEach(cat => {
    cat.games.forEach(g => {
        if (descriptionMap[g.name]) {
            g.description = descriptionMap[g.name];
        }
    });
});
