import { z } from 'zod';
import { ai } from '../genkit';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
    initializeApp();
}
const db = getFirestore();

const EventSchema = z.object({
    venueName: z.string(),
    venueId: z.string(),
    event: z.string(),
    time: z.string(),
    description: z.string().optional(),
    points: z.number(),
});

const EventInputSchema = z.object({
    type: z.enum(['trivia', 'karaoke', 'pool', 'bingo', 'all']).optional().describe('Type of event to find.'),
    timeframe: z.enum(['tonight', 'tomorrow', 'week']).optional().describe('When the event is happening.'),
});

export const eventDiscovery = ai.defineTool(
    {
        name: 'eventDiscovery',
        description: 'Find sanctioned OlyBars League events like Trivia, Karaoke, and Pool.',
        inputSchema: EventInputSchema,
        outputSchema: z.array(EventSchema),
    },
    async ({ type, timeframe }: z.infer<typeof EventInputSchema>) => {
        try {
            const snapshot = await db.collection('venues')
                .where('isActive', '==', true)
                .get();

            const allEvents = snapshot.docs.flatMap(doc => {
                const data = doc.data();
                if (!data.leagueEvent || data.leagueEvent === 'none') return [];

                // Simple point mapping for events
                const points = data.leagueEvent === 'trivia' ? 100 : 50;

                return [{
                    venueName: data.name,
                    venueId: doc.id,
                    event: data.leagueEvent,
                    time: data.triviaTime || 'Contact Venue',
                    description: data.eventDescription || '',
                    points
                }];
            });

            let filtered = allEvents;
            if (type && type !== 'all') {
                filtered = filtered.filter(e => e.event.toLowerCase() === type);
            }

            // Timeframe filtering is currently simplified as data model is mostly recurring
            // In a real prod env, we'd check against a specific calendar collection.

            return filtered.slice(0, 5);
        } catch (error) {
            console.error("Event discovery failed:", error);
            return [];
        }
    }
);
