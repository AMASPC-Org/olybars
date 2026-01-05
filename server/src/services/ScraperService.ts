import { db } from '../firebaseAdmin.js';
import { Venue, PartnerTier, LeagueEvent } from '../../../src/types/venue';

/**
 * League Night Event Scraper Service
 * Responsible for background ingestion of events for premium partners.
 */
export class ScraperService {

    /**
     * Main task entry point: Fetches and processes all eligible venues.
     */
    static async runScheduledScrape() {
        console.log('[Scraper] Starting scheduled scrape job...');
        const venues = await this.getEligibleVenues();

        for (const venue of venues) {
            try {
                await this.processVenue(venue);
            } catch (error) {
                console.error(`[Scraper] Failed to process ${venue.name}:`, error);
            }
        }
    }

    /**
     * Get all active venues with PREM_PARTNER status and scraper enabled.
     */
    private static async getEligibleVenues(): Promise<Venue[]> {
        const snapshot = await db.collection('venues')
            .where('partner_tier', '==', PartnerTier.PREM_PARTNER)
            .where('is_scraping_enabled', '==', true)
            .where('isActive', '==', true)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venue));
    }

    /**
     * Orchestrates the 4-step flow for a single venue.
     */
    private static async processVenue(venue: Venue) {
        if (!venue.scrape_source_url) {
            console.warn(`[Scraper] No source URL for ${venue.name}. Skipping.`);
            return;
        }

        // 1. THE SCOUT (Fetcher) - Logic placeholder
        // TODO: Integrate Puppeteer to fetch HTML/Screenshots from venue.scrape_source_url
        const rawContent = `[MOCK_CONTENT] Trivia every Thursday at 7:00 PM at ${venue.name}`;

        // 2. THE BRAIN (LLM) - Logic placeholder
        // TODO: Send to OpenAI/Gemini Vision to parse events from rawContent
        const parsedEvents = [
            {
                title: 'Weekly Trivia',
                description: 'General knowledge trivia and craft beer.',
                type: 'trivia',
                startTime: this.nextDayOfWeek(venue, 'Thursday', 19), // Thursday at 7 PM
                pointsAwarded: 25,
                sourceConfidence: 0.95
            }
        ];

        // 3. THE NORMALIZER & GATEKEEPER
        for (const eventData of parsedEvents) {
            if (eventData.sourceConfidence < 0.8) {
                console.warn(`[Scraper] Low confidence (${eventData.sourceConfidence}) for event: ${eventData.title}. Skipping.`);
                continue;
            }

            await this.saveEvent(venue.id, eventData);
        }

        // Update last scrape timestamp
        await db.collection('venues').doc(venue.id).update({
            last_scrape_timestamp: Date.now()
        });
    }

    /**
     * Saves a parsed event to the LeagueEvents collection.
     */
    private static async saveEvent(venueId: string, data: any) {
        const eventId = `scraped_${venueId}_${data.startTime}`;
        const event: LeagueEvent = {
            id: eventId,
            venueId,
            ...data,
            lastScraped: Date.now()
        };

        // Upsert to prevent duplicates
        await db.collection('league_events').doc(eventId).set(event, { merge: true });
        console.log(`[Scraper] Synced event: ${data.title} for venue ${venueId}`);
    }

    /**
     * Helper to calculate the next occurrence of a day/time.
     */
    private static nextDayOfWeek(venue: Venue, day: string, hour: number): number {
        // Simplified mock logic for timestamp calculation
        const d = new Date();
        d.setHours(hour, 0, 0, 0);
        return d.getTime();
    }
}
