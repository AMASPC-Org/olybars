import { z } from 'zod';
import { ai } from '../genkit';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import kb from '../knowledgeBase.json';

// Initialize Admin SDK if not already initialized
if (getApps().length === 0) {
    initializeApp();
}
const db = getFirestore();

// [FINOPS] TTL Cache for Knowledge Base
let kbCache: { data: any[], timestamp: number } | null = null;
const KB_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const FAQItemSchema = z.object({
    question: z.string(),
    answer: z.string(),
});

const KnowledgeInputSchema = z.object({
    query: z.string().describe('The question or keywords to search in the OlyBars Playbook/FAQ.'),
});

export const knowledgeSearch = ai.defineTool(
    {
        name: 'knowledgeSearch',
        description: 'Search the OlyBars Playbook for rules, app help, and league info.',
        inputSchema: KnowledgeInputSchema,
        outputSchema: z.array(FAQItemSchema),
    },
    async ({ query }: z.infer<typeof KnowledgeInputSchema>) => {
        try {
            const normalizedQuery = query.toLowerCase();
            const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);

            const now = Date.now();
            let liveKnowledge: any[] = [];

            if (kbCache && (now - kbCache.timestamp) < KB_CACHE_TTL) {
                liveKnowledge = kbCache.data;
            } else {
                const snapshot = await db.collection('knowledge').get();
                liveKnowledge = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return { question: data.question, answer: data.answer };
                });
                kbCache = { data: liveKnowledge, timestamp: now };
            }

            const timeline = Object.entries(kb.history_timeline).map(([k, v]) => ({ question: `History: ${k}`, answer: v }));
            const market = Object.entries(kb.market_context).map(([k, v]) => ({ question: `Market Context: ${k}`, answer: v }));
            // Flatten strategy modules
            const strategy = Object.entries(kb.strategy_modules || {}).flatMap(([moduleName, content]) =>
                Object.entries(content).map(([k, v]) => {
                    const valStr = Array.isArray(v) ? v.join(' ') : v;
                    return { question: `Strategy (${moduleName}): ${k}`, answer: valStr as string };
                })
            );

            const allKnowledge = [...kb.faq, ...timeline, ...market, ...strategy, ...liveKnowledge];

            return allKnowledge.filter(item => {
                const combinedText = `${item.question} ${item.answer}`.toLowerCase();
                if (combinedText.includes(normalizedQuery)) return true;
                return queryWords.some(word => combinedText.includes(word));
            }).slice(0, 10);
        } catch (error) {
            console.error("Knowledge search failed:", error);
            return [];
        }
    }
);
