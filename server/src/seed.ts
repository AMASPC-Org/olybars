import { db } from './firebaseAdmin';
import { config } from './config';
import readline from 'readline';
import venues from './data/venues_master.json';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string) => new Promise<string>(resolve => rl.question(query, resolve));
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function clearCollection(collectionName: string) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

async function seedVenues() {
    const isProd = config.NODE_ENV === 'production';
    const isLocal = !process.env.K_SERVICE;
    const forceProd = process.argv.includes('--force-prod');

    console.log(`\n🚀 [SEEDER] Environment: ${config.NODE_ENV.toUpperCase()}`);

    if (isProd) {
        if (!forceProd) {
            console.error('❌ [ERROR] You are attempting to run seeding in PRODUCTION without the --force-prod flag.');
            process.exit(1);
        }

        console.warn('⚠️  [WARNING] YOU ARE ABOUT TO WIPE AND SEED THE PRODUCTION DATABASE.');
        console.warn('⚠️  [WARNING] THIS ACTION IS DESTRUCTIVE AND IRREVERSIBLE.');

        for (let i = 5; i > 0; i--) {
            console.warn(`Countdown: ${i}...`);
            await sleep(1000);
        }

        const answer = await question('Are you absolutely sure you want to proceed? (Y/N): ');
        if (answer.toLowerCase() !== 'y') {
            console.log('Seeding aborted by user. 🍻');
            process.exit(0);
        }
    } else if (isLocal) {
        if (!process.env.FIRESTORE_EMULATOR_HOST) {
            console.error('❌ [ERROR] NO EMULATOR DETECTED. The "Safety Switch" in firebaseAdmin.ts should have caught this.');
            console.error('❌ [FATAL] Aborting to protect Production.');
            process.exit(1);
        }
        console.log('📡 [LOCAL] Connected to Emulator. Proceeding with safe seeding.');
    }

    console.log('Starting venue seeding with clean slate...');
    try {
        await clearCollection('venues');
        await clearCollection('signals');

        const venuesRef = db.collection('venues');
        for (const venue of (venues as any[])) {
            const { id, ...venueData } = venue;

            // Default to Paid League Member for all active venues (User Request Dec 24)
            const isPaid = venueData.isActive !== false && (venue as any).isPaidLeagueMember !== false;

            await venuesRef.doc(id).set({
                ...venueData,
                isPaidLeagueMember: isPaid
            });
            console.log(`Seeded venue: ${venue.name} (${id})`);
        }
        console.log('Seeding complete! 🍺');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding venues:', error);
        process.exit(1);
    } finally {
        rl.close();
    }
}

seedVenues();
