import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

// Ensure we target the local emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

async function setupTestPartner() {
    try {
        if (getApps().length === 0) {
            initializeApp({
                projectId: 'ama-ecosystem-prod'
            });
        }

        const auth = getAuth();
        const db = getFirestore();

        const email = 'test-partner@olybars.com';
        const password = 'password123';
        const venueId = 'well-80';

        let user;
        try {
            user = await auth.getUserByEmail(email);
            console.log(`User ${email} already exists.`);
        } catch (e) {
            user = await auth.createUser({
                email,
                password,
                displayName: 'Test Partner'
            });
            console.log(`Created user ${email} with UID: ${user.uid}`);
        }

        // Set user document
        await db.collection('users').doc(user.uid).set({
            email,
            displayName: 'Test Partner',
            role: 'owner',
            createdAt: new Date().toISOString()
        }, { merge: true });

        // Set venue ownership
        await db.collection('venues').doc(venueId).update({
            ownerId: user.uid,
            managerIds: [user.uid]
        });

        console.log(`✅ Success: ${email} is now the owner of ${venueId}`);
        process.exit(0);
    } catch (error) {
        console.error('Failed to setup test partner:', error);
        process.exit(1);
    }
}

setupTestPartner();
