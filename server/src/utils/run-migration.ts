import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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
        if (getApps().length === 0) {
            initializeApp({
                projectId: 'ama-ecosystem-prod'
            });
        }

        const db = getFirestore();
        await migratePartnerData(db);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

run();
