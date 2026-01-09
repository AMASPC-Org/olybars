import { findPlaceLocation } from './server/src/utils/geocodingService';
import fs from 'fs';
import path from 'path';

async function alignClipper() {
    console.log('🔍 Fetching official Google coordinates for The China Clipper...');
    const result = await findPlaceLocation('The China Clipper, 402 4th Ave E, Olympia, WA');

    if (result) {
        console.log(`✅ Found official Listing: ${result.formattedAddress}`);
        console.log(`📍 Coordinates: ${result.lat}, ${result.lng}`);

        const filePath = path.join(process.cwd(), 'server', 'src', 'data', 'venues_master.json');
        const venues = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        const index = venues.findIndex((v: any) => v.id === 'the-china-clipper');
        if (index !== -1) {
            venues[index].location = {
                lat: result.lat,
                lng: result.lng
            };
            venues[index].address = result.formattedAddress;
            fs.writeFileSync(filePath, JSON.stringify(venues, null, 2));
            console.log('💾 Venues Master updated with official Google pinpoint.');
        } else {
            console.error('❌ Could not find "the-china-clipper" in venues_master.json');
        }
    } else {
        console.error('❌ Failed to find official Google listing for The China Clipper.');
    }
}

alignClipper();
