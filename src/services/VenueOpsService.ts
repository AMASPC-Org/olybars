import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp, deleteField } from 'firebase/firestore';

export interface FlashDeal {
    id: string;
    title: string;
    description: string;
    price: string;
    startTime: number;
    endTime: number;
    isActive: boolean;
}

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
}
