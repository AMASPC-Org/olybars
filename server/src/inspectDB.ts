import { db } from './firebaseAdmin.js';
import { config } from './appConfig/config.js';

async function inspect() {
    console.log('--- FIRESTORE INSPECTION ---');
    console.log('Project ID:', config.GOOGLE_CLOUD_PROJECT);
    console.log('Emulator Host (process.env):', process.env.FIRESTORE_EMULATOR_HOST);

    try {
        const venuesSnap = await db.collection('venues').get();
        console.log('Venues Count:', venuesSnap.size);

        const knowledgeSnap = await db.collection('knowledge').get();
        console.log('Knowledge Count:', knowledgeSnap.size);

        if (venuesSnap.size === 0) {
            console.log('⚠️  NO VENUES FOUND. Database might be empty or wrong instance.');
        } else {
            console.log('✅ DATABASE HAS VENUES.');
        }
    } catch (error: any) {
        console.error('❌ ERROR ACCESSING FIRESTORE:', error.message);
    }
}

inspect();
