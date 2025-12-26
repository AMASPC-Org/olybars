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

        if (rawTriage.includes('BANNED_SALES')) {
            return "I track the vibe, not the books. If you want to talk business, go buy a drink and ask the bartender.";
        }

        if (rawTriage.includes('BANNED_SCRAPER')) {
            return "Whoa, slow down. I can tell you where to go right now, but I’m not writing a book report. Ask me about a specific spot or vibe.";
        }

        if (rawTriage.includes('BANNED_CREEP')) {
            return "I don't track people, I track parties. If you want to find your friends, text them.";
        }

        if (rawTriage.includes('BANNED_GAMER')) {
            return "Nice try. You have to be inside to win. Clock in when you see the bartender.";
        }

        // Fetch Real-time Pulse
        const pulseContext = await ArtieContextService.getPulsePromptSnippet();

        // 2. Sanitize and build history
        // IMPORTANT: Strip [ACTION] tags from history so the model doesn't get confused 
        // by its own previous JSON outputs when we want it to follow new instructions.
        const cleanContents = history.map(h => ({
            role: h.role,
            parts: [{ text: h.content.split('[ACTION]:')[0].trim() }]
        }));

        const systemBase = `${GeminiService.ARTIE_PERSONA}\n\n${pulseContext}\n\n[TIME RESOLVABILITY]\nUse the 'Timestamp' in the context to resolve relative time questions (e.g., "today", "tomorrow", "tonight").\n\n[SUGGESTIONS PROTOCOL]\nAt the end of EVERY response, you MUST provide 2-3 short, clickable follow-up "Suggestion Bubbles" for the user. These should be relevant to the context (e.g., if you just updated a deal, suggest "What's the happy hour?" or "Show me the map"). Use this format on its own line:\n[SUGGESTIONS]: ["Suggestion 1", "Suggestion 2"]`;

        // 3. Playbook/FAQ Intent
        if (rawTriage.includes('PLAYBOOK')) {
            const kbKeywords = rawTriage.split('PLAYBOOK:')[1]?.trim().toLowerCase() || question;
            const kbResult = await knowledgeSearch({ query: kbKeywords });

            cleanContents.push({
                role: 'user',
                parts: [{ text: `User Query: ${question}\n\nOlyBars Playbook Knowledge: ${JSON.stringify(kbResult)}` }]
            });

            return await service.generateArtieResponse('gemini-2.0-flash', cleanContents, 0.4, systemBase)
                || "I've got the playbook right here, but I'm blanking. Ask me about league rules again?";
        }

        // 4. Search Intent
        if (rawTriage.includes('SEARCH')) {
            const searchKeywords = rawTriage.split('SEARCH:')[1]?.trim().toLowerCase() || question;
            const queryResult = await venueSearch({ query: searchKeywords });

            cleanContents.push({
                role: 'user',
                parts: [{ text: `User Query: ${question}\n\nVenue Search Data: ${JSON.stringify(queryResult)}` }]
            });

            return await service.generateArtieResponse('gemini-2.0-flash', cleanContents, 0.5, systemBase)
                || "I found some spots, but my voice is a bit dry. Try asking again?";
        }

        // 5. Venue Ops Intent
        if (rawTriage.includes('VENUE_OPS')) {
            if (!userId || (userRole !== 'owner' && userRole !== 'manager' && userRole !== 'super-admin' && userRole !== 'admin')) {
                return "I'd love to help with that, but I'm only allowed to take orders from Venue Operators or League Officials. Want to join the league?";
            }

            const { ARTIE_SKILLS } = await import('../config/artieSkills');
            const triageParts = rawTriage.split('VENUE_OPS:')[1]?.trim().toLowerCase().split(' ') || [];
            const skillId = triageParts[0];
            const skill = ARTIE_SKILLS[skillId] || ARTIE_SKILLS['update_flash_deal']; // Fallback to flash deal for safety

            const venueOpsSystem = `${systemBase}\n\nSYSTEM INSTRUCTION for VENUE_OPS (Operator ${userId}):
            You are helping a venue operator (Home Base: ${userRole === 'admin' || userRole === 'super-admin' ? 'Global Admin' : 'Home Base Search Req'}) with the following skill: **${skill.name}**.
            
            DESCRIPTION: ${skill.description}
            
            STRICT PROTOCOL:
            ${skill.protocol}
            
            1. DO NOT GENERATE THE [ACTION] TAG if ANY required detail is missing.
            
            2. If the user provides partial info, POLITELY ask for the rest. Do not be a robot; stay in Artie's persona.
            
            3. If the user presents a correction ("Draft Correction: ..."), acknowledge it and RE-EVALUATE if the final data is complete.
            
            4. ONLY when ready, append the tag on its own line:
               ${skill.actionTemplate.replace('{{venueId}}', '<TARGET_VENUE_ID_OR_HOMEBASE>')}
               
            Remember: Use the venueId if known, otherwise the system will fallback.`;

            cleanContents.push({ role: 'user', parts: [{ text: question }] });

            return await service.generateArtieResponse('gemini-2.0-flash', cleanContents, 0.1, venueOpsSystem);
        }

        // 6. General Chat
        cleanContents.push({ role: 'user', parts: [{ text: question }] });
        return await service.generateArtieResponse('gemini-2.0-flash', cleanContents, 0.7, systemBase) || "Cheers!";

    } catch (e: any) {
        console.error("Artie Generative Error:", e);
        return `Artie tripped over a keg: ${e.message}`;
    }
});
