import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize admin if not already initialized (defensive)
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * FUZZING LOGIC
 * Input: "Checked in at The Brotherhood"
 * Output: "Active in Downtown"
 * Purpose: Prevent real-time stalking while maintaining "Vibe"
 */
function fuzzStatus(status: string | undefined): string {
  if (!status) return "Offline";
  // V1 Logic: If they have a status, just show they are active. 
  // Future: Map venue IDs to Neighborhoods (Downtown, Westside).
  return "Active on OlyBars";
}

export const syncUserProfile = onDocumentWritten("users/{userId}", async (event) => {
  const userId = event.params.userId;
  const newUser = event.data?.after.data();

  // 1. Handle Deletion (If user deletes account, wipe public profile)
  if (!event.data?.after.exists) {
    logger.info(`[Privacy] Deleting public profile for ${userId}`);
    await db.collection("public_profiles").doc(userId).delete();
    return;
  }

  // 2. Handle Create/Update
  if (!newUser) return;

  // 3. Extract ONLY Safe Fields (Allowlist Approach)
  const publicProfile = {
    handle: newUser.handle || "Anonymous",
    avatarUrl: newUser.avatarUrl || "",
    // Default stats if missing
    league_stats: newUser.league_stats || { points: 0, rank: "Unranked" }, 
    // Fuzz the status/location
    current_status: fuzzStatus(newUser.current_status),
    // Marketing Badge
    isLeagueHQ: newUser.isLeagueHQ || false, 
    lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // 4. Write to Public Collection
  await db.collection("public_profiles").doc(userId).set(publicProfile, { merge: true });
  logger.info(`[Privacy] Synced safe profile for ${userId}`);
});
