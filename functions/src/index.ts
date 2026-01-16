import { onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { artieChatLogic } from './flows/artieChat';
import { extractBrandDnaFlow } from './flows/extractBrandDna';
import { generateSocialFlyerFlow } from './flows/generateSocialFlyer';

import { claimVenueFlow } from './flows/claimVenue';

// Set Global Options (Region)
setGlobalOptions({ region: 'us-west1' });

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

export const extractBrandDna = extractBrandDnaFlow;
export const generateSocialFlyer = generateSocialFlyerFlow;
export const claimVenue = claimVenueFlow;
