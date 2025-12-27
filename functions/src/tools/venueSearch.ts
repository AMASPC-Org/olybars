import { z } from 'zod';
import { ai } from '../genkit';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Admin SDK if not already initialized
if (getApps().length === 0) {
    initializeApp();
}
const db = getFirestore();

// [FINOPS] TTL Cache for Venue Search
let venueSearchCache: { data: any[], timestamp: number } | null = null;
const VENUE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
            const now = Date.now();
            let allVenues: any[] = [];

            if (venueSearchCache && (now - venueSearchCache.timestamp) < VENUE_CACHE_TTL) {
                allVenues = venueSearchCache.data;
            } else {
                // Simple robust search: fetch all and filter in memory (dataset is small < 100)
                // to support fuzzy "vibe" search without complex indexing for now.
                const snapshot = await db.collection('venues').get();
                allVenues = snapshot.docs.map(doc => {
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
                venueSearchCache = { data: allVenues, timestamp: now };
            }

            const normalizedQuery = query.toLowerCase().replace(/[’‘]/g, "'");
            const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);

            const hhKeywords = ['happy hour', 'hh', 'specials', 'cheap', 'drinks'];
            const isHHSearch = hhKeywords.some(k => normalizedQuery.includes(k));

            return allVenues.filter(v => {
                const venueText = `${v.name} ${(v as any).nicknames?.join(' ') || ''} ${v.description} ${v.vibe} ${v.leagueEvent || ''} ${v.deal || ''} ${v.triviaTime || ''} ${v.happyHour?.description || ''} ${v.happyHourSimple || ''}`.toLowerCase().replace(/[’‘]/g, "'");

                // If it's a Happy Hour search, prioritize venues with HH data
                if (isHHSearch && (v.happyHour || v.happyHourSimple)) return true;

                if (venueText.includes(normalizedQuery)) return true;
                return queryWords.some(word => venueText.includes(word));
            }).slice(0, 10);
        } catch (error) {
            console.error("Venue search failed:", error);
            return [];
        }
    }
);
