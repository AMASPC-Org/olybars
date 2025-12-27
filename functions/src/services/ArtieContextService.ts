import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

if (getApps().length === 0) {
    initializeApp();
}

const db = getFirestore();

export class ArtieContextService {
    /**
     * Fetches "The Pulse" - a real-time snapshot of the platform's state.
     */
    static async getPulse() {
        try {
            // 1. Get Top 3 Buzzing Venues (In-memory filter to avoid composite index)
            const venuesSnapshot = await db.collection('venues')
                .where('isActive', '==', true)
                .get();

            const buzzing = venuesSnapshot.docs
                .map(doc => doc.data())
                .filter(v => v.status === 'lively' || v.status === 'buzzing')
                .slice(0, 3)
                .map(v => v.name);

            // 2. Get Global Platform Settings/Messages
            const settingsDoc = await db.collection('settings').doc('platform').get();
            const settings = settingsDoc.exists ? settingsDoc.data() : {};

            // 3. Get Active Flash Deals (Details)
            const dealsSnapshot = await db.collection('flashDeals')
                .where('active', '==', true)
                .get();

            const deals = dealsSnapshot.docs
                .map(doc => doc.data())
                .filter(d => d.endTime > Date.now())
                .map(data => {
                    return `${data.title} at ${data.venueId}`; // In a real app, join with venue name
                });

            // 4. Get Upcoming Events (Next 24h)
            // Note: Since we store events on the venue, we reuse venuesSnapshot
            const events = venuesSnapshot.docs
                .map(doc => doc.data())
                .filter(v => v.leagueEvent && v.leagueEvent !== 'none')
                .map(v => `${v.leagueEvent.toUpperCase()} at ${v.name} (${v.triviaTime || 'See wire'})`);

            return {
                timestamp: new Date().toISOString(),
                buzzingVenues: buzzing,
                platformMessage: settings?.motd || "The Artesian water is crisp and the vibes are high.",
                activeDealsCount: dealsSnapshot.size,
                activeDeals: deals,
                upcomingEvents: events,
                leagueStatus: settings?.leagueStatus || "Open"
            };
        } catch (error) {
            console.error("ArtieContextService: Failed to fetch pulse", error);
            return null;
        }
    }

    /**
     * Generates a string summary of the pulse for injection into prompts.
     */
    static async getPulsePromptSnippet() {
        const pulse = await this.getPulse();
        if (!pulse) return "";

        return `
[REAL-TIME SITE CONTEXT]
Timestamp: ${pulse.timestamp}
Buzzing Venues: ${pulse.buzzingVenues.length > 0 ? pulse.buzzingVenues.join(', ') : 'All quiet on the waterfront.'}
Flash Deals Active: ${pulse.activeDealsCount} ${pulse.activeDeals.length > 0 ? `(${pulse.activeDeals.join('; ')})` : ''}
Upcoming Events: ${pulse.upcomingEvents.length > 0 ? pulse.upcomingEvents.join(', ') : 'No sanctioned events on the wire.'}
Status: ${pulse.platformMessage}
League Standing: ${pulse.leagueStatus}
`;
    }
}
