
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MASTER_PATH = path.resolve(__dirname, '../data/venues_master.json');

const rawArgs = fs.readFileSync(MASTER_PATH, 'utf-8');
const venues = JSON.parse(rawArgs);

console.log(`Total Venues: ${venues.length}`);

// Find Octapas
let octapas = venues.find(v => v.name.includes('Octapas'));
console.log('Found Octapas?', octapas ? octapas.name : 'NO');

// Find Wine Loft
let wineLoft = venues.filter(v => v.name.includes('Wine Loft'));
console.log('Wine Loft count:', wineLoft.length);

if (!octapas) {
    console.log('Adding Octapas...');
    venues.push({
        id: "octapas-cafe",
        name: "Octapas Cafe",
        venueType: "restaurant_bar",
        sceneTags: ["tapas", "cocktails", "live_music", "artsy"],
        foodService: "full_kitchen",
        status: "chill",
        vibe: "Eclectic, artsy, and flavorful global tapas.",
        insiderVibe: "Often features incredible flamenco or jazz. The cocktails are top-tier.",
        address: "414 4th Ave E, Olympia, WA 98501, USA",
        location: { lat: 47.0453, lng: -122.8966 }, // Approx
        isActive: true,
        isVisible: true,
        googlePlaceId: "ChIJnbD3xx51kVQRy274FKfEy6U",
        tier_config: { is_directory_listed: true, is_league_eligible: true }
    });
} else {
    // Enrich it if it's the "Old" one
    console.log('Enriching Octapas...');
    octapas.sceneTags = ["tapas", "cocktails", "live_music", "artsy"];
    octapas.vibe = "Eclectic, artsy, and flavorful global tapas.";
    octapas.insiderVibe = "Often features incredible flamenco or jazz. The cocktails are top-tier.";
    octapas.googlePlaceId = "ChIJnbD3xx51kVQRy274FKfEy6U";
}

fs.writeFileSync(MASTER_PATH, JSON.stringify(venues, null, 2));
console.log('Saved.');
