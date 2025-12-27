import { z } from 'zod';
import { ai } from '../genkit';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
    initializeApp();
}
const db = getFirestore();

const MakerSchema = z.object({
    name: z.string(),
    venueId: z.string(),
    makerType: z.string(),
    originStory: z.string(),
    insiderVibe: z.string(),
    address: z.string(),
});

const MakerInputSchema = z.object({
    type: z.enum(['brewery', 'winery', 'cidery', 'distillery', 'any']).optional().describe('Type of maker to spotlight.'),
});

export const makerSpotlight = ai.defineTool(
    {
        name: 'makerSpotlight',
        description: 'Spotlight OlyBars Local Makers - the breweries, wineries, and distilleries that define the city.',
        inputSchema: MakerInputSchema,
        outputSchema: z.array(MakerSchema),
    },
    async ({ type }: z.infer<typeof MakerInputSchema>) => {
        try {
            let query: any = db.collection('venues').where('isLocalMaker', '==', true);

            const snapshot = await query.get();

            let makers = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    name: data.name,
                    venueId: doc.id,
                    makerType: data.makerType || 'Craft Maker',
                    originStory: data.originStory || '',
                    insiderVibe: data.insiderVibe || '',
                    address: data.address || ''
                };
            });

            if (type && type !== 'any') {
                makers = makers.filter(m => m.makerType.toLowerCase() === type);
            }

            return makers.slice(0, 3); // Top 3 spotlighted
        } catch (error) {
            console.error("Maker spotlight failed:", error);
            return [];
        }
    }
);
