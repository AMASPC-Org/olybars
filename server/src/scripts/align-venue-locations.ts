import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findPlaceLocation } from '../utils/geocodingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function alignLocations() {
    console.log('🚀 [ALIGN] Starting Coordinate Alignment with Google Listings...');

    // Read directly to avoid ESM issues with JSON imports
    const dataPath = path.join(__dirname, '../data/venues_master.json');
    const venues = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const results = [];
    let updatedCount = 0;

    for (const venue of venues) {
        const query = `${venue.name} ${venue.address || ''}`;
        console.log(`🔍 [ALIGN] Querying: ${query}`);

        try {
            // Delay to avoid hitting rate limits if Many venues
            await new Promise(resolve => setTimeout(resolve, 200));

            const result = await findPlaceLocation(query);
            if (result) {
                console.log(`✅ [ALIGN] Match found for ${venue.name}: ${result.lat}, ${result.lng}`);

                venue.location = {
                    lat: result.lat,
                    lng: result.lng
                };
                updatedCount++;
            } else {
                console.warn(`⚠️ [ALIGN] No match found for ${venue.name}. Keeping current coordinates.`);
            }
        } catch (error) {
            console.error(`❌ [ALIGN] Error for ${venue.name}:`, error);
        }
        results.push(venue);
    }

    fs.writeFileSync(dataPath, JSON.stringify(results, null, 2));

    console.log(`\n🎉 [ALIGN] Finished! Updated ${updatedCount} venues in venues_master.json`);
    console.log(`👉 Next Step: Run 'npm run start' or a seed command to update Firestore.`);
}

alignLocations().catch(console.error);
