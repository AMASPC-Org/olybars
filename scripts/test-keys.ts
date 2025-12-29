
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const keys = {
    BACKEND_KEY: process.env.GOOGLE_BACKEND_KEY,
    BROWSER_KEY: process.env.VITE_GOOGLE_BROWSER_KEY || process.env.GOOGLE_BROWSER_KEY
};

async function testKey(name, key) {
    if (!key) {
        console.log(`[${name}] Missing`);
        return;
    }

    console.log(`[${name}] Testing key starting with ${key.substring(0, 10)}...`);

    // Test Maps Static (Basic)
    const mapsUrl = `https://maps.googleapis.com/maps/api/staticmap?center=47,-122&zoom=13&size=1x1&key=${key}`;
    const mapsResp = await fetch(mapsUrl);
    console.log(` - Maps JS/Static: ${mapsResp.status} ${mapsResp.statusText}`);

    // Test Places (The one failing)
    const placesUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Olympia&inputtype=textquery&key=${key}`;
    const placesResp = await fetch(placesUrl);
    const placesData = await placesResp.json();
    console.log(` - Places API: ${placesResp.status} ${placesData.status || 'No Status'}`);
    if (placesData.error_message) {
        console.log(`   Error: ${placesData.error_message}`);
    }
}

async function run() {
    await testKey('BACKEND_KEY', keys.BACKEND_KEY);
    await testKey('BROWSER_KEY', keys.BROWSER_KEY);
}

run();
