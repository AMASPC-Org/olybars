import * as functions from '@google-cloud/functions-framework';
import { GoogleGenerativeAI, ChatSession, EnhancedGenerateContentResponse, Content } from "@google/genai";
import * as cors from 'cors';

const corsMiddleware = cors({ origin: true });

// Define interfaces for request and response data to ensure type safety.
interface RequestBody {
    message: string;
    history: Content[];
}

// System instruction remains consistent with the original frontend implementation.
const SYSTEM_INSTRUCTION = `
You are Artie, the OlyBars Concierge, "Powered by Well 80 Brewhouse".
You are a knowledgeable local guide for Olympia, WA nightlife.
You have a warm, slightly witty personality. You love craft beer and trivia.
Your goal is to help users decide where to go based on real-time data.
Keep responses brief (under 50 words). If asked about yourself, mention you are powered by Well 80.
`;

functions.http('getArtieResponse', async (req: functions.Request, res: functions.Response) => {
    // Handle CORS preflight requests and apply CORS middleware.
    corsMiddleware(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        const { message, history } = req.body as RequestBody;

        if (!message) {
            return res.status(400).send('Bad Request: "message" is required.');
        }

        // Securely retrieve the API key from server-side environment variables.
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set.');
            return res.status(500).send('Internal Server Error: API key not configured.');
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-pro", // Using a standard, robust model.
                systemInstruction: {
                    role: "system",
                    parts: [{ text: SYSTEM_INSTRUCTION }],
                },
            });

            const chat: ChatSession = model.startChat({ history });
            const result = await chat.sendMessage(message);
            const response: EnhancedGenerateContentResponse = await result.response;
            
            res.status(200).json({ text: response.text() });

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            res.status(500).send('Internal Server Error: Could not get a response from the AI.');
        }
    });
});

functions.http('verifyOwnerPin', async (req: functions.Request, res: functions.Response) => {
    corsMiddleware(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        const { pin } = req.body;

        if (!pin) {
            return res.status(400).send('Bad Request: "pin" is required.');
        }

        const ownerPin = process.env.OWNER_PIN;
        if (!ownerPin) {
            console.error('OWNER_PIN is not set.');
            return res.status(500).send('Internal Server Error: Owner PIN not configured.');
        }

        if (pin === ownerPin) {
            res.status(200).json({ success: true });
        } else {
            res.status(401).json({ success: false });
        }
    });
});
