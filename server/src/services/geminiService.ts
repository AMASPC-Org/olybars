import { GoogleGenAI } from '@google/genai';
import { ARTIE_SYSTEM_INSTRUCTION } from '../config/agents/artie.js';
import { SCHMIDT_SYSTEM_INSTRUCTION } from '../config/agents/schmidt.js';

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

    // Generic Generation Method (Used by Chat Routes)
    async generateArtieResponse(model: string, contents: any[], temperature: number = 0.7, systemInstruction?: string, tools?: any[], cachedContent?: string) {
        // Default to Artie if no instruction provided, but allow overrides
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

    async generateEventDescription(context: {
        venueName: string;
        venueType: string;
        eventType: string;
        date: string;
        time: string;
        weather?: string;
        holiday?: string;
        deals?: any[];
    }) {
        // Uses a specific mini-prompt for descriptions, keeping Artie's voice
        const prompt = `Generate a high-energy, contextually aware event description for OlyBars.
        VENUE: ${context.venueName} (${context.venueType})
        EVENT: ${context.eventType}
        DATE: ${context.date} @ ${context.time}
        WEATHER: ${context.weather || 'Standard Olympia Vibes'}
        HOLIDAY: ${context.holiday || 'None'}
        ACTIVE DEALS: ${context.deals?.map(d => `${d.title} (${d.time})`).join(', ') || 'None'}

        CONSTRAINTS:
        1. Max 2-3 sentences.
        2. Stay in persona: Artie (Powered by Well 80). Warm, local, witty.  
        3. [STRICT LCB COMPLIANCE]:
           - ANTI-VOLUME: NEVER imply the goal is to consume alcohol rapidly or in large quantities.
           - FORBIDDEN TERMS: "Bottomless", "Chug", "Wasted", "Get Hammered", "All you can drink", "Unlimited", "Endless".
           - THE PIVOT: If constraints or inputs imply these terms, PIVOT the description to focus on 'Flavor', 'Experience', or 'Community' without scolding.
        4. SAFE RIDE: ALWAYS suggest a safe ride (Lyft/Red Cab) if the event is after 5:30 PM.
        5. Tone: OSWALD font energy (League vibes).

        OUTPUT:
        The generated description only.`;

        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { temperature: 0.8 }
        });

        return response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    }

    async analyzeEvent(event: any): Promise<{ confidenceScore: number; issues: string[]; lcbWarning: boolean; suggestions: string[]; summary: string }> {
        // Event Analysis uses Artie as the "Guardian"
        const prompt = `You are Artie, the Event Quality Guardian for OlyBars.
        Analyze this event submission for completeness, excitement ("Vibe"), and LCB Compliance.

        EVENT DATA:
        Title: ${event.title}
        Type: ${event.type}
        Date: ${event.date}
        Time: ${event.time}
        Description: ${event.description || "MISSING"}

        RULES:
        1. COMPLETENESS: Does it have a good title, date, time, and descriptive text?
        2. LCB COMPLIANCE (Traffic Light System):
           - RED LIGHT (Warning=true): Usage of "Bottomless", "All you can drink", "Free shots", "Chug challenge", "Drunk", "Wasted".
           - CITATION DIRECTIVE: If RED LIGHT, explicitly cite "WAC 314-52" as the authority in the summary.
           - GREEN LIGHT: Focuses on music, trivia, food, or community.      
        3. VIBE CHECK: Is it boring? (e.g., just "Music") vs Exciting (e.g., "Live Jazz with The Cats").

        OUTPUT JSON ONLY:
        {
           "confidenceScore": number (0-100),
           "issues": string[] (List specific missing fields or weaknesses),  
           "lcbWarning": boolean (True if it violates anti-volume rules),    
           "suggestions": string[] (2-3 quick actions to improve it),        
           "summary": string (1 sentence critique in Artie Persona)
        }`;

        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { response_mime_type: "application/json" }
        });

        let text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) throw new Error("Artie failed to analyze event.");

        text = text.replace(/```json\n?|```/g, '').trim();

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error on Artie Analysis:", text);
            return {
                confidenceScore: 0,
                issues: ["Failed to parse AI response"],
                lcbWarning: false,
                suggestions: [],
                summary: "Artie is confused. Try again."
            };
        }
    }

    async getTriage(question: string): Promise<string> {
        return "I'm ready to serve, boss.";
    }

    async generateManagerSuggestion(stats: any, venue: any): Promise<any> {
        const prompt = `
        TASK: Analyze venue performance and suggest a "Yield Management" action.

        CONTEXT:
        Venue Vibe: ${venue.insiderVibe || venue.description}
        Amenities: ${venue.amenityDetails?.map((a: any) => a.name).join(', ')}
        Private Spaces: ${venue.privateSpaces?.map((s: any) => `${s.name} (${s.capacity})`).join(', ') || 'None'}
        Last 14 Days Activity: ${JSON.stringify(stats)}
        Point Bank Balance: ${venue.pointBank || 5000}

        STRATEGY:
        1. Identify the consistently slow time/day.
        2. Suggest a "Flash Bounty" or "Vibe Boost".
        3. Allocate a Point Bank spend (usually 500-1000 points).
        4. Pitch it concisely to the owner.

        COMPLIANCE:
        - Must follow WA LCB rules (Safe ride mention, no chugging, points for engagement only).

        OUTPUT JSON ONLY:
        {
           "type": "YIELD_BOOST",
           "message": "Schmidt-style pitch (Direct, business-focused, citing the data)",
           "actionLabel": "Approve Flash Bounty",
           "actionSkill": "update_flash_deal",
           "actionParams": {
              "summary": "Title of deal",
              "details": "Details including safe ride info",
              "duration": "Duration in minutes"
           },
           "pointCost": number,
           "potentialImpact": "HIGH" | "MEDIUM" | "LOW"
        }`;

        // INJECT SCHMIDT SYSTEM INSTRUCTION
        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: GeminiService.SCHMIDT_PERSONA }] },
            config: { response_mime_type: "application/json" }
        });

        let text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) throw new Error("Schmidt failed to generate suggestion.");
        text = text.replace(/```json\n?|```/g, '').trim();

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error on Schmidt Suggestion:", text);
            return null;
        }
    }

    async parseFlyerContent(imageBuffer: Buffer, contextDate: string): Promise<any> {
        const prompt = `You are Schmidt, the Lead Architect of OlyBars.
        TASK: Extract event details from this flyer for system entry.
        
        CONTEXT:
        Current Date Context: ${contextDate} (Use this to resolve relative dates like "Friday" or "Tomorrow").
        
        EXTRACTION RULES:
        1. TITLE: Catchy, clear. Shorten if it's too long.
        2. DATE: Convert to ISO (YYYY-MM-DD). If "tonight", use the system date.
        3. TIME: Convert to 24h format (HH:mm).
        4. TYPE: One of: trivia, music, sports, comedy, happy_hour, other.
        5. DESCRIPTION: 1-2 sentence high-energy pitch.
        
        LCB COMPLIANCE:
        - If the flyer mentions "Free base", "Bottomless", or "Unlimited alcohol", FLAG it but still try to extract other data.
        - PIVOT descriptions to focus on the experience, NOT the volume of alcohol.
        
        {
          "title": "string",
          "date": "YYYY-MM-DD",
          "time": "HH:mm",
          "type": "string",
          "description": "string",
          "lcbViolationDetected": boolean,
          "missingFields": ["date", "time", "type", "title"]
        }
        
        Note: Only include fields in "missingFields" if they are truly ambiguous or missing from the image.
        `;

        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{
                role: 'user',
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: imageBuffer.toString('base64')
                        }
                    }
                ]
            }],
            systemInstruction: { parts: [{ text: GeminiService.SCHMIDT_PERSONA }] },
            config: { response_mime_type: "application/json" }
        });

        let text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) throw new Error("Schmidt failed to read the flyer.");
        text = text.replace(/```json\n?|```/g, '').trim();

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error on Flyer Analysis:", text);
            throw new Error("Failed to parse flyer data.");
        }
    }
}
