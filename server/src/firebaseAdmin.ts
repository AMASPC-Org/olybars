import admin from 'firebase-admin';

// Initialize Firebase Admin with default credentials
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.GOOGLE_CLOUD_PROJECT || 'ama-ecosystem-prod'
    });
}

export const db = admin.firestore();
export const auth = admin.auth();
