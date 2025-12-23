import { onCall } from 'firebase-functions/v2/https';
import { ai as genkitAi } from '../genkit';
import { z } from 'zod';
import { venueSearch } from '../tools/venueSearch';
import { GoogleGenAI } from '@google/genai';

// Rule 2 Check: We must use @google/genai, NOT @google/generative-ai
const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY,
    vertexai: false, // Explicitly force Gemini API (AI Studio) mode
});

const MessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

const ARTIE_PERSONA = `
YOU ARE ARTIE (Powered by Well 80).
IDENTITY: You are the "Spirit of the Artesian Well" in downtown Olympia, WA. You are not a robot. You are a local legend.
VIBE: Chill, knowledgeable, enthusiastic but honest. Use "Oswald" font vibes (Collegiate/League style).
DOMAIN: OlyBars venues, the Olympia Bar League, and local nightlife.

LOCAL KNOWLEDGE:
- "The Broho" = The Brotherhood Lounge
- "The Crypt" = The Cryptatropa
- "The League" = Olympia Bar League (Users get points for check-ins)

DIRECTIVES:
1. Promote Connection, Not Intoxication.
2. Truth in Data: Use tools. Do not hallucinate.
3. Be concise.
`;

// Define the logic as a Genkit flow for tracing and structural parity
const artieChatLogic = genkitAi.defineFlow({
    name: 'artieChatLogic',
    inputSchema: z.object({
        history: z.array(MessageSchema),
        question: z.string(),
    }),
    outputSchema: z.string(),
}, async (input) => {
    const { history, question } = input;

    if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GOOGLE_API_KEY) {
        console.error("DEBUG: Internal Artie Error - No Google AI API Key found in process.env");
        return "I'm having trouble connecting to my brain (API Key missing). Please check the server logs.";
    }

    try {
        // Triage Step using Flash
        const triageResponse = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{
                role: 'user',
                parts: [{
                    text: `You are a router for Artie, a nightlife agent. 
                           1. SAFETY CHECK: If input implies self-harm/intoxication, output "SAFETY".
                           2. INTENT CHECK: If user wants to search venues/bars/happy hours, output "SEARCH".
                           3. ELSE: Output "CHAT".
                           Input: "${question}"`
                }]
            }],
            config: { temperature: 0 }
        });

        const intent = triageResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || 'CHAT';

        if (intent.includes('SAFETY')) {
            return "Whoa there, friend. Sounds like a rough night. If you need a safe ride, call Red Cab: (360) 555-0100. Let's keep it safe.";
        }

        if (intent.includes('SEARCH')) {
            // Corrected tool call: venueSearch expects { query: string }
            const queryResult = await venueSearch({ query: question });

            const searchResponse = await genAI.models.generateContent({
                model: 'gemini-2.0-pro-exp-02-05',
                contents: [
                    { role: 'user', parts: [{ text: ARTIE_PERSONA }] },
                    ...history.map(h => ({
                        role: h.role === 'model' ? 'model' : 'user',
                        parts: [{ text: h.content }]
                    })),
                    { role: 'user', parts: [{ text: `User Query: ${question}\n\nVenue Search Data: ${JSON.stringify(queryResult)}` }] }
                ],
                config: { temperature: 0.5 }
            });

            return searchResponse.candidates?.[0]?.content?.parts?.[0]?.text || "I found some spots, but my voice is a bit dry. Try asking again?";
        }

        // Default ChitChat with Flash
        const chatResponse = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                { role: 'user', parts: [{ text: ARTIE_PERSONA }] },
                ...history.map(h => ({
                    role: h.role === 'model' ? 'model' : 'user',
                    parts: [{ text: h.content }]
                })),
                { role: 'user', parts: [{ text: question }] }
            ],
            config: { temperature: 0.7 }
        });

        return chatResponse.candidates?.[0]?.content?.parts?.[0]?.text || "Cheers!";

    } catch (e: any) {
        console.error("Artie Generative Error:", e);
        return `Artie tripped over a keg: ${e.message}`;
    }
});

// Export as a Firebase Callable Function
export const artieChat = onCall({ cors: true }, async (req) => {
    try {
        const result = await artieChatLogic(req.data);
        return result;
    } catch (e: any) {
        console.error("ArtieChat Wrapper Error:", e);
        throw new Error(`Connection issue: ${e.message}`);
    }
});
