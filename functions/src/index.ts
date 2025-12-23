import { onRequest } from 'firebase-functions/v2/https';
import { onCall } from 'firebase-functions/v2/https';
import { artieChatLogic } from './flows/artieChat';

// --- ARTIE AI GATEWAY ---
// This is the clean 'Infrastructure Trigger'. It wraps the pure logic flow.
// This prevents circular dependencies because the flow doesn't know about this file.
export const artieChat = onCall({ cors: true, secrets: ["GOOGLE_API_KEY"] }, async (req) => {
    try {
        // Pass the data straight to the Genkit flow
        const result = await artieChatLogic(req.data);
        return result;
    } catch (e: any) {
        console.error("ArtieChat Wrapper Error:", e);
        throw new Error(`Connection issue: ${e.message}`);
    }
});

// --- LEGACY HTTP FUNCTIONS ---
export const verifyOwnerPin = onRequest({ cors: true }, async (req, res) => {
    const { pin } = req.body;
    if (!pin) {
        res.status(400).send('Bad Request: "pin" is required.');
        return;
    }
    const ownerPin = process.env.OWNER_PIN;
    if (!ownerPin) {
        console.error('OWNER_PIN is not set.');
        res.status(500).send('Internal Server Error: Owner PIN not configured.');
        return;
    }
    if (pin === ownerPin) {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});
