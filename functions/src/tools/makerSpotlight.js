"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makerSpotlight = void 0;
const zod_1 = require("zod");
const genkit_1 = require("../genkit");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_1.getFirestore)();
const MakerSchema = zod_1.z.object({
    name: zod_1.z.string(),
    venueId: zod_1.z.string(),
    makerType: zod_1.z.string(),
    originStory: zod_1.z.string(),
    insiderVibe: zod_1.z.string(),
    address: zod_1.z.string(),
});
const MakerInputSchema = zod_1.z.object({
    type: zod_1.z.enum(['brewery', 'winery', 'cidery', 'distillery', 'any']).optional().describe('Type of maker to spotlight.'),
});
exports.makerSpotlight = genkit_1.ai.defineTool({
    name: 'makerSpotlight',
    description: 'Spotlight OlyBars Local Makers - the breweries, wineries, and distilleries that define the city.',
    inputSchema: MakerInputSchema,
    outputSchema: zod_1.z.array(MakerSchema),
}, async ({ type }) => {
    try {
        let query = db.collection('venues').where('isLocalMaker', '==', true);
        const snapshot = await query.get();
        let makers = snapshot.docs.map((doc) => {
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
            makers = makers.filter((m) => m.makerType.toLowerCase() === type);
        }
        return makers.slice(0, 3); // Top 3 spotlighted
    }
    catch (error) {
        console.error("Maker spotlight failed:", error);
        return [];
    }
});
