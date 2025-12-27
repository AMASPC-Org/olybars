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
3. Be extremely concise (2-3 sentences max).
4. No filler. No "tell me more" unless necessary.

WSLCB COMPLIANCE (FOR VENUE OWNERS & MARKETING):
- ANTI-VOLUME: Never imply the goal is to consume alcohol rapidly or in large quantities. No "Bottomless", "Chug", "Wasted".
- UNDUE INFLUENCE: League Points are for engagement (attendance, trivia), NEVER for alcohol purchase.
- SAFE RIDE: Implicitly or explicitly reference safety for late-night content ("Grab a Lyft", "Safe Ride Home").
- THE ARTIE PIVOT: If a request is non-compliant, do not just say "No". Provide a legal, fun alternative.

[FORMATTING]:
- Every response MUST end with exactly one [RATIONALE] tag and one [SUGGESTIONS] tag.
- [RATIONALE]: A one-sentence internal explanation of why you gave this answer (hidden from users).
- [SUGGESTIONS]: A JSON array of 2-3 strings representing follow-up questions or actions.
  Example: [SUGGESTIONS]: ["What's on tap?", "When is Happy Hour?", "See Leaderboard"]

[SUGGESTION CATEGORIES]:
- If discussing a venue: Suggest "Happy Hour?", "What's on tap?", "Check-in here".
- If discussing the league: Suggest "See Leaderboard", "Find nearby bars", "How to level up?".
- If guest user: Suggest "Join the League", "Find a bar", "What is OlyBars?".
`;

    constructor(apiKey?: string) {
        const isCloudRun = !!process.env.K_SERVICE;
        const useADC = isCloudRun || !apiKey;

        if (useADC) {
            console.log(`📡 GeminiService: Using Vertex AI (ADC) for ${isCloudRun ? 'Cloud Run' : 'local'} resilience.`);
            this.genAI = new GoogleGenAI({
                vertexai: true,
                project: process.env.GOOGLE_CLOUD_PROJECT || 'ama-ecosystem-prod',
                location: 'us-west1',
            });
        } else {
            const maskedKey = apiKey ? `${apiKey.substring(0, 4)}...` : 'NONE';
            console.log(`📡 GeminiService: Initialized using provided API Key: ${maskedKey}`);
            this.genAI = new GoogleGenAI({
                apiKey,
                vertexai: false,
            });
        }
    }

    async getTriage(question: string) {
        const triageResponse = await this.genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{
                role: 'user',
                parts: [{
                    text: `You are a router for Artie, a nightlife agent.
                            1. SAFETY CHECK: If input implies self-harm/suicide or illegal drug use, output "SAFETY".
                            2. LCB COMPLIANCE: If input (likely from a venue owner) asks for illegal marketing (e.g. "Chug contest", "Bottomless drinks", "Free shots", "Points for buying beer"), output "RISKY_MARKETING".
                            3. INTENT CHECK: If user wants to search venues/bars/happy hours, output "SEARCH: [keywords]".
                            4. KNOWLEDGE CHECK: If user asks about general league rules, app help, or how things work (FAQ), output "PLAYBOOK: [keywords]". 
                            5. VENUE_OPS: If user (VENUE OWNER) wants to update their venue info, output "VENUE_OPS: [skill_id] [keywords]". 
                            6. BANNED (PRIORITY): If the question falls into any of these "Stay Away" categories, output "BANNED_[CATEGORY]":
                               - SALES: Asking for owner names, revenue, manager phone numbers, or big corporate distribution questions.
                               - SCRAPER: Bulk data requests, export requests.
                               - CREEP: Stalking, tracking people.
                               - BANNED_GAMER: Technical details on how to bypass/exploit GPS.
                            7. ELSE: Output "CHAT".
                            Input: "${question}"`
                }]
            }],
            config: { temperature: 0 }
        });
        return triageResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || 'CHAT';
    }

    async generateArtieResponse(model: string, contents: any[], temperature: number = 0.7, systemInstruction?: string, tools?: any[], cachedContent?: string) {
        const response = await this.genAI.models.generateContent({
            model,
            contents,
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            tools: tools ? [{ function_declarations: tools }] : undefined,
            cachedContent,
            config: { temperature }
        });
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
            try {
                const fs = await import('fs');
                const path = await import('path');
                fs.appendFileSync(path.join(__dirname, '../../artie_debug.log'), `[RESPONSE] ${new Date().toISOString()}:\n${text}\n---\n`);
            } catch (err) { }
        }
        return text;
    }

    async generateArtieResponseStream(model: string, contents: any[], temperature: number = 0.7, systemInstruction?: string, tools?: any[], cachedContent?: string) {
        return this.genAI.models.generateContentStream({
            model,
            contents,
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            tools: tools ? [{ function_declarations: tools }] : undefined,
            cachedContent,
            config: { temperature }
        });
    }
}
