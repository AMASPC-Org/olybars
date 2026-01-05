import { Venue, AppEvent } from '../types';
import { TIER_CONFIG, PartnerTier } from '../config/tiers';
import { ArtieLLM } from '../ai/ArtieAgent';
import { sendEmail } from '../utils/mailer';

export class MediaDistributionService {
    /**
     * Executes the Press Agent flow: Check eligibility, generate, and dispatch.
     */
    static async handleEventPublish(venue: Venue, event: AppEvent) {
        // 1. Check Tier Eligibility
        const tier = venue.partnerConfig?.tier || venue.partner_tier || PartnerTier.LOCAL;
        const config = TIER_CONFIG[tier as PartnerTier];

        if (!config || !config.hasMediaDistribution) {
            console.log(`[PressAgent] Venue ${venue.name} tier not eligible for distribution.`);
            return;
        }

        // 2. Lead Time Check (> 48h)
        const eventDate = new Date(`${event.date}T${event.time || '00:00'}`);
        const leadTimeHours = (eventDate.getTime() - Date.now()) / (1000 * 60 * 60);

        if (leadTimeHours < 48) {
            console.warn(`[PressAgent] Insufficient lead time (${Math.round(leadTimeHours)}h) for automated dispatch. 48h required.`);
            return;
        }

        try {
            // 3. Generate PR with Artie
            console.log(`[PressAgent] Drafting release for "${event.title}"...`);
            const pressRelease = await ArtieLLM.generatePressRelease(venue, event);

            // 4. Dispatch to Verified Media List
            const mediaContacts = [
                "submit@thurstontalk.com",
                "publisher@thejoltnews.com",
                "calendar@thejoltnews.com",
                "info@downtownolympia.org"
            ];

            await sendEmail({
                to: mediaContacts,
                subject: `PRESS RELEASE: ${event.title} at ${venue.name}`,
                body: pressRelease,
                fromName: "OlyBars Press Agent"
            });

            console.log(`[PressAgent] Successfully dispatched to ${mediaContacts.length} outlets.`);
            return { success: true };
        } catch (error) {
            console.error('[PressAgent] Distribution failed:', error);
            throw error;
        }
    }
}
