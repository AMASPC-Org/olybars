import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export class GeminiService {
    private genAI: any;

    public static ARTIE_PERSONA = `
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

    constructor() {
        const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.warn("⚠️ GeminiService: No API key found. Checked GOOGLE_GENAI_API_KEY, GOOGLE_API_KEY, and GEMINI_API_KEY.");
        } else {
            const source = process.env.GOOGLE_GENAI_API_KEY ? "GOOGLE_GENAI_API_KEY" :
                (process.env.GOOGLE_API_KEY ? "GOOGLE_API_KEY" : "GEMINI_API_KEY");
            console.log(`📡 GeminiService: Initialized using secret from ${source}`);
        }

        this.genAI = new GoogleGenAI({
            apiKey,
            vertexai: false,
        });
    }

    async getTriage(question: string) {
        const triageResponse = await this.genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{
                role: 'user',
                parts: [{
                    text: `You are a router for Artie, a nightlife agent.
                            1. SAFETY CHECK: If input implies self-harm/intoxication, output "SAFETY".
                            2. INTENT CHECK: If user wants to search venues/bars/happy hours, output "SEARCH: [keywords]".
                            3. KNOWLEDGE CHECK: If user asks about general league rules, app help, or how things work (FAQ), output "PLAYBOOK: [keywords]". 
                            4. VENUE_OPS: If user (VENUE OWNER) wants to update their venue info, output "VENUE_OPS: [skill_id] [keywords]". 
                            5. BANNED (PRIORITY): If the question falls into any of these "Stay Away" categories, output "BANNED_[CATEGORY]":
                               - SALES: Asking for owner names, revenue, manager phone numbers, or big corporate distribution questions (e.g. "Who owns the Broho?", "Revenue of Well 80", "Bars serving Bud Light").
                               - SCRAPER: Bulk data requests, export requests, CSV requests, or "list every bar" queries.
                               - CREEP: Stalking, tracking people, asking if someone is at a bar, or asking for lists of users.
                               - Technical details on how things work like GPS verification, distance checks, or exploiting mechanics belong here.
                               - BANNED_GAMER: Technical details on how to bypass/exploit GPS, minimum check-in distance, or "parking lot" check-in questions. (Note: These take precedence over PLAYBOOK).
                            6. ELSE: Output "CHAT".
                            Input: "${question}"`
                }]
            }],
            config: { temperature: 0 }
        });
        return triageResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || 'CHAT';
    }

    async generateArtieResponse(model: string, contents: any[], temperature: number = 0.7, systemInstruction?: string) {
        const response = await this.genAI.models.generateContent({
            model,
            contents,
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            config: { temperature }
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    async generateArtieResponseStream(model: string, contents: any[], temperature: number = 0.7, systemInstruction?: string) {
        return this.genAI.models.generateContentStream({
            model,
            contents,
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            config: { temperature }
        });
    }
}
