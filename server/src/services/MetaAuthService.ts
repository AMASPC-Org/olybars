import { config } from '../appConfig/config.js';
import { db } from '../firebaseAdmin.js';

export const MetaAuthService = {
    /**
     * Exchanges a short-lived OAuth code for long-lived tokens and business IDs.
     */
    async exchangeCode(code: string, venueId: string) {
        try {
            // 1. Exchange code for short-lived user access token
            const userTokenResponse = await fetch(
                `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${config.META_APP_ID}&redirect_uri=${config.META_REDIRECT_URI}&client_secret=${config.META_APP_SECRET}&code=${code}`
            );
            const userData = await userTokenResponse.json();

            if (userData.error) {
                console.error('[META_AUTH_ERROR] User Token Exchange Failed:', userData.error);
                throw new Error(userData.error.message);
            }

            const shortLivedToken = userData.access_token;

            // 2. Exchange for long-lived user access token
            const longLivedTokenResponse = await fetch(
                `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.META_APP_ID}&client_secret=${config.META_APP_SECRET}&fb_exchange_token=${shortLivedToken}`
            );
            const longLivedData = await longLivedTokenResponse.json();
            const longLivedUserToken = longLivedData.access_token;

            // 3. Get User's Pages to find the one linked to Instagram
            const pagesResponse = await fetch(
                `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedUserToken}`
            );
            const pagesData = await pagesResponse.json();

            if (!pagesData.data || pagesData.data.length === 0) {
                throw new Error('No Facebook Pages found for this user.');
            }

            // For now, we take the first page or look for one with an IG account
            let selectedPage = pagesData.data[0];
            let instagramBusinessId = null;

            for (const page of pagesData.data) {
                const igResponse = await fetch(
                    `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
                );
                const igData = await igResponse.json();
                if (igData.instagram_business_account) {
                    selectedPage = page;
                    instagramBusinessId = igData.instagram_business_account.id;
                    break;
                }
            }

            if (!instagramBusinessId) {
                throw new Error('No Instagram Business account linked to your Facebook Pages.');
            }

            // 4. Encrypt and Store in Firestore
            // Note: In a real prod app, we'd use a real encryption service.
            // For OlyBars, we'll store it in the venue's partnerConfig.
            const metaSync = {
                facebookPageId: selectedPage.id,
                instagramBusinessId: instagramBusinessId,
                accessToken: selectedPage.access_token, // This is the Page Access Token (doesn't expire if user token is long-lived)
                lastSyncTimestamp: Date.now(),
                autoPublishEnabled: true
            };

            await db.collection('venues').doc(venueId).update({
                'partnerConfig.metaSync': metaSync
            });

            // 5. Initial Verification Fetch
            const initialFetch = await this.getRecentPosts(instagramBusinessId, selectedPage.access_token);

            return {
                success: true,
                pageName: selectedPage.name,
                instagramBusinessId,
                initialPosts: initialFetch?.data?.length || 0
            };

        } catch (error: any) {
            console.error('[META_AUTH_ERROR]', error);
            throw error;
        }
    },

    async getRecentPosts(instagramId: string, accessToken: string) {
        try {
            const url = `https://graph.facebook.com/v18.0/${instagramId}/media?fields=id,caption,media_type,media_url,timestamp,permalink&access_token=${accessToken}&limit=3`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('[META_FETCH_ERROR]', error);
            return null;
        }
    }
};
