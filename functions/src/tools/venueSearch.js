"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.venueSearch = void 0;
const zod_1 = require("zod");
const genkit_1 = require("../genkit");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// Initialize Admin SDK if not already initialized
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_1.getFirestore)();
// [FINOPS] TTL Cache for Venue Search
let venueSearchCache = null;
const VENUE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const VenueSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    happyHour: zod_1.z.object({
        startTime: zod_1.z.string(),
        endTime: zod_1.z.string(),
        description: zod_1.z.string(),
        days: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional().nullable(),
    vibe: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    makerType: zod_1.z.string().optional(),
    isLocalMaker: zod_1.z.boolean().optional(),
    originStory: zod_1.z.string().optional(),
    insiderVibe: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    leagueEvent: zod_1.z.string().optional().nullable(),
    triviaTime: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    tier_config: zod_1.z.object({
        is_directory_listed: zod_1.z.boolean(),
        is_league_eligible: zod_1.z.boolean(),
    }).optional(),
    attributes: zod_1.z.object({
        has_manned_bar: zod_1.z.boolean(),
        food_service: zod_1.z.string(),
        minors_allowed: zod_1.z.boolean(),
        noise_level: zod_1.z.string(),
    }).optional(),
});
const VenueInputSchema = zod_1.z.object({
    query: zod_1.z.string().describe('The search query for venue name or vibe (e.g., "dive bar", "karaoke", "Well 80").'),
});
exports.venueSearch = genkit_1.ai.defineTool({
    name: 'venueSearch',
    description: 'Search for venues, bars, and their happy hours in Olympia.',
    inputSchema: VenueInputSchema,
    outputSchema: zod_1.z.array(VenueSchema),
}, async ({ query }) => {
    try {
        const now = Date.now();
        let allVenues = [];
        if (venueSearchCache && (now - venueSearchCache.timestamp) < VENUE_CACHE_TTL) {
            allVenues = venueSearchCache.data;
        }
        else {
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
            const venueText = `${v.name} ${v.nicknames?.join(' ') || ''} ${v.description} ${v.vibe} ${v.leagueEvent || ''} ${v.deal || ''} ${v.triviaTime || ''} ${v.happyHour?.description || ''} ${v.happyHourSimple || ''}`.toLowerCase().replace(/[’‘]/g, "'");
            // If it's a Happy Hour search, prioritize venues with HH data
            if (isHHSearch && (v.happyHour || v.happyHourSimple))
                return true;
            if (venueText.includes(normalizedQuery))
                return true;
            return queryWords.some(word => venueText.includes(word));
        }).slice(0, 10);
    }
    catch (error) {
        console.error("Venue search failed:", error);
        return [];
    }
});
