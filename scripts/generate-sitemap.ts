import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin (Replicating logic to avoid import issues)
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'ama-ecosystem-prod'
    });
}

const db = admin.firestore();
const DOMAIN = 'https://olybars.com';

const STATIC_ROUTES = [
    '/',
    '/map',
    '/bars',
    '/events',
    '/meet-artie',
    '/faq',
    '/league',
    '/trivia',
    '/karaoke',
    '/live',
    '/about',
    '/more',
    '/ai',
    '/ai/feed',
    '/ai/conduct'
];

async function generateSitemap() {
    console.log('🗺️  Generating sitemap...');
    const urls: string[] = [];

    // 1. Add Static Routes
    STATIC_ROUTES.forEach(route => {
        urls.push(`
  <url>
    <loc>${DOMAIN}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    // 2. Add Dynamic Venue Routes
    try {
        const snapshot = await db.collection('venues').get();
        if (snapshot.empty) {
            console.warn('⚠️  No venues found in Firestore!');
        } else {
            console.log(`📍 Found ${snapshot.size} venues.`);
            snapshot.forEach(doc => {
                // Use the document ID to construct the URL
                const venueId = doc.id;
                // Assuming route structure is /venues/:id based on recent work
                urls.push(`
  <url>
    <loc>${DOMAIN}/venues/${venueId}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
            });
        }
    } catch (error) {
        console.error('❌ Error fetching venues:', error);
    }

    // 3. Construct XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

    // 4. Write to file
    const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, sitemap);
    console.log(`✅ Sitemap written to: ${outputPath}`);
    process.exit(0);
}

generateSitemap();
