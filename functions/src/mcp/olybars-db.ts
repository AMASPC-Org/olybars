import { ai } from '../genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Ensure Firebase is initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = getFirestore();

export const searchBars = ai.defineTool({
    name: 'searchBars',
    description: 'Finds bars based on criteria or vibe',
    inputSchema: z.object({
        query: z.string().describe("Search keywords for name"),
        vibe: z.string().optional().describe("Filter by specific vibe tag")
    }),
}, async (input) => {
    const barsRef = db.collection('bars');
    let queryObj: admin.firestore.Query = barsRef;

    if (input.vibe) {
        queryObj = queryObj.where('vibe', 'array-contains', input.vibe);
    }

    const snapshot = await queryObj.get();
    const results = snapshot.docs.map(doc => doc.data());

    if (input.query) {
        const q = input.query.toLowerCase();
        return results.filter(bar =>
            (bar.name && bar.name.toLowerCase().includes(q))
        );
    }

    return results;
});
