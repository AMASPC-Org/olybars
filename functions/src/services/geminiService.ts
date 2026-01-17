import { GoogleGenAI } from '@google/genai';
import { ARTIE_SYSTEM_INSTRUCTION } from '../appConfig/agents/artie.js';
import { SCHMIDT_SYSTEM_INSTRUCTION } from '../appConfig/agents/schmidt.js';
// import { genkit } from 'genkit'; // TODO: Install Genkit in functions if needed
// import { vertexAI, imagen3Fast } from '@genkit-ai/vertexai'; // TODO: Install Genkit in functions if needed

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export class GeminiService {
    private genAI: any;

    // Agent Personas (Imported from Config)
    public static ARTIE_PERSONA = ARTIE_SYSTEM_INSTRUCTION;
    public static SCHMIDT_PERSONA = SCHMIDT_SYSTEM_INSTRUCTION;

    constructor(apiKey?: string) {
        const isCloudRun = !!process.env.K_SERVICE;
        const useADC = isCloudRun || !apiKey;

        if (useADC) {
            console.log(`📡 GeminiService (Functions): Using Vertex AI (ADC).`);
            this.genAI = new GoogleGenAI({
                vertexai: true,
                project: process.env.GOOGLE_CLOUD_PROJECT || 'ama-ecosystem-prod',
                location: 'us-west1',
            });
        } else {
            const maskedKey = apiKey ? `${apiKey.substring(0, 4)}...` : 'NONE';
            console.log(`📡 GeminiService (Functions): Initialized using provided API Key: ${maskedKey}`);
            this.genAI = new GoogleGenAI({
                apiKey,
                vertexai: false,
            });
        }
    }

    // --- ADAPTER METHOD: REQUIRED FOR BACKWARD COMPATIBILITY WITH ARTIECHAT ---
    static async generateSystemPrompt(userId?: string, userRole?: string, venueId?: string): Promise<string> {
        return `${GeminiService.ARTIE_PERSONA}

[CURRENT CONTEXT]
User ID: ${userId || 'Guest'}
User Role: ${userRole || 'visitor'}
Current Venue Focus: ${venueId || 'None'}
`;
    }
    // ------------------------------------------------------------------------

    async generateArtieResponse(model: string, contents: any[], temperature: number = 0.7, systemInstruction?: string, tools?: any[], cachedContent?: string) {
        const instruction = systemInstruction || GeminiService.ARTIE_PERSONA;

        const response = await this.genAI.models.generateContent({
            model,
            contents,
            systemInstruction: { parts: [{ text: instruction }] },
            tools: tools ? [{ function_declarations: tools }] : undefined,
            cachedContent,
            config: { temperature }
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    async generateArtieResponseStream(model: string, contents: any[], temperature: number = 0.7, systemInstruction?: string, tools?: any[], cachedContent?: string) {
        const instruction = systemInstruction || GeminiService.ARTIE_PERSONA;

        return this.genAI.models.generateContentStream({
            model,
            contents,
            systemInstruction: { parts: [{ text: instruction }] },
            tools: tools ? [{ function_declarations: tools }] : undefined,
            cachedContent,
            config: { temperature }
        });
    }

    async generateManagerSuggestion(stats: any, venue: any): Promise<any> {
        const prompt = `
        TASK: Analyze venue performance and suggest a "Yield Management" action.
        CONTEXT:
        Venue Vibe: ${venue.insiderVibe || venue.description}
        Last 14 Days Activity: ${JSON.stringify(stats)}
        Point Bank Balance: ${venue.pointBank || 5000}
        OUTPUT JSON ONLY: { "type": "YIELD_BOOST", "message": "Schmidt pitch", "actionLabel": "Approve", "pointCost": 500 }`;

        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: GeminiService.SCHMIDT_PERSONA }] },
            config: { response_mime_type: "application/json" }
        });

        let text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) return null;
        text = text.replace(/```json\n?|```/g, '').trim();
        try { return JSON.parse(text); } catch (e) { return null; }
    }

    // Placeholder for Image Generation until Genkit is installed in Functions
    async generateImage(prompt: string, venueId: string): Promise<string> {
        console.warn("⚠️ generateImage called in Functions but Genkit is not fully configured here yet.");
        throw new Error("Image generation temporarily disabled in Serverless environment.");
    }
}
