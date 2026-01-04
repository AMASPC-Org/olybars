import * as admin from 'firebase-admin';

/**
 * Migration Script: Venue Confidentiality (Server-Side)
 * Moves sensitive fields from public venue documents to the private_data/main sub-collection.
 * Uses firebase-admin for full access and reliable execution.
 */
export async function migratePartnerData(db: admin.firestore.Firestore) {
    console.log('--- [ADMIN] STARTING PARTNER DATA MIGRATION ---');
    const venuesRef = db.collection('venues');
    const snapshot = await venuesRef.get();

    let migratedCount = 0;
    const batch = db.batch();

    for (const venueDoc of snapshot.docs) {
        const data = venueDoc.data() as any;
        const venueId = venueDoc.id;

        // 1. Identify sensitive data
        const privateData: any = {};

        if (data.partnerConfig) {
            privateData.partnerConfig = data.partnerConfig;
        }

        if (data.pointBank !== undefined) {
            privateData.pointBank = data.pointBank;
        }

        if (data.pointBankLastReset !== undefined) {
            privateData.pointBankLastReset = data.pointBankLastReset;
        }

        // 2. Extract Margin Tiers from Menu
        if (data.fullMenu && Array.isArray(data.fullMenu)) {
            const menuStrategies: Record<string, string> = {};
            data.fullMenu.forEach((item: any) => {
                if (item.margin_tier) {
                    menuStrategies[item.id] = item.margin_tier;
                }
            });
            if (Object.keys(menuStrategies).length > 0) {
                privateData.menuStrategies = menuStrategies;
            }
        }

        // 3. Write to Private Data
        if (Object.keys(privateData).length > 0) {
            const privateDocRef = db.collection('venues').doc(venueId).collection('private_data').doc('main');
            batch.set(privateDocRef, {
                ...privateData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                migratedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            migratedCount++;
        }
    }

    if (migratedCount > 0) {
        await batch.commit();
    }

    console.log(`--- [ADMIN] MIGRATION COMPLETE: ${migratedCount} VENUES PROCESSED ---`);
    return migratedCount;
}
