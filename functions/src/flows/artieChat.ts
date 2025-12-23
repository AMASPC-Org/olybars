import { ai as genkitAi } from '../genkit';
import { z } from 'zod';
import { venueSearch } from '../tools/venueSearch';
import { GeminiService } from '../services/geminiService';

// Lazy-load the service to ensure environment variables are ready
let geminiInstance: GeminiService;

const getGemini = () => {
    if (!geminiInstance) geminiInstance = new GeminiService();
    return geminiInstance;
};

const MessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

export const artieChatLogic = genkitAi.defineFlow({
    name: 'artieChatLogic',
    inputSchema: z.object({
        history: z.array(MessageSchema),
        question: z.string(),
    }),
    outputSchema: z.string(),
}, async (input) => {
    const { history, question } = input;

    if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GOOGLE_API_KEY) {
        return "I'm having trouble connecting to my brain (API Key missing). Please check the server logs.";
    }

    try {
        const service = getGemini();

        // 1. Triage Intent
        const rawTriage = await service.getTriage(question);

        if (rawTriage.includes('SAFETY')) {
            return "Whoa there, friend. Sounds like a rough night. If you need a safe ride, call Red Cab: (360) 555-0100. Let's keep it safe.";
        }

        const baseContents = [
            { role: 'user', parts: [{ text: GeminiService.ARTIE_PERSONA }] },
            ...history.map(h => ({
                role: h.role,
                parts: [{ text: h.content }]
            }))
        ];

        // 2. Search Intent
        if (rawTriage.includes('SEARCH')) {
            const searchKeywords = rawTriage.split('SEARCH:')[1]?.trim().toLowerCase() || question;
            const queryResult = await venueSearch({ query: searchKeywords });

            baseContents.push({
                role: 'user',
                parts: [{ text: `User Query: ${question}\n\nVenue Search Data: ${JSON.stringify(queryResult)}` }]
            });

            return await service.generateArtieResponse('gemini-2.0-flash', baseContents, 0.5)
                || "I found some spots, but my voice is a bit dry. Try asking again?";
        }

        // 3. General Chat
        baseContents.push({ role: 'user', parts: [{ text: question }] });
        return await service.generateArtieResponse('gemini-2.0-flash', baseContents, 0.7) || "Cheers!";

    } catch (e: any) {
        console.error("Artie Generative Error:", e);
        return `Artie tripped over a keg: ${e.message}`;
    }
});
