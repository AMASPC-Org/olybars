import { db } from './firebaseAdmin';
import { config } from './config';
import readline from 'readline';
import venues from './data/venues_master.json'; // Direct import for script
import { VenueSchema } from './utils/validation';
export { venues };

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string) => new Promise<string>(resolve => rl.question(query, resolve));
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function seedVenues() {
    const isProd = config.NODE_ENV === 'production';
    const isLocal = !process.env.K_SERVICE;
    const forceProd = process.argv.includes('--force-prod');

    console.log(`\n🚀 [IRON SEED] Environment: ${config.NODE_ENV.toUpperCase()}`);

    if (isProd) {
        if (!forceProd) {
            console.error('❌ [ERROR] You are attempting to run seeding in PRODUCTION without the --force-prod flag.');
            process.exit(1);
        }

        console.warn('⚠️  [WARNING] YOU ARE ABOUT TO UPDATE VENUE DEFINITIONS IN PRODUCTION.');
        console.warn('⚠️  [WARNING] This will overwrite static fields but PRESERVE runtime data (check-ins, vibe).');

        const answer = await question('Are you absolutely sure you want to proceed? (Y/N): ');
        if (answer.toLowerCase() !== 'y') {
            console.log('Seeding aborted by user. 🍻');
            process.exit(0);
        }
    } else if (isLocal) {
        if (!process.env.FIRESTORE_EMULATOR_HOST) {
            console.error('❌ [ERROR] NO EMULATOR DETECTED. Aborting.');
            process.exit(1);
        }
        console.log('📡 [LOCAL] Connected to Emulator. Proceeding with idempotent seed.');
    }

    console.log('Starting "The Iron Seed" (Idempotent + Validated)...');

    try {
        const venuesRef = db.collection('venues');
        let successCount = 0;
        let failCount = 0;

        for (const venueData of (venues as any[])) {
            // 1. Zod Validation
            const validation = VenueSchema.safeParse(venueData);
            if (!validation.success) {
                console.error(`❌ Validation Failed for ${venueData.name} (${venueData.id}):`);
                console.error(JSON.stringify(validation.error.format(), null, 2));
                console.error("Skipping venue due to validation errors.");
                failCount++;
                continue;
            }

            const validVenue = validation.data;
            const { id } = validVenue;

            // Ensure point bank is initialized
            if (validVenue.pointBank === undefined) {
                validVenue.pointBank = 0;
                validVenue.pointBankLastReset = Date.now();
            }

            // 2. Fetch existing doc to decide on merge strategy
            const docRef = venuesRef.doc(id);
            const doc = await docRef.get();

            if (doc.exists) {
                // UPDATE: Exclude runtime fields to prevent resetting them
                const {
                    checkIns,
                    currentBuzz,
                    status,
                    manualStatus, // If defined in master, we might want to respect it? Usually master doesn't have manualStatus.
                    ...staticData
                } = validVenue as any;

                // Also ensure we don't accidentally unset fields that are not in Schema but in DB?
                // merge: true handles that.

                // If ID is in staticData (it is), that's fine.

                await docRef.set(staticData, { merge: true });
                console.log(`🔄 Updated: ${validVenue.name}`);
            } else {
                // CREATE: Use full data (defaults included)
                await docRef.set(validVenue);
                console.log(`✨ Created: ${validVenue.name}`);
            }
            successCount++;
        }

        console.log(`\nIron Seed Complete! 🍺`);
        console.log(`Success: ${successCount} | Failed: ${failCount}`);

        if (failCount > 0) process.exit(1);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding venues:', error);
        process.exit(1);
    } finally {
        rl.close();
    }
}

seedVenues();
