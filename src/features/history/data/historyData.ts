export interface ContentBlock {
    type: 'text' | 'heading' | 'venue_card' | 'hidden_fact' | 'image';
    content: string; // HTML string for text, venueId for card, fact text for hidden
    alt?: string;
}

export interface HistoryArticle {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    coverImage: string;
    author: string;
    date: string;
    readingTime: string;
    blocks: ContentBlock[];
    relatedVenueIds: string[];
}

export const HISTORY_ARTICLES: HistoryArticle[] = [
    {
        id: '1',
        slug: 'tunnels-of-olympia',
        title: 'The Lost Tunnels of Olympia',
        subtitle: 'Rum-running, politics, and the subterranean secrets beneath 4th Ave.',
        coverImage: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&q=80&w=2000', // Placeholder
        author: 'The Archivist',
        date: 'Dec 24, 2025',
        readingTime: '5 min read',
        relatedVenueIds: ['the-brotherhood-lounge', 'well-80'],
        blocks: [
            {
                type: 'text',
                content: "Legend says you could once walk from the Capital to the Port without seeing the sun..."
            },
            {
                type: 'heading',
                content: "The Prohibition Era"
            },
            {
                type: 'text',
                content: "During the dry years, Olympia wasn't just dry—it was thirsty. The subterranean network, originally built for steam pipes and utility access, supposedly became the highway for 'The Good Stuff'."
            },
            {
                type: 'venue_card',
                content: 'the-brotherhood-lounge'
            },
            {
                type: 'text',
                content: "The Brotherhood Lounge, established significantly earlier than its current iteration, sits atop one of the most famous rumored access points."
            },
            {
                type: 'hidden_fact',
                content: "CHEAT CODE: The original door to the tunnels is painted 'Safety Orange' in the basement."
            },
            {
                type: 'text',
                content: "While many tunnels have been filled in or collapsed, the legend persists. Next time you're having a beer downtown, listen closely to the floorboards."
            }
        ]
    },
    {
        id: '2',
        slug: 'artesian-water',
        title: 'It\'s The Water',
        subtitle: 'Why a single aquifer made Olympia the brewing capital of the West.',
        coverImage: 'https://images.unsplash.com/photo-1629218260655-0eb30e1637ae?auto=format&fit=crop&q=80&w=2000',
        author: 'Leopold S.',
        date: 'Dec 20, 2025',
        readingTime: '4 min read',
        relatedVenueIds: ['well-80'],
        blocks: [
            {
                type: 'text',
                content: "In 1896, Leopold Schmidt uncorked a spring that changed the world. The water was perfect. Pure, alkaline, and endless."
            },
            {
                type: 'venue_card',
                content: 'well-80'
            },
            {
                type: 'text',
                content: "Today, Well 80 sits directly on top of one of the original wells. You aren't just drinking beer; you're drinking history."
            }
        ]
    }
];
