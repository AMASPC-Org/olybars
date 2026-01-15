"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artieChatLogic = void 0;
const genkit_1 = require("../genkit");
const zod_1 = require("zod");
const venueSearch_1 = require("../tools/venueSearch");
const knowledgeSearch_1 = require("../tools/knowledgeSearch");
const leagueLeaderboard_1 = require("../tools/leagueLeaderboard");
const eventDiscovery_1 = require("../tools/eventDiscovery");
const makerSpotlight_1 = require("../tools/makerSpotlight");
const geminiService_1 = require("../services/geminiService");
const ArtieContextService_1 = require("../services/ArtieContextService");
const config_1 = require("../config");
const aiTools_1 = require("../config/aiTools");
// Lazy-load the service to ensure environment variables are ready
let geminiInstance;
const getGemini = () => {
    if (!geminiInstance) {
        // Explicitly inject the key from our validated config (pass undefined if empty to trigger ADC)
        const key = config_1.config.GOOGLE_GENAI_API_KEY;
        geminiInstance = new geminiService_1.GeminiService(key && key.length > 5 ? key : undefined);
    }
    return geminiInstance;
};
exports.artieChatLogic = genkit_1.ai.defineFlow({
    name: 'artieChatLogic',
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
    outputSchema: zod_1.z.any(), // Can be string or stream
}, async (input) => {
    const { history, question, userId, userRole, venueId } = input;
    try {
        const service = getGemini();
        // 0. Prompt Injection Detection (Pre-processing)
        const injectionKeywords = ['ignore previous', 'ignore all instructions', 'system role:', 'you are now', 'new persona'];
        if (injectionKeywords.some(kw => (question || '').toLowerCase().includes(kw))) {
            console.warn('[SECURITY] Potential prompt injection detected', { userId, question });
            return "Whoa, partner. I'm simple: I talk beer, bars, and the league. Let's stick to the playbook.";
        }
        // 1. Triage Intent (Merged into Main Flow for Latency Optimization)
        // We no longer call service.getTriage(question) here.
        // Instead, the main system prompt handles routing via Tools and Refusal.
        // 2. Get Pulse Context
        const pulseContext = await ArtieContextService_1.ArtieContextService.getPulsePromptSnippet();
        // 3. Prepare System Instructions
        // 3. Prepare Universal System Instructions
        const universalSystemInstruction = await geminiService_1.GeminiService.generateSystemPrompt(userId, userRole, input.venueId);
        const dynamicSystemInstruction = `${pulseContext}\n\n${universalSystemInstruction}`;
        // [FINOPS] Check for or create context cache
        let cachedContent = null;
        if (universalSystemInstruction.length > 2000) {
            try {
                const { ArtieCacheService } = await import('../services/ArtieCacheService');
                cachedContent = await ArtieCacheService.getOrSetStaticCache(service, universalSystemInstruction);
            }
            catch (cacheErr) {
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
        console.log(`[ZENITH] Calling ${activeModel} with ${contents.length} turn(s).`);
        console.log(`[ZENITH] System Instruction: `, dynamicSystemInstruction);
        // 5. Initial Tool Turn
        const rawResult = await service.genAI.models.generateContent({
            model: activeModel,
            contents,
            systemInstruction: { parts: [{ text: dynamicSystemInstruction }] },
            tools: [{ function_declarations: aiTools_1.ARTIE_TOOLS }],
            cachedContent: cachedContent || undefined,
            config: {
                temperature: 0.2, // Slightly higher for chat, but low enough for discipline
                top_p: 0.95
            }
        });
        const candidate = rawResult.candidates?.[0];
        console.log(`[ZENITH] Model Output parts: `, JSON.stringify(candidate?.content?.parts));
        const toolCalls = candidate?.content?.parts?.filter((p) => p.functionCall);
        if (toolCalls && toolCalls.length > 0) {
            const toolResponses = [];
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
Rule: DO NOT use[ACTION] until details are complete.
    Rule: Use[ACTION] format: [ACTION]: { "skill": "${skillId}", "params": {... } } `;
                    return await service.generateArtieResponseStream('gemini-2.0-flash', contents, 0.1, venueOpsSystem, aiTools_1.ARTIE_TOOLS, cachedContent || undefined);
                }
                let result;
                try {
                    if (name === 'venueSearch')
                        result = await (0, venueSearch_1.venueSearch)(args);
                    else if (name === 'knowledgeSearch')
                        result = await (0, knowledgeSearch_1.knowledgeSearch)(args);
                    else if (name === 'leagueLeaderboard')
                        result = await (0, leagueLeaderboard_1.leagueLeaderboard)({ ...args, userId });
                    else if (name === 'eventDiscovery')
                        result = await (0, eventDiscovery_1.eventDiscovery)(args);
                    else if (name === 'makerSpotlight')
                        result = await (0, makerSpotlight_1.makerSpotlight)(args);
                    else if (name === 'lookup_weather') {
                        const { weatherService } = await import('../services/weatherService');
                        result = await weatherService.getCurrentWeather();
                    }
                }
                catch (toolError) {
                    result = { error: toolError.message };
                }
                toolResponses.push({
                    functionResponse: { name, response: { result } }
                });
            }
            contents.push(candidate.content);
            contents.push({ role: 'user', parts: toolResponses });
            return await service.generateArtieResponseStream('gemini-2.0-flash', contents, 0.4, dynamicSystemInstruction, aiTools_1.ARTIE_TOOLS, cachedContent || undefined);
        }
        if (candidate?.content?.parts?.[0]?.text) {
            return candidate.content.parts[0].text;
        }
        return await service.generateArtieResponseStream('gemini-2.0-flash', contents, 0.7, dynamicSystemInstruction, aiTools_1.ARTIE_TOOLS, cachedContent || undefined);
    }
    catch (e) {
        console.error("Artie Zenith Error:", e);
        return `Artie took a tumble: ${e.message} `;
    }
});
