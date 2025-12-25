import { z } from 'zod';
import { ai } from '../genkit';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Admin SDK if not already initialized
if (getApps().length === 0) {
    initializeApp();
}
const db = getFirestore();

const VenueSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    happyHour: z.object({
        startTime: z.string(),
        endTime: z.string(),
        description: z.string(),
        days: z.array(z.string()).optional(),
    }).optional().nullable(),
    vibe: z.string().optional(),
    status: z.string().optional(),
    makerType: z.string().optional(),
    isLocalMaker: z.boolean().optional(),
    originStory: z.string().optional(),
    insiderVibe: z.string().optional(),
    address: z.string().optional(),
    leagueEvent: z.string().optional().nullable(),
    triviaTime: z.string().optional(),
    category: z.string().optional(),
    tier_config: z.object({
        is_directory_listed: z.boolean(),
        is_league_eligible: z.boolean(),
    }).optional(),
    attributes: z.object({
        has_manned_bar: z.boolean(),
        food_service: z.string(),
        minors_allowed: z.boolean(),
        noise_level: z.string(),
    }).optional(),
});

const VenueInputSchema = z.object({
    query: z.string().describe('The search query for venue name or vibe (e.g., "dive bar", "karaoke", "Well 80").'),
});

export const venueSearch = ai.defineTool(
    {
        name: 'venueSearch',
        description: 'Search for venues, bars, and their happy hours in Olympia.',
        inputSchema: VenueInputSchema,
        outputSchema: z.array(VenueSchema),
    },
    async ({ query }: z.infer<typeof VenueInputSchema>) => {
        try {
            // Simple robust search: fetch all and filter in memory (dataset is small < 100)
            // to support fuzzy "vibe" search without complex indexing for now.
            const snapshot = await db.collection('venues').get();
            const allVenues = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    name: data.name || 'Unknown',
                    description: data.description || '',
                    happyHour: data.happyHour || null,
                    vibe: data.vibe || 'chill',
                    status: data.status || 'unknown',
                    // Maker Data
                    makerType: data.makerType || undefined,
                    isLocalMaker: data.isLocalMaker || false,
                    originStory: data.originStory || '',
                    insiderVibe: data.insiderVibe || '',
                    address: data.address || '',
                    leagueEvent: data.leagueEvent || null,
                    triviaTime: data.triviaTime || '',
                    deal: data.deal || '',
                    category: data.category || '',
                    tier_config: data.tier_config || undefined,
                    attributes: data.attributes || undefined
                };
            });

            const normalizedQuery = query.toLowerCase().replace(/[’‘]/g, "'");
            const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2); // only significant words

            return allVenues.filter(v => {
                const venueText = `${v.name} ${v.description} ${v.vibe} ${v.leagueEvent || ''} ${v.deal || ''} ${v.triviaTime || ''}`.toLowerCase().replace(/[’‘]/g, "'");
                // Match if the full normalized query is in the text
                if (venueText.includes(normalizedQuery)) return true;
                // Or if any significant word matches
                return queryWords.some(word => venueText.includes(word));
            }).slice(0, 10); // Limit to top 10 matches for more event visibility
        } catch (error) {
            console.error("Venue search failed:", error);
            return [];
        }
    }
);
