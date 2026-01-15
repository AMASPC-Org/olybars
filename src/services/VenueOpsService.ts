import { db } from '../lib/firebase';
import {
    doc,
    updateDoc,
    setDoc,
    serverTimestamp,
    collection,
    collectionGroup,
    query,
    where,
    getDocs,
    increment,
    writeBatch
} from 'firebase/firestore';
import { differenceInHours } from 'date-fns';
import { Venue, FlashBounty, ScheduledDeal, TIER_CONFIG, PartnerTier } from '../types';
import { getAuthHeaders } from './apiUtils';
import { API_ENDPOINTS } from '../lib/api-config';

export class VenueOpsService {
    /**
     * [SECURITY] Zero-Trust Private Data Fetch
     */
    static async getPrivateData(venueId: string) {
        const headers = await getAuthHeaders();
        const response = await fetch(API_ENDPOINTS.VENUES.PRIVATE(venueId), { headers });
        if (!response.ok) throw new Error('Failed to fetch private data');
        return response.json();
    }

    /**
     * [SECURITY] Zero-Trust Private Data Update
     */
    static async updatePrivateData(venueId: string, updates: any) {
        const headers = await getAuthHeaders();
        const response = await fetch(API_ENDPOINTS.VENUES.PRIVATE(venueId), {
            method: 'PATCH',
            headers,
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update private data');
        return response.json();
    }

    /**
     * Update an active flash bounty for a venue.
     */
    static async updateFlashBounty(venueId: string, bounty: Partial<FlashBounty> & { duration?: string | number }) {
        if (!venueId) throw new Error("Venue ID is required for flash bounty update.");

        try {
            const venueRef = doc(db, 'venues', venueId);
            const now = Date.now();
            let durationMinutes = 60; // Default

            if (bounty.duration) {
                if (typeof bounty.duration === 'number') {
                    durationMinutes = bounty.duration;
                } else {
                    // Simple parse: "45 minutes", "1 hour", "30m"
                    const match = bounty.duration.match(/(\d+)/);
                    if (match) {
                        const val = parseInt(match[1]);
                        if (bounty.duration.toLowerCase().includes('hour')) {
                            durationMinutes = val * 60;
                        } else {
                            durationMinutes = val;
                        }
                    }
                }
            }

            const startTime = now;
            const endTime = now + (durationMinutes * 60 * 1000);

            const bountyPayload = {
                title: bounty.title || '',
                description: bounty.description || '',
                price: bounty.price || "",
                startTime: now,
                endTime: endTime,
                isActive: true,
                updatedAt: serverTimestamp(),
                lastUpdatedBy: 'Artie'
            };

            await updateDoc(venueRef, {
                'activeFlashBounty': bountyPayload,
                'flashBountyUpdatedAt': serverTimestamp(),
                // Sync flat fields for Buzz Screen display
                'deal': bountyPayload.title,
                'dealEndsIn': durationMinutes
            });

            return { success: true, bounty: bountyPayload };
        } catch (error: any) {
            console.error('Error updating flash bounty:', error);
            throw new Error(`Failed to update flash bounty: ${error.message}`);
        }
    }

    /**
     * Check how many deals are already booked in a given window.
     * Max 3 allowed city-wide.
     */
    static async getSlotAvailability(startTime: number, durationMinutes: number): Promise<'OPEN' | 'BUSY' | 'FULL'> {
        const endTime = startTime + (durationMinutes * 60000);
        const q = query(
            collectionGroup(db, 'scheduledDeals'),
            where('status', 'in', ['ACTIVE', 'PENDING']),
            where('startTime', '<', endTime),
            where('endTime', '>', startTime)
        );

        const snapshot = await getDocs(q);
        const count = snapshot.size;

        if (count === 0) return 'OPEN';
        if (count < 3) return 'BUSY';
        return 'FULL';
    }

    /**
     * Validate if a venue can book a specific slot.
     */
    static async validateSlot(venue: Venue, startTime: number, duration: number): Promise<{
        valid: boolean;
        reason?: string;
        trafficStatus?: 'OPEN' | 'BUSY' | 'FULL'
    }> {
        const now = Date.now();

        // 1. STAFF BUFFER (The 180-Minute Rule)
        if (differenceInHours(startTime, now) < 3) {
            return { valid: false, reason: "Too soon. Staff needs at least 180 minutes (3 hours) notice." };
        }

        // 2. DURATION LIMIT
        if (duration > 180) {
            return { valid: false, reason: "Max duration for a Flash Bounty is 3 hours." };
        }

        // 3. TOKEN CHECK
        const tier = venue.partnerConfig?.tier || PartnerTier.LOCAL;
        const config = TIER_CONFIG[tier];
        const limit = config.flashBountyLimit;
        const used = venue.partnerConfig?.flashBountiesUsed || 0;

        if (used >= limit) {
            return {
                valid: false,
                reason: `Monthly limit reached (${used}/${limit}). Upgrade your tier for more slots.`
            };
        }

        // 4. TRAFFIC CHECK
        const trafficStatus = await this.getSlotAvailability(startTime, duration);
        if (trafficStatus === 'FULL') {
            return {
                valid: false,
                reason: "This time slot is fully booked (3/3 active). Please choose another block.",
                trafficStatus
            };
        }

        return { valid: true, trafficStatus };
    }

    /**
     * Schedule a future flash bounty.
     */
    static async scheduleFlashBounty(venueId: string, bounty: ScheduledDeal) {
        if (!venueId) throw new Error("Venue ID is required.");

        const batch = writeBatch(db);

        // 1. Create the Scheduled Bounty in the sub-collection
        const venueRef = doc(db, 'venues', venueId);
        const bountyRef = doc(collection(venueRef, 'scheduledDeals'));

        batch.set(bountyRef, {
            ...bounty,
            venueId,
            status: 'PENDING',
            createdAt: serverTimestamp()
        });

        // 2. Deduct Token (Increment Usage)
        batch.update(venueRef, {
            'partnerConfig.flashBountiesUsed': increment(1)
        });

        await batch.commit();
        return { success: true, id: bountyRef.id };
    }

    static async updateHours(venueId: string, hours: string) {
        if (!venueId) throw new Error("Venue ID is required for hours update.");

        try {
            const venueRef = doc(db, 'venues', venueId);
            await updateDoc(venueRef, {
                'hours': hours,
                'hoursUpdatedAt': serverTimestamp()
            });
            return { success: true };
        } catch (error: any) {
            console.error('Error updating hours:', error);
            throw new Error(`Failed to update hours: ${error.message}`);
        }
    }

    static async updateHappyHour(venueId: string, hh: { schedule: string, specials: string }) {
        if (!venueId) throw new Error("Venue ID is required for happy hour update.");

        try {
            const venueRef = doc(db, 'venues', venueId);
            await updateDoc(venueRef, {
                'happyHourSimple': hh.schedule,
                'happyHourSpecials': hh.specials,
                'happyHourUpdatedAt': serverTimestamp()
            });
            return { success: true };
        } catch (error: any) {
            console.error('Error updating happy hour:', error);
            throw new Error(`Failed to update happy hour: ${error.message}`);
        }
    }

    static async addEvent(venueId: string, event: { type: string, time: string, description?: string }) {
        if (!venueId) throw new Error("Venue ID is required for adding an event.");

        try {
            const venueRef = doc(db, 'venues', venueId);
            await updateDoc(venueRef, {
                'leagueEvent': event.type,
                'triviaTime': event.time,
                'eventDescription': event.description || "",
                'eventUpdatedAt': serverTimestamp()
            });
            return { success: true };
        } catch (error: any) {
            console.error('Error adding event:', error);
            throw new Error(`Failed to add event: ${error.message}`);
        }
    }

    static async updateProfile(venueId: string, profile: { website?: string; instagram?: string; facebook?: string; description?: string }) {
        if (!venueId) throw new Error("Venue ID is required for profile update.");

        try {
            const venueRef = doc(db, 'venues', venueId);
            const updates: any = {
                'profileUpdatedAt': serverTimestamp()
            };

            if (profile.website) updates.website = profile.website;
            if (profile.instagram) updates.instagram = profile.instagram;
            if (profile.facebook) updates.facebook = profile.facebook;
            if (profile.description) updates.description = profile.description;

            await updateDoc(venueRef, updates);
            return { success: true };
        } catch (error: any) {
            console.error('Error updating profile:', error);
            throw new Error(`Failed to update profile: ${error.message}`);
        }
    }

    static async saveDraft(venueId: string, draft: { topic: string; copy: string; type: string }) {
        if (!venueId) throw new Error("Venue ID is required for saving draft.");

        try {
            const venueRef = doc(db, 'venues', venueId);
            // In a real system, we might have a nested collection. For now, we'll push to a 'drafts' array or similar.
            // But to keep it simple and per the plan, we'll just log success as if it's stored.
            // Actually, let's at least store the last draft.
            await updateDoc(venueRef, {
                'lastArtieDraft': {
                    ...draft,
                    timestamp: Date.now()
                }
            });
            return { success: true };
        } catch (error: any) {
            console.error('Error saving draft:', error);
            throw new Error(`Failed to save draft: ${error.message}`);
        }
    }
    /**
     * Generic update for venue details (whitelisted fields only on backend).
     */
    static async updateVenue(venueId: string, updates: Partial<Venue>, userId?: string) {
        if (!venueId) throw new Error("Venue ID is required.");

        try {
            const venueRef = doc(db, 'venues', venueId);
            // We append local metadata if needed, but primarily just send updates
            // Backend rules will enforce whitelist
            await updateDoc(venueRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error: any) {
            console.error('Error updating venue:', error);
            throw new Error(`Failed to update venue: ${error.message}`);
        }
    }

    /**
     * Skill: add_menu_item
     */
    static async addMenuItem(venueId: string, item: { category: string, name: string, description: string, price?: string }) {
        if (!venueId) throw new Error("Venue ID is required.");

        try {
            const venueRef = doc(db, 'venues', venueId);
            const itemRef = doc(collection(venueRef, 'menuItems'));
            await setDoc(itemRef, {
                ...item,
                createdAt: serverTimestamp(),
                status: 'active'
            });
            // We also update the timestamp on the main venue doc
            await updateDoc(venueRef, { menuUpdatedAt: serverTimestamp() });
            return { success: true };
        } catch (error: any) {
            console.error('Error adding menu item:', error);
            throw new Error(`Failed to add menu item: ${error.message}`);
        }
    }

    /**
     * Skill: emergency_closure
     */
    static async emergencyClosure(venueId: string, closure: { reason: string, duration: string }) {
        if (!venueId) throw new Error("Venue ID is required.");

        try {
            const venueRef = doc(db, 'venues', venueId);
            await updateDoc(venueRef, {
                'status': 'CLOSED',
                'closureReason': closure.reason,
                'closureDuration': closure.duration,
                'closureUpdatedAt': serverTimestamp(),
                // CLEAR Buzz Signals for the duration
                'activeFlashBounty': null,
                'deal': null,
                'dealEndsIn': 0,
                'leagueEvent': 'Closed',
                'vibe': 'Dead', // Real-time reflection
                'headcount': 0
            });
            return { success: true };
        } catch (error: any) {
            console.error('Error enforcing emergency closure:', error);
            throw new Error(`Failed to close venue: ${error.message}`);
        }
    }

    /**
     * Skill: update_order_url
     */
    static async updateOrderUrl(venueId: string, url: string) {
        if (!venueId) throw new Error("Venue ID is required.");

        try {
            const venueRef = doc(db, 'venues', venueId);
            await updateDoc(venueRef, {
                'orderUrl': url,
                'directMenuUrl': url,
                'profileUpdatedAt': serverTimestamp()
            });
            return { success: true };
        } catch (error: any) {
            console.error('Error updating order URL:', error);
            throw new Error(`Failed to update order URL: ${error.message}`);
        }
    }

    /**
     * Skill: draft_email
     */
    static async draftEmail(venueId: string, email: { subject: string, body: string }) {
        return this.saveDraft(venueId, {
            topic: email.subject,
            copy: email.body,
            type: 'EMAIL_DRAFT'
        });
    }

    /**
     * Skill: add_to_calendar
     */
    static async addToCalendar(venueId: string, entry: { summary: string }) {
        return this.saveDraft(venueId, {
            topic: 'Calendar Entry',
            copy: entry.summary,
            type: 'CALENDAR_POST'
        });
    }

    /**
     * Skill: update_website
     */
    static async updateWebsite(venueId: string, update: { content: string }) {
        return this.saveDraft(venueId, {
            topic: 'Website Content Update',
            copy: update.content,
            type: 'WEBSITE_CONTENT'
        });
    }

    /**
     * Skill: generate_image
     */
    static async generateImage(venueId: string, image: { prompt: string }) {
        // In a real implementation, this might trigger a cloud function for DALL-E/Midjourney/Gemini Image Gen
        // For now, we save it as a pending asset
        return this.saveDraft(venueId, {
            topic: 'Generated Image Prompt',
            copy: image.prompt,
            type: 'IMAGE_PROMPT'
        });
    }

    /**
     * Skill: add_calendar_event
     */
    static async submitCalendarEvent(venueId: string, eventData: any) {
        if (!venueId) throw new Error("Venue ID is required.");

        try {
            const { EventService } = await import('./eventService');
            // Basic transformation to AppEvent structure
            // In a real app, this would use an LLM or robust parser
            const payload = {
                venueId,
                venueName: eventData.venueName || '', // Use provided name or let backend resolve
                title: eventData.title || 'New Event',
                type: eventData.type || 'other',
                date: eventData.date || new Date().toISOString().split('T')[0],
                time: eventData.time || '20:00',
                description: eventData.description || 'Added via Artie'
            };

            const result = await EventService.submitEvent(payload as any);
            return result;
        } catch (error: any) {
            console.error('Error submitting calendar event:', error);
            throw new Error(`Failed to submit event: ${error.message}`);
        }
    }
    /**
     * Skill: analyze_flyer (Vision API)
     */
    static async analyzeFlyer(venueId: string, base64Image: string, contextDate: string) {
        if (!venueId) throw new Error("Venue ID is required.");

        const headers = await getAuthHeaders();
        const response = await fetch(API_ENDPOINTS.VISION.ANALYZE_FLYER, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ base64Image, contextDate })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Schmidt failed to analyze the flyer.');
        }

        return response.json();
    }
}
