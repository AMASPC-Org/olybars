
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'server/src/data/venues_master.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const venues = JSON.parse(data);
    const missing = venues.filter(v => !v.googlePlaceId).map(v => v.name);

    console.log(`Total Venues: ${venues.length}`);
    console.log(`Missing GooglePlaceId: ${missing.length}`);
    if (missing.length > 0) {
        console.log('Venues missing ID:', missing);
    }
} catch (err) {
    console.error(err);
}
