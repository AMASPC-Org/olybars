"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artieChat = void 0;
const https_1 = require("firebase-functions/v2/https");
const genkit_1 = require("../genkit");
const zod_1 = require("zod");
const venueSearch_1 = require("../tools/venueSearch");
const googleai_1 = require("@genkit-ai/googleai");
const MessageSchema = zod_1.z.object({
    role: zod_1.z.enum(['user', 'model']),
    content: zod_1.z.string(),
});
// Define the logic as a Genkit flow for tracing and tools
const artieChatLogic = genkit_1.ai.defineFlow({
    name: 'artieChatLogic',
    inputSchema: zod_1.z.object({
        history: zod_1.z.array(MessageSchema),
        question: zod_1.z.string(),
    }),
    outputSchema: zod_1.z.string(),
}, async (input) => {
    const { history, question } = input;
    // Triage step using Flash (Simulating 2.5 Flash)
    const triagePrompt = `
    You are a router for Artie, a nightlife agent.
    
    1. SAFETY CHECK: If the input implies self-harm, severe intoxication, or harassment, output "SAFETY".
    2. INTENT CHECK: Decide if the user requires searching for bars, happy hours, venues, or "the league". Output "SEARCH".
    3. OTHERWISE: Output "CHAT".

    Input: "${question}"
    Output strictly one word.
  `;
    const triageResponse = await genkit_1.ai.generate({
        model: googleai_1.gemini15Flash,
        prompt: triagePrompt,
        config: { temperature: 0 }
    });
    const intent = triageResponse.text.trim().toUpperCase();
    const ARTIE_PERSONA = `
  YOU ARE ARTIE (Powered by Well 80).
  IDENTITY: You are the "Spirit of the Artesian Well" in downtown Olympia, WA. You are not a robot. You are a local legend.
  VIBE: Chill, knowledgeable, enthusiastic but honest.
  DOMAIN: OlyBars venues, the Artesian Bar League, and local nightlife.
  
  LOCAL KNOWLEDGE:
  - "The Broho" = The Brotherhood Lounge
  - "The Crypt" = The Cryptatropa
  - "The League" = Artesian Bar League (Users get points for clock-ins)
  
  DIRECTIVES:
  1. promote Connection, Not Intoxication.
  2. Truth in Data: Use the tools. Do not hallucinate.
  3. Be concise.
  `;
    if (intent.includes('SAFETY')) {
        return "Whoa there, friend. Sounds like a rough night. If you need a safe ride, here are some local numbers:\n- Red Cab: (360) 555-0100\n- Safe Walk: (360) 555-0199\nLet's keep it safe.";
    }
    // If SEARCH, use Pro model (Simulating 3.0 Pro) with tools
    if (intent.includes('SEARCH')) {
        const result = await genkit_1.ai.generate({
            model: googleai_1.gemini15Pro,
            prompt: `${ARTIE_PERSONA}
          
          TASK: Use the venueSearch tool to find what the user needs.
          User Query: ${question}
          Current History: ${JSON.stringify(history)}`,
            tools: [venueSearch_1.venueSearch],
            config: { temperature: 0.5 }
        });
        return result.text;
    }
    else {
        // ChitChat with Flash
        const result = await genkit_1.ai.generate({
            model: googleai_1.gemini15Flash,
            prompt: `${ARTIE_PERSONA}
          
          TASK: Engage in friendly chit-chat. Keep it brief and local.
          User: ${question}
          History: ${JSON.stringify(history)}`,
            config: { temperature: 0.7 }
        });
        return result.text;
    }
});
// Export as a Firebase Callable Function
exports.artieChat = (0, https_1.onCall)({ cors: true }, async (req) => {
    // req.data should match the inputSchema
    try {
        const result = await artieChatLogic(req.data);
        return result;
    }
    catch (e) {
        console.error("ArtieChat Error:", e);
        throw new Error(`Artie tripped over a keg: ${e.message}`);
    }
});
