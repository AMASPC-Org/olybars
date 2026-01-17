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
// --- ARTIE AI GATEWAY (v2 HTTPS) ---
import { onRequest } from 'firebase-functions/v2/https';
import cors from 'cors';
import { validateFirebaseIdToken } from './middleware/auth';

const corsHandler = cors({ origin: [/olybars\.com$/, /firebaseapp\.com$/, /localhost/] });

export const artieChat = onRequest({ secrets: ["GOOGLE_API_KEY"] }, async (req, res) => {
    corsHandler(req, res, async () => {
        // 1. Validate Honeypot (Cheap filter)
        if (req.body._hp_id && req.body._hp_id.length > 0) {
            logger.warn(`[Security] Honeypot triggered by ${req.ip}`);
            res.status(200).json({ data: "Message received" }); // Silent rejection
            return;
        }

        // 2. Validate Auth (Expensive verification)
        await validateFirebaseIdToken(req, res, async () => {
            try {
                const user = (req as any).user;
                const secureContext = {
                    ...req.body,
                    userId: user.uid,
                    userRole: user.role || 'guest'
                };

                // ArtieChatLogic assumes Genkit flow structure, keep calling it as function
                const result = await artieChatLogic(secureContext);

                // If result is streamable, handle it (Genkit might need stream logic, 
                // but standard flow returns value. We'll send JSON for now to ensure stable migration)
                res.status(200).json({ data: result });
            } catch (e: any) {
                console.error("ArtieChat Error:", e);
                res.status(500).json({ error: `Connection issue: ${e.message}` });
            }
        });
    });
});


// --- OBSERVABILITY ---
export * from './flows/logClientError';

export const extractBrandDna = extractBrandDnaFlow;
export const generateSocialFlyer = generateSocialFlyerFlow;
export const claimVenue = claimVenueFlow;

// --- DATABASE TRIGGERS ---
export const syncUserProfile = onDocumentWritten("users/{userId}", async (event) => {
    const userId = event.params.userId;
    const newUser = event.data?.after.data();
    const oldUser = event.data?.before.data();

    if (!event.data?.after.exists) {
        logger.info(`[Privacy] Deleting public profile for ${userId}`);
        await db.collection("public_profiles").doc(userId).delete();
        return;
    }

    if (!newUser) return;

    // 1. Sync Custom Claims (Role/Admin)
    // Only update if role or isAdmin has changed to save Auth API calls
    const roleChanged = newUser.role !== oldUser?.role;
    const adminChanged = newUser.isAdmin !== oldUser?.isAdmin;

    if (roleChanged || adminChanged) {
        try {
            await admin.auth().setCustomUserClaims(userId, {
                role: newUser.role || 'user',
                isAdmin: !!newUser.isAdmin
            });
            logger.info(`[Auth] Synced custom claims for ${userId}`, { role: newUser.role });
        } catch (error) {
            logger.error(`[Auth] Failed to sync custom claims for ${userId}`, error);
        }
    }

    // 2. Sync Public Profile
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
// --- SCHEDULED TASKS ---
export { scheduledLeaderboardSnapshot } from './triggers/scheduledLeaderboard';

// --- SCOUT AUTOMATION ---
export { scoutDispatcher, scoutWorker } from './scout/index';
