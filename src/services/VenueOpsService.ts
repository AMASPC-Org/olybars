import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface FlashDeal {
    id: string;
    title: string;
    description: string;
    price: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

export class VenueOpsService {
    /**
     * Update an active flash deal for a venue.
     */
    static async updateFlashDeal(venueId: string, deal: Partial<FlashDeal>) {
        if (!venueId) throw new Error("Venue ID is required for flash deal update.");

        try {
            const venueRef = doc(db, 'venues', venueId);

            const dealPayload = {
                ...deal,
                updatedAt: serverTimestamp(),
                lastUpdatedBy: 'Artie'
            };

            await updateDoc(venueRef, {
                'activeFlashDeal': dealPayload,
                'flashDealUpdatedAt': serverTimestamp()
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
}
