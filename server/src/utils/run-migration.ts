import * as admin from 'firebase-admin';
import { migratePartnerData } from './migrate-partner-data';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

/**
 * Migration Runner
 * Initializes Firebase Admin and runs the venue data migration.
 */
async function run() {
    try {
        // Initialize Firebase Admin
        // This will use GOOGLE_APPLICATION_CREDENTIALS if set, or local default
        if (admin.apps.length === 0) {
            admin.initializeApp({
                projectId: 'ama-ecosystem-prod' // Ensure this matches your project
            });
        }

        const db = admin.firestore();
        await migratePartnerData(db);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

run();
