"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeSearch = void 0;
const zod_1 = require("zod");
const genkit_1 = require("../genkit");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const knowledgeBase_json_1 = __importDefault(require("../knowledgeBase.json"));
// Initialize Admin SDK if not already initialized
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_1.getFirestore)();
// [FINOPS] TTL Cache for Knowledge Base
let kbCache = null;
const KB_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FAQItemSchema = zod_1.z.object({
    question: zod_1.z.string(),
    answer: zod_1.z.string(),
});
const KnowledgeInputSchema = zod_1.z.object({
    query: zod_1.z.string().describe('The question or keywords to search in the OlyBars Playbook/FAQ.'),
});
exports.knowledgeSearch = genkit_1.ai.defineTool({
    name: 'knowledgeSearch',
    description: 'Search the OlyBars Playbook for rules, app help, and league info.',
    inputSchema: KnowledgeInputSchema,
    outputSchema: zod_1.z.array(FAQItemSchema),
}, async ({ query }) => {
    try {
        const normalizedQuery = query.toLowerCase();
        const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
        const now = Date.now();
        let liveKnowledge = [];
        if (kbCache && (now - kbCache.timestamp) < KB_CACHE_TTL) {
            liveKnowledge = kbCache.data;
        }
        else {
            const snapshot = await db.collection('knowledge').get();
            liveKnowledge = snapshot.docs.map(doc => {
                const data = doc.data();
                return { question: data.question, answer: data.answer };
            });
            kbCache = { data: liveKnowledge, timestamp: now };
        }
        const timeline = Object.entries(knowledgeBase_json_1.default.history_timeline).map(([k, v]) => ({ question: `History: ${k}`, answer: v }));
        const market = Object.entries(knowledgeBase_json_1.default.market_context).map(([k, v]) => ({ question: `Market Context: ${k}`, answer: v }));
        // Flatten strategy modules
        const strategy = Object.entries(knowledgeBase_json_1.default.strategy_modules || {}).flatMap(([moduleName, content]) => Object.entries(content).map(([k, v]) => {
            const valStr = Array.isArray(v) ? v.join(' ') : v;
            return { question: `Strategy (${moduleName}): ${k}`, answer: valStr };
        }));
        // Index Bar Games
        const games = (knowledgeBase_json_1.default.bar_games || []).flatMap((cat) => cat.games.map((g) => ({
            question: `Game / Activity: ${g.name} (${cat.category})`,
            answer: `${g.description} Tags: ${g.tags.join(', ')}`
        })));
        const allKnowledge = [...knowledgeBase_json_1.default.faq, ...timeline, ...market, ...strategy, ...games, ...liveKnowledge];
        return allKnowledge.filter(item => {
            const combinedText = `${item.question} ${item.answer}`.toLowerCase();
            if (combinedText.includes(normalizedQuery))
                return true;
            return queryWords.some(word => combinedText.includes(word));
        }).slice(0, 10);
    }
    catch (error) {
        console.error("Knowledge search failed:", error);
        return [];
    }
});
