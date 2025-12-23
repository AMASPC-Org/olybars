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
    happyHour: z.string().optional(),
    vibe: z.string().optional(),
    status: z.string().optional(),
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
                    happyHour: data.happyHour || '',
                    vibe: data.vibe || 'chill',
                    status: data.status || 'unknown'
                };
            });

            const lowerQuery = query.toLowerCase();
            return allVenues.filter(v =>
                v.name.toLowerCase().includes(lowerQuery) ||
                v.description.toLowerCase().includes(lowerQuery) ||
                v.vibe.toLowerCase().includes(lowerQuery)
            ).slice(0, 5); // Limit to top 5 matches
        } catch (error) {
            console.error("Venue search failed:", error);
            return [];
        }
    }
);
