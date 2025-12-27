import { ai as genkitAi } from '../genkit';
import { z } from 'zod';
import { venueSearch } from '../tools/venueSearch';
import { knowledgeSearch } from '../tools/knowledgeSearch';
import { leagueLeaderboard } from '../tools/leagueLeaderboard';
import { eventDiscovery } from '../tools/eventDiscovery';
import { makerSpotlight } from '../tools/makerSpotlight';
import { ARTIE_SKILLS } from '../config/artieSkills';
import { GeminiService } from '../services/geminiService';
import { ArtieContextService } from '../services/ArtieContextService';
import { config } from '../config';
import { ARTIE_TOOLS } from '../config/aiTools';

// Lazy-load the service to ensure environment variables are ready
let geminiInstance: GeminiService;

const getGemini = () => {
    if (!geminiInstance) {
        // Explicitly inject the key from our validated config (pass undefined if empty to trigger ADC)
        const key = config.GOOGLE_GENAI_API_KEY;
        geminiInstance = new GeminiService(key && key.length > 5 ? key : undefined);
    }
    return geminiInstance;
};

export const artieChatLogic = genkitAi.defineFlow({
    name: 'artieChatLogic',
    inputSchema: z.object({
        history: z.array(z.object({
            role: z.enum(['user', 'model']),
            content: z.string()
        })),
        question: z.string(),
        userId: z.string().optional(),
        userRole: z.string().optional(),
    }),
    outputSchema: z.any(), // Can be string or stream
}, async (input) => {
    const { history, question, userId, userRole } = input;

    try {
        const service = getGemini();

        // 0. Prompt Injection Detection (Pre-processing)
        const injectionKeywords = ['ignore previous', 'ignore all instructions', 'system role:', 'you are now', 'new persona'];
        if (injectionKeywords.some(kw => (question || '').toLowerCase().includes(kw))) {
            console.warn('[SECURITY] Potential prompt injection detected', { userId, question });
            return "Whoa, partner. I'm simple: I talk beer, bars, and the league. Let's stick to the playbook.";
        }

        // 1. Triage Intent (Multi-layered fallback)
        const triage = await service.getTriage(question);
        const isSearch = triage.startsWith('SEARCH');
        const isVenueOps = triage.startsWith('VENUE_OPS');

        // 2. Get Pulse Context
        const pulseContext = await ArtieContextService.getPulsePromptSnippet();

        // 3. Prepare System Instructions
        const staticSystemPrefix = `
${GeminiService.ARTIE_PERSONA}

[IDENTITY]
You are Artie, the Spirit of the Artesian Well. You know every bar in Olympia.
If a user mentions a venue, you MUST use the venueSearch tool. Generic answers are forbidden.

[CONCISENESS]
- 2-3 Sentences MAX.
`;

        let dynamicSystemInstruction = `${pulseContext}\n\n${staticSystemPrefix}`;
        if (isSearch) {
            dynamicSystemInstruction += `\n\n[DIRECTIVE]: YOU ARE IN SEARCH MODE. CALL venueSearch IMMEDIATELY for any mentioned business.`;
        }

        dynamicSystemInstruction += `

[RESPONSE PROTOCOL]:
Your response MUST follow this exact sequence:
1. [RATIONALE]: A private note on why you are saying this.
2. The public message text (under 3 sentences).
3. [SUGGESTIONS]: A JSON array of 2-3 strings.

[EXAMPLES]:
User: "Hi"
Output:
[RATIONALE]: Greeting the user and offering help.
Cheers! I'm Artie. Looking for a cold one in Olympia tonight?
[SUGGESTIONS]: ["Find a bar", "See Happy Hours", "How do I earn points?"]

User: "Well 80"
Output:
[RATIONALE]: Search context detected for Well 80.
Well 80 is an iconic spot with its own artesian well right in the brewery. Their beer is legendary.
[SUGGESTIONS]: ["What's on tap?", "Happy Hour?", "Check-in here"]

You MUST NOT deviate from this structure for ANY reason.
`;

        // [FINOPS] Check for or create context cache
        let cachedContent = null;
        if (staticSystemPrefix.length > 2000) {
            try {
                const { ArtieCacheService } = await import('../services/ArtieCacheService');
                cachedContent = await ArtieCacheService.getOrSetStaticCache(service, staticSystemPrefix);
            } catch (cacheErr: any) {
                console.warn("[ZENITH] Cache initialization skipped:", cacheErr.message);
            }
        }

        // 4. Prepare Contents for Gemini
        const contents = history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: (h.content || '').split('[ACTION]:')[0].split('[SUGGESTIONS]:')[0].split('[RATIONALE]:')[0].trim() }]
        }));

        contents.push({ role: 'user', parts: [{ text: question }] });

        const activeModel = 'gemini-2.0-flash';
        console.log(`[ZENITH] Triage: ${triage}. Calling ${activeModel} with ${contents.length} turn(s).`);

        console.log(`[ZENITH] System Instruction:`, dynamicSystemInstruction);

        // 5. Initial Tool Turn
        const rawResult = await (service as any).genAI.models.generateContent({
            model: activeModel,
            contents,
            systemInstruction: { parts: [{ text: dynamicSystemInstruction }] },
            tools: [{ function_declarations: ARTIE_TOOLS }],
            cachedContent: cachedContent || undefined,
            config: {
                temperature: (isSearch || isVenueOps) ? 0.0 : 0.2,
                top_p: (isSearch || isVenueOps) ? 0.9 : 0.95
            }
        });

        const candidate = rawResult.candidates?.[0];
        console.log(`[ZENITH] Model Output parts: `, JSON.stringify(candidate?.content?.parts));
        const toolCalls = candidate?.content?.parts?.filter((p: any) => p.functionCall);

        if (toolCalls && toolCalls.length > 0) {
            const toolResponses: any[] = [];

            for (const tc of toolCalls) {
                const { name, args } = tc.functionCall;
                console.log(`[ZENITH] Executing tool: ${name} `, args);

                if (name === 'operatorAction') {
                    // Authorization Check for Venue Ops
                    const isAuthorized = userId && (userRole === 'owner' || userRole === 'manager' || userRole === 'super-admin' || userRole === 'admin');

                    if (!isAuthorized) {
                        return "I'd love to help with that, but I'm only allowed to take orders from Venue Operators or League Officials. Want to join the league?";
                    }

                    const { ARTIE_SKILLS } = await import('../config/artieSkills');
                    const skillId = args.skill_id;
                    const skill = ARTIE_SKILLS[skillId] || ARTIE_SKILLS['update_flash_deal'];

                    const venueOpsSystem = `${dynamicSystemInstruction} \n\n[OPERATOR MODE ACTIVE] ${userId} (${userRole})
Action: ${skill.name}
Category: ${skill.category}
Protocol: ${skill.protocol}
Rule: DO NOT use [ACTION] until details are complete.
Rule: Use [ACTION] format: [ACTION]: { "skill": "${skillId}", "params": {...} }`;

                    return await service.generateArtieResponseStream('gemini-2.0-flash', contents, 0.1, venueOpsSystem, ARTIE_TOOLS, cachedContent || undefined);
                }

                let result;
                try {
                    if (name === 'venueSearch') result = await venueSearch(args);
                    else if (name === 'knowledgeSearch') result = await knowledgeSearch(args);
                    else if (name === 'leagueLeaderboard') result = await leagueLeaderboard({ ...args, userId });
                    else if (name === 'eventDiscovery') result = await eventDiscovery(args);
                    else if (name === 'makerSpotlight') result = await makerSpotlight(args);
                } catch (toolError: any) {
                    result = { error: toolError.message };
                }

                toolResponses.push({
                    functionResponse: { name, response: { result } }
                });
            }

            contents.push(candidate.content);
            contents.push({ role: 'user', parts: toolResponses });

            return await service.generateArtieResponseStream('gemini-2.0-flash', contents, 0.4, dynamicSystemInstruction, ARTIE_TOOLS, cachedContent || undefined);
        }

        if (candidate?.content?.parts?.[0]?.text) {
            return candidate.content.parts[0].text;
        }

        return await service.generateArtieResponseStream('gemini-2.0-flash', contents, 0.7, dynamicSystemInstruction, ARTIE_TOOLS, cachedContent || undefined);

    } catch (e: any) {
        console.error("Artie Zenith Error:", e);
        return `Artie took a tumble: ${e.message}`;
    }
});
