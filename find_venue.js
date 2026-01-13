
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'server/src/data/venues_master.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const venues = JSON.parse(data);
    const found = venues.filter(v => v.name.includes('Wine Loft') || v.name.includes('Octapas'));
    console.log(JSON.stringify(found, null, 2));
} catch (err) {
    console.error(err);
}
