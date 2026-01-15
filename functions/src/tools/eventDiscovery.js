"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventDiscovery = void 0;
const zod_1 = require("zod");
const genkit_1 = require("../genkit");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_1.getFirestore)();
const EventSchema = zod_1.z.object({
    venueName: zod_1.z.string(),
    venueId: zod_1.z.string(),
    event: zod_1.z.string(),
    time: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    points: zod_1.z.number(),
});
const EventInputSchema = zod_1.z.object({
    type: zod_1.z.enum(['trivia', 'karaoke', 'pool', 'bingo', 'all']).optional().describe('Type of event to find.'),
    timeframe: zod_1.z.enum(['tonight', 'tomorrow', 'week']).optional().describe('When the event is happening.'),
});
exports.eventDiscovery = genkit_1.ai.defineTool({
    name: 'eventDiscovery',
    description: 'Find sanctioned OlyBars League events like Trivia, Karaoke, and Pool.',
    inputSchema: EventInputSchema,
    outputSchema: zod_1.z.array(EventSchema),
}, async ({ type, timeframe }) => {
    try {
        const snapshot = await db.collection('venues')
            .where('isActive', '==', true)
            .get();
        const allEvents = snapshot.docs.flatMap(doc => {
            const data = doc.data();
            if (!data.leagueEvent || data.leagueEvent === 'none')
                return [];
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
    }
    catch (error) {
        console.error("Event discovery failed:", error);
        return [];
    }
});
