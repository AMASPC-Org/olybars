import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

// Initialize admin if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

interface SaveOptions {
    venueId: string;
    eventId: string;
    imageBase64: string;
    prompt: string;
    spec: {
        platform: string;
        type: string;
        width: number;
        height: number;
    };
}

/**
 * Handles saving generated images to Cloud Storage and creating index records in Firestore.
 */
export async function saveGeneratedFlyer(opts: SaveOptions) {
    const bucket = admin.storage().bucket();
    const db = admin.firestore();

    // 1. Prepare File Path
    const fileName = `${opts.spec.platform}_${opts.spec.type}_${Date.now()}.png`;
    const filePath = `venues/${opts.venueId}/events/${opts.eventId}/flyers/${fileName}`;
    const file = bucket.file(filePath);

    // 2. Upload to Firebase Storage
    const buffer = Buffer.from(opts.imageBase64, 'base64');
    await file.save(buffer, {
        metadata: {
            contentType: 'image/png',
            metadata: {
                venueId: opts.venueId,
                eventId: opts.eventId,
                prompt: opts.prompt
            }
        }
    });

    // 3. Make Public
    await file.makePublic();
    const publicUrl = file.publicUrl();

    // 4. Create Firestore Record
    const flyerId = uuidv4();
    const assetData = {
        id: flyerId,
        venueId: opts.venueId,
        eventId: opts.eventId,
        storagePath: filePath,
        publicUrl: publicUrl,
        prompt_used: opts.prompt,
        specs: {
            platform: opts.spec.platform,
            type: opts.spec.type,
            dimensions: { width: opts.spec.width, height: opts.spec.height }
        },
        status: 'draft',
        createdAt: new Date().toISOString()
    };

    // Save to sub-collection
    await db.collection('venues')
        .doc(opts.venueId)
        .collection('flyers')
        .doc(flyerId)
        .set(assetData);

    return assetData;
}
