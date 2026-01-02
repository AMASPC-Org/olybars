import { db } from '../lib/firebase';
import {
    doc,
    updateDoc,
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
import { Venue, FlashDeal, ScheduledDeal, TIER_LIMITS, PartnerTier } from '../types';

export class VenueOpsService {
    /**
     * Update an active flash deal for a venue.
     */
    static async updateFlashDeal(venueId: string, deal: Partial<FlashDeal> & { duration?: string | number }) {
        if (!venueId) throw new Error("Venue ID is required for flash deal update.");

        try {
            const venueRef = doc(db, 'venues', venueId);
            const now = Date.now();
            let durationMinutes = 60; // Default

            if (deal.duration) {
                if (typeof deal.duration === 'number') {
                    durationMinutes = deal.duration;
                } else {
                    // Simple parse: "45 minutes", "1 hour", "30m"
                    const match = deal.duration.match(/(\d+)/);
                    if (match) {
                        const val = parseInt(match[1]);
                        if (deal.duration.toLowerCase().includes('hour')) {
                            durationMinutes = val * 60;
                        } else {
                            durationMinutes = val;
                        }
                    }
                }
            }

            const startTime = now;
            const endTime = now + (durationMinutes * 60 * 1000);

            const dealPayload = {
                title: deal.title || '',
                description: deal.description || '',
                price: deal.price || "",
                startTime: now,
                endTime: endTime,
                isActive: true,
                updatedAt: serverTimestamp(),
                lastUpdatedBy: 'Artie'
            };

            await updateDoc(venueRef, {
                'activeFlashDeal': dealPayload,
                'flashDealUpdatedAt': serverTimestamp(),
                // Sync flat fields for Buzz Screen display
                'deal': dealPayload.title,
                'dealEndsIn': durationMinutes
            });

            return { success: true, deal: dealPayload };
        } catch (error: any) {
            console.error('Error updating flash deal:', error);
            throw new Error(`Failed to update flash deal: ${error.message}`);
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
            return { valid: false, reason: "Max duration for a Flash Deal is 3 hours." };
        }

        // 3. TOKEN CHECK
        const tier = venue.partnerConfig?.tier || PartnerTier.FREE;
        const limit = TIER_LIMITS[tier];
        const used = venue.partnerConfig?.flashDealsUsed || 0;

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
     * Schedule a future flash deal.
     */
    static async scheduleFlashDeal(venueId: string, deal: ScheduledDeal) {
        if (!venueId) throw new Error("Venue ID is required.");

        const batch = writeBatch(db);

        // 1. Create the Scheduled Deal in the sub-collection
        const venueRef = doc(db, 'venues', venueId);
        const dealRef = doc(collection(venueRef, 'scheduledDeals'));

        batch.set(dealRef, {
            ...deal,
            venueId,
            status: 'PENDING',
            createdAt: serverTimestamp()
        });

        // 2. Deduct Token (Increment Usage)
        batch.update(venueRef, {
            'partnerConfig.flashDealsUsed': increment(1)
        });

        await batch.commit();
        return { success: true, id: dealRef.id };
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
}
