import { GeminiService } from './functions/src/services/geminiService.ts';
import { config } from './functions/src/config';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log("Testing Gemini Service Directly...");
    const key = process.env.GOOGLE_GENAI_API_KEY;
    const service = new GeminiService(key);

    const systemInstruction = `
YOU ARE ARTIE.
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
`;

    const contents = [
        { role: 'user', parts: [{ text: "Tell me about Well 80" }] }
    ];

    try {
        console.log("Calling generateArtieResponse...");
        const result = await service.generateArtieResponse('gemini-2.0-flash', contents, 0.4, systemInstruction);
        console.log("Raw Result:\n", result);
    } catch (e) {
        console.error("Test Failed:", e);
    }
}

test();
