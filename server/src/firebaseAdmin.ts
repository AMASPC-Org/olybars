import admin from 'firebase-admin';

// Initialize Firebase Admin with explicit projectId to resolve authentication issues in Cloud Run
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'ama-ecosystem-prod'
    });
}

if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`📡 [SERVER] Using Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
}

export const db = admin.firestore();
export const auth = admin.auth();
export const appCheck = admin.appCheck();
