import { onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { artieChatLogic } from './flows/artieChat';
import { extractBrandDnaFlow } from './flows/extractBrandDna';
import { generateSocialFlyerFlow } from './flows/generateSocialFlyer';
import { claimVenueFlow } from './flows/claimVenue';
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize admin if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();

// Set Global Options (Region)
setGlobalOptions({ region: 'us-west1' });

// --- UTILS ---
function fuzzStatus(status: string | undefined): string {
    if (!status) return "Offline";
    // V1 Logic: If they have a status, just show they are active.
    return "Active on OlyBars";
}

// --- ARTIE AI GATEWAY ---
export const artieChat = onCall({ cors: true, secrets: ["GOOGLE_API_KEY"] }, async (req) => {
    try {
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

// --- DATABASE TRIGGERS ---
export const syncUserProfile = onDocumentWritten("users/{userId}", async (event) => {
    const userId = event.params.userId;
    const newUser = event.data?.after.data();

    if (!event.data?.after.exists) {
        logger.info(`[Privacy] Deleting public profile for ${userId}`);
        await db.collection("public_profiles").doc(userId).delete();
        return;
    }

    if (!newUser) return;

    const publicProfile = {
        handle: newUser.handle || "Anonymous",
        avatarUrl: newUser.avatarUrl || "",
        league_stats: newUser.league_stats || { points: 0, rank: "Unranked" },
        current_status: fuzzStatus(newUser.current_status),
        isLeagueHQ: newUser.isLeagueHQ || false,
        lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("public_profiles").doc(userId).set(publicProfile, { merge: true });
    logger.info(`[Privacy] Synced safe profile for ${userId}`);
});

// --- SCHEDULED TASKS ---
export { scheduledLeaderboardSnapshot } from './triggers/scheduledLeaderboard';
