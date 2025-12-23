import { onRequest } from 'firebase-functions/v2/https';

// Export Genkit flows (wrapped in onCall as Firebase Functions)
export { artieChat } from './flows/artieChat';

// Legacy HTTP Function
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
