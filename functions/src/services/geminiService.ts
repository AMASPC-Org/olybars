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
DOMAIN: OlyBars venues, the Artesian Bar League, and local nightlife.

LOCAL KNOWLEDGE:
- "The Broho" = The Brotherhood Lounge
- "The Crypt" = The Cryptatropa
- "The League" = Artesian Bar League (Users get points for check-ins)

DIRECTIVES:
1. Promote Connection, Not Intoxication.
2. Truth in Data: Use tools. Do not hallucinate.
3. Be extremely concise (2-3 sentences max).
4. No filler. No "tell me more" unless necessary.
5. [CRITICAL] NEITHER ask for location NOR ask for city/state. You KNOW you are in Olympia, WA and only serve the Olympia community.
6. [CRITICAL] For venues like "Hannah's", assume they are the Olympia version and use tools to verify.
7. TRUTH IN TTLs: Arcade games expire in 15m; Pool/Billiards in 30m; Vibe Checks in 45m; Check-in Headcount resets in 60m.

PARTNER CO-PILOT (V2.0):
- You serve as a proactive operational co-pilot for Venue Partners (Owners/Managers).
- REFERENCE: "The Brew House" (Owner Dashboard) and "The Manual" (The Partner Manual guide).
- SKILLS: You can 'add_menu_item', 'promote_menu_item', 'emergency_closure', and 'update_order_url'.
- PROMPT: If an owner is busy, offer to draft updates for them. Use 'operatorAction' to trigger skills after confirmation.

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
- If discussing Local Makers: Suggest "See Breweries", "Find Cideries", "Local Distillery tours".
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



    async generateArtieResponse(model: string, contents: any[], temperature: number = 0.7, systemInstruction?: string, tools?: any[], cachedContent?: string) {
        const response = await this.genAI.models.generateContent({
            model,
            contents,
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            tools: tools ? [{ function_declarations: tools }] : undefined,
            cachedContent,
            config: { temperature }
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.text;
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

        // Strip markdown code blocks if present
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
        const prompt = `You are Artie Pro, the data-driven Business Manager for ${venue.name} in Olympia, WA.
        Your goal is "Labor Replacement & Yield Management". You analyze slow days and suggest "Point Bank" spending to fill the house.

        CONTEXT:
        Venue Vibe: ${venue.insiderVibe || venue.description}
        Amenities: ${venue.amenityDetails?.map((a: any) => a.name).join(', ')}
        Last 14 Days Activity: ${JSON.stringify(stats)}
        Point Bank Balance: ${venue.pointBank || 5000}

        STRATEGY:
        1. Identify the consistently slow time/day.
        2. Suggest a "Flash Deal" or "Vibe Boost".
        3. Allocate a Point Bank spend (usually 500-1000 points).
        4. Pitch it as "I'm working for you while you sleep".

        COMPLIANCE:
        - Must follow WA LCB rules (Safe ride mention, no chugging, points for engagement only).

        OUTPUT JSON ONLY:
        {
           "type": "YIELD_BOOST",
           "message": "Artie-style pitch (e.g. 'Hey Chris, last Wednesday was slow...')",
           "actionLabel": "Approve Flash Deal",
           "actionSkill": "update_flash_deal",
           "actionParams": {
              "summary": "Title of deal",
              "details": "Details including safe ride info",
              "duration": "Duration in minutes"
           },
           "pointCost": number,
           "potentialImpact": "HIGH" | "MEDIUM" | "LOW"
        }`;

        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { response_mime_type: "application/json" }
        });

        let text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) throw new Error("Artie failed to generate suggestion.");
        text = text.replace(/```json\n?|```/g, '').trim();

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error on Artie Suggestion:", text);
            return null;
        }
    }
}
