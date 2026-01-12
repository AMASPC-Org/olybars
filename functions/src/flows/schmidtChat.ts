import { ai as genkitAi } from '../genkit';
import { z } from 'zod';
import { GeminiService } from '../services/geminiService';
import { config } from '../config';
import { ARTIE_TOOLS } from '../config/aiTools';

// Lazy-load Gemini
let geminiInstance: GeminiService;
const getGemini = () => {
    if (!geminiInstance) {
        const key = config.GOOGLE_GENAI_API_KEY;
        geminiInstance = new GeminiService(key && key.length > 5 ? key : undefined);
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

export const schmidtChatLogic = genkitAi.defineFlow({
    name: 'schmidtChatLogic',
    inputSchema: z.object({
        history: z.array(z.object({
            role: z.enum(['user', 'model']),
            content: z.string()
        })),
        question: z.string(),
        userId: z.string().optional(),
        userRole: z.string().optional(),
        venueId: z.string().optional(),
    }),
    outputSchema: z.any(),
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
        return await service.generateArtieResponseStream(
            'gemini-2.0-flash', 
            contents, 
            0.2, // Low temperature for business logic
            SCHMIDT_SYSTEM_INSTRUCTION, 
            ARTIE_TOOLS
        );

    } catch (e: any) {
        console.error("Schmidt Error:", e);
        return `Schmidt is out to lunch. Error: ${e.message}`;
    }
});
