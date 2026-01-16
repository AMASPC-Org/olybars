import admin from 'firebase-admin';

import { config } from './appConfig/config.js';

// Safety Switch: Ensure we don't accidentally target Production from Local
const isCloudIntention = process.argv.includes('--cloud') || process.argv.includes('--force-prod');

if (isCloudIntention) {
    delete process.env.FIRESTORE_EMULATOR_HOST;
    delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
    console.log('☁️ FORCE-PROD: Explicitly targeting Remote Firestore (Emulator Env Vars Cleared)');
}

if (process.env.NODE_ENV === 'development' && !process.env.FIRESTORE_EMULATOR_HOST && !isCloudIntention) {
    console.error('❌ [FATAL] Attempting to connect to Production DB from Local Environment without Emulator. Aborting.');
    console.error('Use --cloud to intentionally target the remote database.');
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
export const storage = admin.storage();
