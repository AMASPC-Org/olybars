import admin from 'firebase-admin';

import { config } from './config';

// Safety Switch: Ensure we don't accidentally target Production from Local
if (process.env.NODE_ENV === 'development' && !process.env.FIRESTORE_EMULATOR_HOST) {
    console.error('❌ [FATAL] Attempting to connect to Production DB from Local Environment without Emulator. Aborting.');
    process.exit(1);
}

// Initialize Firebase Admin with data-driven projectId from validated config
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: config.GOOGLE_CLOUD_PROJECT
    });
}

export const db = admin.firestore();
export const auth = admin.auth();
export const appCheck = admin.appCheck();
