
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MASTER_PATH = path.resolve(__dirname, '../data/venues_master.json');

const rawArgs = fs.readFileSync(MASTER_PATH, 'utf-8');
const venues = JSON.parse(rawArgs);

console.log(`Initial count: ${venues.length}`);

// 1. Remove "Octapas Cafe (New)"
let filtered = venues.filter(v => v.name !== 'Octapas Cafe (New)');
console.log(`After removing Octapas (New): ${filtered.length}`);

// 2. Dedup The Wine Loft
const seen = new Set();
const deduped = [];
for (const v of filtered) {
    if (v.name === 'The Wine Loft') {
        if (seen.has('The Wine Loft')) {
            console.log('Skipping duplicate The Wine Loft');
            continue;
        }
        seen.add('The Wine Loft');
    }
    deduped.push(v);
}

console.log(`Final count: ${deduped.length}`);

fs.writeFileSync(MASTER_PATH, JSON.stringify(deduped, null, 2));
console.log('Saved cleanup.');
