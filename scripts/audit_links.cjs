const fs = require('fs');
const path = require('path');

// CONFIG
const APP_FILE = 'src/App.tsx';
const SRC_DIR = 'src';

// 1. EXTRACT VALID ROUTES FROM APP.TSX
function getValidRoutes() {
    const content = fs.readFileSync(APP_FILE, 'utf8');
    const routeRegex = /<Route\s+[^>]*path=["']([^"']+)["']/g;
    const routes = [];
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
        let route = match[1];
        if (route === '*') continue; // Skip catch-all
        if (route === 'index') route = '/'; // Handle index routes
        // Normalize: ensure leading slash for consistency in comparison
        if (!route.startsWith('/')) route = '/' + route;
        routes.push(route);
    }
    // Add implicit root if not found
    if (!routes.includes('/')) routes.push('/');
    return routes;
}

// 2. RECURSIVE FILE SCANNER
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                arrayOfFiles.push(path.join(dirPath, '/', file));
            }
        }
    });
    return arrayOfFiles;
}

// 3. CHECK LINK VALIDITY
function isLinkValid(link, validRoutes) {
    if (link.startsWith('http')) return true; // External
    if (link.startsWith('mailto')) return true;
    if (link === '#') return true; // Anchor placeholder

    // Normalize link (remove query params)
    const cleanLink = link.split('?')[0].split('#')[0];

    // Check for exact match
    if (validRoutes.includes(cleanLink)) return true;

    // Check for dynamic match (e.g., /venues/123 matches /venues/:id)
    return validRoutes.some(route => {
        const routeParts = route.split('/').filter(Boolean);
        const linkParts = cleanLink.split('/').filter(Boolean);
        if (routeParts.length !== linkParts.length) return false;

        return routeParts.every((part, i) => {
            return part.startsWith(':') || part === linkParts[i];
        });
    });
}

// MAIN EXECUTION
console.log('--- OLYBARS LINK AUDITOR ---');
const validRoutes = getValidRoutes();
console.log('[INFO] Registered Routes:', validRoutes.length);
// console.log(validRoutes); // Uncomment to debug routes

const files = getAllFiles(SRC_DIR);
let brokenLinks = [];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Regex for <Link to="..."> and navigate('...')
    const linkRegex = /(?:<Link[^>]+to=["']|navigate\s*\(\s*["'])([^"'}]+)["']/g;

    let match;
    while ((match = linkRegex.exec(content)) !== null) {
        const link = match[1];
        if (!isLinkValid(link, validRoutes)) {
            brokenLinks.push({
                file: file,
                link: link
            });
        }
    }
});

if (brokenLinks.length === 0) {
    console.log('[SUCCESS] No broken internal links found.');
} else {
    console.log(`[WARN] FOUND ${brokenLinks.length} POTENTIALLY BROKEN LINKS:`);
    brokenLinks.forEach(item => {
        console.log(`[FAIL] "${item.link}" in ${item.file}`);
    });
    console.log('\n--- RECOMMENDATION ---');
    console.log('Review the list above. If a link is listed but valid (e.g. dynamic), ignore it.');
    console.log('If it is truly missing, we will proceed to Phase 3 (Fabrication).');
}
