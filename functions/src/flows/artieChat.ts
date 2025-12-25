import { ai as genkitAi } from '../genkit';
import { z } from 'zod';
import { venueSearch } from '../tools/venueSearch';
import { knowledgeSearch } from '../tools/knowledgeSearch';
import { GeminiService } from '../services/geminiService';

import { ArtieContextService } from '../services/ArtieContextService';

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
        userId: z.string().optional(),
        userRole: z.string().optional(),
    }),
    outputSchema: z.string(),
}, async (input) => {
    const { history, question, userId, userRole } = input;

    if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
        return "I'm having trouble connecting to my brain (API Key missing). Please check the server logs.";
    }

    try {
        const service = getGemini();

        // 1. Triage Intent
        const rawTriage = await service.getTriage(question);

        if (rawTriage.includes('SAFETY')) {
            return "Whoa there, friend. Sounds like a rough night. If you need a safe ride, call Red Cab: (360) 555-0100. Let's keep it safe.";
        }

        // Fetch Real-time Pulse
        const pulseContext = await ArtieContextService.getPulsePromptSnippet();

        const baseContents = [
            {
                role: 'user',
                parts: [{
                    text: `${GeminiService.ARTIE_PERSONA}\n\n${pulseContext}\n\n[TIME RESOLVABILITY]\nUse the 'Timestamp' in the context to resolve relative time questions (e.g., "today", "tomorrow", "tonight"). For tomorrow's events, look for 'Upcoming Events' or venues with tomorrow-aligned schedules.`
                }]
            },
            ...history.map(h => ({
                role: h.role,
                parts: [{ text: h.content }]
            }))
        ];

        // 2. Playbook/FAQ Intent
        if (rawTriage.includes('PLAYBOOK')) {
            const kbKeywords = rawTriage.split('PLAYBOOK:')[1]?.trim().toLowerCase() || question;
            const kbResult = await knowledgeSearch({ query: kbKeywords });

            baseContents.push({
                role: 'user',
                parts: [{ text: `User Query: ${question}\n\nOlyBars Playbook Knowledge: ${JSON.stringify(kbResult)}` }]
            });

            return await service.generateArtieResponse('gemini-2.0-flash', baseContents, 0.4)
                || "I've got the playbook right here, but I'm blanking. Ask me about league rules again?";
        }

        // 3. Search Intent
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

        // 4. Venue Ops Intent
        if (rawTriage.includes('VENUE_OPS')) {
            if (!userId || (userRole !== 'owner' && userRole !== 'manager' && userRole !== 'super-admin' && userRole !== 'admin')) {
                return "I'd love to help with that, but I'm only allowed to take orders from Venue Operators or League Officials. Want to join the league?";
            }

            // [STUB] For Now, Artie summarizes what they want to do
            // In a future sprint, this will trigger the ProposeAction UI
            const actionTarget = rawTriage.split('VENUE_OPS:')[1]?.trim() || question;

            baseContents.push({
                role: 'user',
                parts: [{
                    text: `User (Operator ${userId}) wants to update: ${actionTarget}. 
                Respond as Artie acknowledging the request and stating that a confirmation link has been prepared (Stubbed for prototype). 
                Ask them to verify the change details.` }]
            });

            const artieResponse = await service.generateArtieResponse('gemini-2.0-flash', baseContents, 0.4)
                || "Got it, Boss! I'll get that update ready for your signal.";

            // For now, simulate the action payload for the frontend to pick up
            const actionPayload = {
                type: 'VENUE_UPDATE',
                action: 'CONFIRM_FLASH_DEAL',
                summary: actionTarget,
                timestamp: new Date().toISOString()
            };

            return `${artieResponse}\n\n[ACTION]: ${JSON.stringify(actionPayload)}`;
        }

        // 5. General Chat
        baseContents.push({ role: 'user', parts: [{ text: question }] });
        return await service.generateArtieResponse('gemini-2.0-flash', baseContents, 0.7) || "Cheers!";

    } catch (e: any) {
        console.error("Artie Generative Error:", e);
        return `Artie tripped over a keg: ${e.message}`;
    }
});
