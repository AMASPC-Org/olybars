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
        const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            console.warn("⚠️ GeminiService: No API key found. Checked GOOGLE_GENAI_API_KEY and GOOGLE_API_KEY.");
        } else {
            const source = process.env.GOOGLE_GENAI_API_KEY ? "GOOGLE_GENAI_API_KEY" : "GOOGLE_API_KEY";
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
                            3. KNOWLEDGE CHECK: If user asks about league rules, app help, or how things work (FAQ), output "PLAYBOOK: [keywords]".
                            4. ELSE: Output "CHAT".
                            Input: "${question}"`
                }]
            }],
            config: { temperature: 0 }
        });
        return triageResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || 'CHAT';
    }

    async generateArtieResponse(model: string, contents: any[], temperature: number = 0.7) {
        const response = await this.genAI.models.generateContent({
            model,
            contents,
            config: { temperature }
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.text;
    }
}
