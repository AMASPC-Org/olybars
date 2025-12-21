import admin from 'firebase-admin';

// Initialize Firebase Admin with explicit projectId to resolve authentication issues in Cloud Run
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'ama-ecosystem-prod'
    });
}

export const db = admin.firestore();
export const auth = admin.auth();
