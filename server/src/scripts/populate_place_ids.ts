
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import axios from 'axios';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const MASTER_PATH = path.resolve(__dirname, '../data/venues_master.json');
const BACKUP_PATH = path.resolve(__dirname, '../data/venues_master.backup.json');

// validation
const API_KEY = process.env.GOOGLE_BACKEND_KEY || process.env.GOOGLE_MAPS_KEY || process.env.VITE_GOOGLE_MAPS_KEY;

if (!API_KEY) {
    console.error("❌ No Google Maps API Key found in env (checked GOOGLE_BACKEND_KEY, GOOGLE_MAPS_KEY, VITE_GOOGLE_MAPS_KEY)");
    process.exit(1);
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function searchPlace(name: string, address: string) {
    try {
        const query = `${name}, ${address || 'Olympia, WA'}`;
        const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${API_KEY}`;

        const res = await axios.get(url);

        if (res.data.status === 'OK' && res.data.candidates.length > 0) {
            return res.data.candidates[0].place_id;
        } else {
            // Fallback to text search if findplace fails (sometimes better for broad matches)
            const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
            const tsRes = await axios.get(textSearchUrl);
            if (tsRes.data.status === 'OK' && tsRes.data.results.length > 0) {
                return tsRes.data.results[0].place_id;
            }
        }
        return null;
    } catch (e) {
        console.error(`Error searching for ${name}:`, e.message);
        return null;
    }
}

async function main() {
    console.log("🚀 Starting Bulk ID Population...");

    // Read Data
    const rawArgs = fs.readFileSync(MASTER_PATH, 'utf-8');
    const venues = JSON.parse(rawArgs);

    // Backup
    fs.writeFileSync(BACKUP_PATH, rawArgs);
    console.log("💾 Backup created at venues_master.backup.json");

    let updatedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < venues.length; i++) {
        const venue = venues[i];

        if (venue.googlePlaceId) {
            skippedCount++;
            continue;
        }

        console.log(`[${i + 1}/${venues.length}] Fetching ID for: ${venue.name}...`);

        const placeId = await searchPlace(venue.name, venue.address);

        if (placeId) {
            venue.googlePlaceId = placeId;
            updatedCount++;
            console.log(`   ✅ Found: ${placeId}`);
        } else {
            failedCount++;
            console.log(`   ❌ Could not find Place ID`);
        }

        // Rate limiting
        await sleep(200);
    }

    // Write back
    fs.writeFileSync(MASTER_PATH, JSON.stringify(venues, null, 2));

    console.log(`\n🎉 DONE!`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped (Already Has ID): ${skippedCount}`);
    console.log(`Failed to Find: ${failedCount}`);
}

main();
