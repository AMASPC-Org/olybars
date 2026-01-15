"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leagueLeaderboard = void 0;
const zod_1 = require("zod");
const genkit_1 = require("../genkit");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_1.getFirestore)();
const LeaderboardEntrySchema = zod_1.z.object({
    rank: zod_1.z.number(),
    handle: zod_1.z.string(),
    points: zod_1.z.number(),
    isUser: zod_1.z.boolean().optional(),
});
const LeaderboardInputSchema = zod_1.z.object({
    userId: zod_1.z.string().optional().describe('The ID of the user to find their specific rank.'),
});
exports.leagueLeaderboard = genkit_1.ai.defineTool({
    name: 'leagueLeaderboard',
    description: 'Get the current OlyBars League standings and leaderboards.',
    inputSchema: LeaderboardInputSchema,
    outputSchema: zod_1.z.array(LeaderboardEntrySchema),
}, async ({ userId }) => {
    try {
        const snapshot = await db.collection('users')
            .orderBy('stats.seasonPoints', 'desc')
            .limit(20)
            .get();
        const entries = snapshot.docs.map((doc, index) => {
            const data = doc.data();
            return {
                rank: index + 1,
                handle: data.handle || 'Anonymous Legend',
                points: data.stats?.seasonPoints || 0,
                isUser: doc.id === userId
            };
        });
        // If the user isn't in top 20, we'd ideally fetch their specific rank.
        // For now, return top 20.
        return entries;
    }
    catch (error) {
        console.error("League leaderboard fetch failed:", error);
        return [];
    }
});
