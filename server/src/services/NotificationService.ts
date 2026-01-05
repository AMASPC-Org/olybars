import { db } from '../firebaseAdmin';
import { UserProfile, Venue } from '../../../src/types';
import { PULSE_CONFIG } from '../../../src/config/pulse';

export class NotificationService {
    /**
     * Dispatches a Pulse Alert to users who have starred the venue.
     * Fires only when status transitions to 'packed'.
     */
    static async dispatchPulseAlert(venueId: string, venueName: string) {
        try {
            console.log(`[NotificationService] Dispatching Pulse Alert for ${venueName} (${venueId})`);

            // 1. Find users who have favorited this venue
            const usersSnapshot = await db.collection('users')
                .where('favorites', 'array-contains', venueId)
                .where('sms_opt_in', '==', true)
                .get();

            if (usersSnapshot.empty) {
                console.log(`[NotificationService] No eligible users for ${venueName}`);
                return;
            }

            const now = Date.now();
            const pacificTime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
            const currentHour = new Date(pacificTime).getHours();
            const currentMinute = new Date(pacificTime).getMinutes();
            const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

            for (const userDoc of usersSnapshot.docs) {
                const user = userDoc.data() as UserProfile;

                if (await this.shouldSendNotification(user, venueId, currentTimeStr, now)) {
                    await this.sendSms(user, `OlyBars Intel: ${venueName} is PACKED! The party is peaking. Standing room only! 🍻`);

                    // Update last notified timestamp
                    await userDoc.ref.update({
                        [`last_notified_at.${venueId}`]: now
                    });
                }
            }
        } catch (error) {
            console.error('[NotificationService] Error dispatching pulse alert:', error);
        }
    }

    /**
     * Checks if a notification should be sent based on hierarchy and cooldowns.
     */
    private static async shouldSendNotification(user: UserProfile, venueId: string, currentTimeStr: string, now: number): Promise<boolean> {
        // 1. Global SMS Opt-in (Redundancy check)
        if (!user.sms_opt_in) return false;

        // 2. Master Pulse Alert Toggle
        if (user.notificationSettings?.allow_pulse_alerts === false) return false;

        // 3. Quiet Hours Check (PST)
        const start = user.notificationSettings?.quiet_hours_start || "23:00";
        const end = user.notificationSettings?.quiet_hours_end || "08:00";

        if (this.isWithinQuietHours(currentTimeStr, start, end)) {
            console.log(`[NotificationService] Skipping user ${user.uid} - within quiet hours (${start}-${end})`);
            return false;
        }

        // 4. Cooldown Check (4 Hours per Venue)
        const lastNotified = user.last_notified_at?.[venueId] || 0;
        const fourHoursInMs = 4 * 60 * 60 * 1000;
        if (now - lastNotified < fourHoursInMs) {
            console.log(`[NotificationService] Skipping user ${user.uid} - cooldown active for ${venueId}`);
            return false;
        }

        return true;
    }

    /**
     * Logic to handle cross-midnight quiet hours.
     */
    private static isWithinQuietHours(current: string, start: string, end: string): boolean {
        if (start < end) {
            return current >= start && current <= end;
        } else {
            // e.g., 23:00 to 08:00
            return current >= start || current <= end;
        }
    }

    /**
     * Mock SMS Sender (Integration point for Twilio/SNS)
     */
    private static async sendSms(user: UserProfile, message: string) {
        if (!user.phone) {
            console.warn(`[NotificationService] User ${user.uid} opted in but has no phone number.`);
            return;
        }

        console.log(`\n📱 --- OUTGOING SMS ---`);
        console.log(`To: ${user.phone} (${user.handle || 'User'})`);
        console.log(`Message: ${message}`);
        console.log(`-----------------------\n`);

        // Real implementation would call Twilio here
        // await twilio.messages.create({ body: message, to: user.phone, from: 'OlyBars' });
    }

    /**
     * Dispatch specialized League Intel with "Cheat Code" formatting.
     */
    static async dispatchLeagueIntel(venueId: string, message: string, isCheatCode: boolean) {
        // Implement logic for event-based notifications
        console.log(`[NotificationService] Dispatching League Intel for ${venueId}: ${message} (CheatCode: ${isCheatCode})`);
    }
}
