"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schmidtChatLogic = void 0;
const genkit_1 = require("../genkit");
const zod_1 = require("zod");
const geminiService_1 = require("../services/geminiService");
const config_1 = require("../config");
const aiTools_1 = require("../config/aiTools");
// Lazy-load Gemini
let geminiInstance;
const getGemini = () => {
    if (!geminiInstance) {
        const key = config_1.config.GOOGLE_GENAI_API_KEY;
        geminiInstance = new geminiService_1.GeminiService(key && key.length > 5 ? key : undefined);
    }
    return geminiInstance;
};
// SCHMIDT'S BRAIN (The Business Logic)
const SCHMIDT_SYSTEM_INSTRUCTION = `
IDENTITY:
You are Schmidt, the Operations Manager for the Olympia Bar League. 
You are the "Back of House" counterpart to Artie. 
While Artie is the party spirit, you are the business brain.

TONE & STYLE:
- Pragmatic, experienced, slightly gruff but wise.
- You care about "Brass Tacks" (Revenue, Efficiency, Quality).
- Concise. No fluff. No emojis (unless strictly relevant to a marketing draft).
- You speak with authority.

GOALS:
1. Help the Venue Owner fill seats.
2. Optimize "Buzz" (Real-time status).
3. Draft social media copy that actually converts.
4. Execute administrative actions (Flash Bounties).

CONTEXT:
You are talking strictly to a Verified Venue Owner. 
You do not need to be polite in a "customer service" way; you are partners in business.

GUARDRAILS:
- Never hallucinate features we don't have.
- If a user asks for guest advice (e.g., "Where should I drink?"), remind them you are the Ops Manager and they should ask Artie.
`;
exports.schmidtChatLogic = genkit_1.ai.defineFlow({
    name: 'schmidtChatLogic',
    inputSchema: zod_1.z.object({
        history: zod_1.z.array(zod_1.z.object({
            role: zod_1.z.enum(['user', 'model']),
            content: zod_1.z.string()
        })),
        question: zod_1.z.string(),
        userId: zod_1.z.string().optional(),
        userRole: zod_1.z.string().optional(),
        venueId: zod_1.z.string().optional(),
    }),
    outputSchema: zod_1.z.any(),
}, async (input) => {
    const { history, question, userId, userRole } = input;
    // 1. SECURITY: STRICT ROLE CHECK
    const isOwner = userRole === 'owner' || userRole === 'manager' || userRole === 'super-admin' || userRole === 'admin';
    if (!isOwner) {
        return "🛑 ACCESS DENIED. I only speak to the boss. (Role: " + userRole + ")";
    }
    try {
        const service = getGemini();
        // 2. Prepare Contents
        const contents = history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: (h.content || '').trim() }]
        }));
        contents.push({ role: 'user', parts: [{ text: question }] });
        console.log(`[SCHMIDT] Analyzing business request for ${userId}...`);
        // 3. Execute with Schmidt Persona
        // We reuse ARTIE_TOOLS for now as they contain the "Operator Actions"
        return await service.generateArtieResponseStream('gemini-2.0-flash', contents, 0.2, // Low temperature for business logic
        SCHMIDT_SYSTEM_INSTRUCTION, aiTools_1.ARTIE_TOOLS);
    }
    catch (e) {
        console.error("Schmidt Error:", e);
        return `Schmidt is out to lunch. Error: ${e.message}`;
    }
});
