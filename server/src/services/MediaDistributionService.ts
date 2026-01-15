import { db } from '../firebaseAdmin.js';
import { LeagueEvent, Venue, PartnerTier, TIER_CONFIG } from '../../../src/types/venue.js';

/**
 * Media Distribution Service
 * 
 * Syndicates League Events to local media contacts (ODA, The JOLT, ThurstonTalk).
 * Part of the "Submit Once, Distribute Everywhere" engine.
 */
export class MediaDistributionService {
    private static MEDIA_CONTACT_LIST = [
        'events@downtownolympia.org',
        'calendar@thejoltnews.com',
        'info@thurstontalk.com'
    ];

    /**
     * Dispatch an event to local media if eligible.
     */
    static async dispatchEvent(venueId: string, event: LeagueEvent) {
        try {
            const venueDoc = await db.collection('venues').doc(venueId).get();
            if (!venueDoc.exists) return;

            const venue = venueDoc.data() as Venue;
            const tier = venue.partner_tier || PartnerTier.LOCAL;
            const config = TIER_CONFIG[tier];

            // 1. Eligibility Check
            if (!config.hasMediaDistribution) {
                console.log(`[MediaDistribution] Venue ${venue.name} tier (${tier}) not eligible for PR Distribution.`);
                return;
            }

            if (event.distributeToMedia === false) {
                console.log(`[MediaDistribution] Distribution disabled for event: ${event.title}`);
                return;
            }

            // 2. Lead Time Check (Rule: >48h lead time)
            const leadTimeMs = event.startTime - Date.now();
            const fortyEightHoursMs = 48 * 60 * 60 * 1000;

            if (leadTimeMs < fortyEightHoursMs) {
                console.warn(`[MediaDistribution] Event ${event.title} has insufficient lead time (<48h). Skipping distribution.`);
                return;
            }

            // 3. Draft Press Release (LLM Wrapper Placeholder)
            const emailBody = await this.generatePressRelease(venue, event);

            // 4. Send Emails
            for (const email of this.MEDIA_CONTACT_LIST) {
                await this.sendEmail(email, `Event Submission: ${event.title} at ${venue.name}`, emailBody);
            }

            console.log(`[MediaDistribution] Successfully syndicated ${event.title} to ${this.MEDIA_CONTACT_LIST.length} contacts.`);

        } catch (error) {
            console.error('[MediaDistribution] Error dispatching event:', error);
        }
    }

    /**
     * Uses Artie (or structured logic) to build the PR body.
     */
    private static async generatePressRelease(venue: Venue, event: LeagueEvent): Promise<string> {
        const dateStr = new Date(event.startTime).toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles',
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });

        // In production, we'd pass this to Gemini for high-quality copy
        return `
FOR IMMEDIATE RELEASE

EVENT: ${event.title.toUpperCase()}
WHERE: ${venue.name}
ADDRESS: ${venue.address || 'Olympia, WA'}
WHEN: ${dateStr}

DETAILS:
${event.description || 'Join us for a special event at ' + venue.name + '.'}

Find more local events at OlyBars.com.
        `.trim();
    }

    /**
     * Mock Email Dispatch (SendGrid Integration Point)
     */
    private static async sendEmail(to: string, subject: string, body: string) {
        console.log(`\n📧 --- OUTGOING PR EMAIL ---`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body:\n${body}`);
        console.log(`----------------------------\n`);

        // Real Implementation:
        // await sgMail.send({ to, from: 'artie@olybars.com', subject, text: body });
    }
}
