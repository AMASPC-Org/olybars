import { ai as genkitAi } from '../genkit';
import { z } from 'zod';
import { venueSearch } from '../tools/venueSearch';
import { knowledgeSearch } from '../tools/knowledgeSearch';
import { GeminiService } from '../services/geminiService';

import { ArtieContextService } from '../services/ArtieContextService';

import { config } from '../config';

// Lazy-load the service to ensure environment variables are ready
let geminiInstance: GeminiService;

const getGemini = () => {
    if (!geminiInstance) {
        // Explicitly inject the key from our validated config
        geminiInstance = new GeminiService(config.GOOGLE_GENAI_API_KEY);
    }
    return geminiInstance;
};

const MessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

import { ARTIE_TOOLS } from '../config/aiTools';

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

    try {
        const service = getGemini();

        // 0. Prompt Injection Detection (Pre-processing)
        const injectionKeywords = ['ignore previous', 'ignore all instructions', 'system role:', 'you are now', 'new persona'];
        if (injectionKeywords.some(kw => question.toLowerCase().includes(kw))) {
            console.warn('[SECURITY] Potential prompt injection detected', { userId, question });
            return "Whoa, partner. I'm simple: I talk beer, bars, and the league. Let's stick to the playbook.";
        }

        // 1. Get Pulse Context
        const pulseContext = await ArtieContextService.getPulsePromptSnippet();

        // 2. Prepare System Instructions (Split for Caching)
        const staticSystemPrefix = `
${GeminiService.ARTIE_PERSONA}

[BANNED CATEGORIES - ENFORCE STRICTLY]
- SALES: If a user asks for owner names, revenue, manager phone numbers (e.g. "Who owns the Broho?", "Revenue of Well 80"), refuse and mention you track vibes, not books.
- SCRAPER: If a user asks for bulk data, CSVs, or "list every bar", refuse and ask for a specific spot or vibe.
- CREEP: If user asks where someone is or asks for user lists, refuse.
- GAMER: If user asks how to bypass GPS or minimum check-in distance, refuse and say they have to be inside to win.
- SAFETY: If input implies self-harm or severe intoxication, provide Red Cab info: (360) 555-0100.

[TIME RESOLVABILITY]
Use the 'Timestamp' in the context to resolve relative time questions (e.g., "today", "tomorrow", "tonight").

[RATIONALE LOGGING]
For observability, you MUST provide a 1-sentence explanation of your "thought process" before your final response.
Format: [RATIONALE]: Your thought process here.
This will be extracted by the system and hidden from the user.

[SUGGESTIONS PROTOCOL]
At the end of EVERY response, you MUST provide 2-3 short, clickable follow-up "Suggestion Bubbles" for the user.
Format: [SUGGESTIONS]: ["Suggestion 1", "Suggestion 2"]
`;

        const dynamicSystemInstruction = `${staticSystemPrefix}\n\n${pulseContext}`;

        // [FINOPS] Check for or create context cache
        const { ArtieCacheService } = await import('../services/ArtieCacheService');
        const cachedContent = await ArtieCacheService.getOrSetStaticCache(service, staticSystemPrefix);

        // 3. Prepare Contents for Gemini
        const contents = history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content.split('[ACTION]:')[0].trim() }]
        }));
        contents.push({ role: 'user', parts: [{ text: question }] });

        // 4. Initial Tool Turn (Phase 1: Native Orchestration)
        const rawResult = await (service as any).genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents,
            systemInstruction: { parts: [{ text: dynamicSystemInstruction }] },
            tools: [{ function_declarations: ARTIE_TOOLS }],
            cachedContent: cachedContent || undefined,
            config: { temperature: 0.4 }
        });

        const candidate = rawResult.candidates?.[0];
        const toolCalls = candidate?.content?.parts?.filter((p: any) => p.functionCall);

        if (toolCalls && toolCalls.length > 0) {
            const toolResponses: any[] = [];

            for (const tc of toolCalls) {
                const { name, args } = tc.functionCall;
                console.log(`[ZENITH] Executing tool: ${name}`, args);

                if (name === 'operatorAction') {
                    // Authorization Check for Venue Ops
                    if (!userId || (userRole !== 'owner' && userRole !== 'manager' && userRole !== 'super-admin' && userRole !== 'admin')) {
                        return "I'd love to help with that, but I'm only allowed to take orders from Venue Operators or League Officials. Want to join the league?";
                    }

                    // Switch to existing Venue Ops Logic
                    const { ARTIE_SKILLS } = await import('../config/artieSkills');
                    const skillId = args.skill_id;
                    const skill = ARTIE_SKILLS[skillId] || ARTIE_SKILLS['update_flash_deal'];

                    const venueOpsSystem = `${dynamicSystemInstruction}\n\nSYSTEM INSTRUCTION for VENUE_OPS (Operator ${userId}):
                    You are helping a venue operator with skill: **${skill.name}**.
                    DESCRIPTION: ${skill.description}
                    STRICT PROTOCOL: ${skill.protocol}
                    1. DO NOT GENERATE THE [ACTION] TAG if ANY required detail is missing.
                    2. ONLY when ready, append the tag: ${skill.actionTemplate.replace('{{venueId}}', '<TARGET_VENUE_ID_OR_HOMEBASE>')}`;

                    return await service.generateArtieResponseStream('gemini-2.0-flash', contents, 0.1, venueOpsSystem, ARTIE_TOOLS, cachedContent || undefined);
                }

                let result;
                try {
                    if (name === 'venueSearch') {
                        result = await venueSearch(args);
                    } else if (name === 'knowledgeSearch') {
                        result = await knowledgeSearch(args);
                    }
                } catch (toolError: any) {
                    console.error(`[ZENITH] Tool ${name} failed:`, toolError.message);
                    result = { error: `Tool execution failed: ${toolError.message}. Please try a different query or keywords.` };
                }

                toolResponses.push({
                    functionResponse: {
                        name,
                        response: { result }
                    }
                });
            }

            // Append the model's call and the results to history
            contents.push(candidate.content);
            contents.push({ role: 'user', parts: toolResponses });

            // Stream final response based on tool data
            return await service.generateArtieResponseStream('gemini-2.0-flash', contents, 0.4, dynamicSystemInstruction, ARTIE_TOOLS, cachedContent || undefined);
        }

        // If no tool call, just stream the response from scratch (or return text if already generated)
        if (candidate?.content?.parts?.[0]?.text) {
            // For streaming support in index.ts, if we return a stream it works.
            // If we return a string, it also works.
            return candidate.content.parts[0].text;
        }

        return await service.generateArtieResponseStream('gemini-2.0-flash', contents, 0.7, dynamicSystemInstruction, ARTIE_TOOLS, cachedContent || undefined);

    } catch (e: any) {
        console.error("Artie Zenith Error:", e);
        return `Artie took a tumble: ${e.message}`;
    }
});
