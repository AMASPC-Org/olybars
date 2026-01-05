/**
 * SocialManager Service
 * 
 * This service handles the "Publish Once, Distribute Everywhere" logic.
 * It integrates with the Meta Graph API to read from and publish to IG/FB.
 */

import { Venue, LeagueEvent } from '../../../src/types';
import { db } from '../firebaseAdmin';

export class SocialManager {
    /**
     * Entry point for the Auto-Sync Cron.
     * Iterates through venues with social sync enabled.
     */
    async syncAllVenues() {
        try {
            const snapshot = await db.collection('venues')
                .where('social_auto_sync', '==', true)
                .get();

            const venues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venue));

            for (const venue of venues) {
                await this.syncVenue(venue);
            }
        } catch (error) {
            console.error('[SOCIAL_MANAGER] Error in syncAllVenues:', error);
        }
    }

    private async syncVenue(venue: Venue) {
        if (!venue.partnerConfig?.metaSync?.instagramBusinessId || !venue.partnerConfig.metaSync.pageToken) {
            return;
        }

        try {
            // 1. Fetch latest posts from Instagram via Meta Graph API
            const rawContent = await this.fetchMetaContent(
                venue.partnerConfig.metaSync.instagramBusinessId,
                venue.partnerConfig.metaSync.pageToken
            );

            if (!rawContent || !rawContent.data) return;

            // 2. Filter for UNSEEN content would happen here (using lastSyncTimestamp)
            const lastSync = venue.partnerConfig.metaSync.lastSync || 0;
            const newPosts = rawContent.data.filter((post: any) => new Date(post.timestamp).getTime() > lastSync);

            for (const post of newPosts) {
                // 3. Draft creation
                // In a full implementation, we'd use Gemini to classify content here.
                // For now, we create a generic draft if it looks like an event.
                const isLikelyEvent = post.caption?.toLowerCase().includes('trivia') ||
                    post.caption?.toLowerCase().includes('karaoke') ||
                    post.caption?.toLowerCase().includes('live music');

                if (isLikelyEvent) {
                    await this.createDraftForApproval(venue.id, post);
                }
            }

            // 4. Update last sync
            await db.collection('venues').doc(venue.id).update({
                'partnerConfig.metaSync.lastSync': Date.now()
            });

        } catch (error) {
            console.error(`[SOCIAL_MANAGER] Error syncing venue ${venue.id}:`, error);
        }
    }

    private async fetchMetaContent(instagramId: string, accessToken: string) {
        const url = `https://graph.facebook.com/v18.0/${instagramId}/media?fields=id,caption,media_type,media_url,timestamp,permalink&access_token=${accessToken}&limit=5`;
        const response = await fetch(url);
        return await response.json();
    }

    private async createDraftForApproval(venueId: string, post: any) {
        // Create an event draft in a dedicated collection or field
        // This allows owners to "Approve" a sync in the dashboard.
        const draftEvent = {
            venueId,
            title: 'Instagram Sync: ' + (post.caption ? post.caption.substring(0, 30) + '...' : 'New Post'),
            description: post.caption,
            sourceUrl: post.permalink,
            imageUrl: post.media_url,
            status: 'pending-approval',
            createdAt: Date.now(),
            metaPostId: post.id
        };

        await db.collection('event_drafts').add(draftEvent);
    }

    /**
     * Multi-Platform Pusher
     * When a venue manually adds an event in the dashboard, push it back to social.
     */
    async publishToSocial(venueId: string, activity: LeagueEvent) {
        // Implementation for posting back to IG/FB would go here
        console.log(`[SOCIAL_MANAGER] Placeholder: Publishing ${activity.title} for venue ${venueId}`);
    }
}
