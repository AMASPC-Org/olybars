import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = process.cwd();

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
});

async function verifyMapsIntegrity() {
    try {
        console.log("🔍 OlyBars Maps Integrity Scan Starting...");

        const BACKEND_URLS = [
            'http://localhost:3001/api/config/maps-key',
            'http://127.0.0.1:3001/api/config/maps-key'
        ];

        const FRONTEND_URL = 'http://localhost:3000';

        console.log("\n1. Testing Backend Key Endpoints...");
        for (const url of BACKEND_URLS) {
            try {
                console.log(`📡 Fetching ${url}...`);
                const res = await fetch(url);
                if (res.ok) {
                    const data = (await res.json()) as { key?: string };
                    if (data.key && data.key.startsWith('AIza')) {
                        console.log(`✅ [SUCCESS] Backend reachable at ${url}`);
                    } else {
                        console.error(`❌ [FAILURE] Backend at ${url} returned invalid or missing key.`);
                    }
                } else {
                    console.error(`❌ [FAILURE] Backend at ${url} returned status ${res.status}.`);
                }
            } catch (e: any) {
                console.error(`❌ [FAILURE] Could not reach backend at ${url}: ${e.message}`);
            }
        }

        console.log("\n2. Testing Frontend Proxy Reachability...");
        try {
            const proxyUrl = `${FRONTEND_URL}/api/config/maps-key`;
            console.log(`📡 Fetching ${proxyUrl}...`);
            const res = await fetch(proxyUrl);
            if (res.ok) {
                console.log(`✅ [SUCCESS] Vite proxy to ${proxyUrl} is functional.`);
            } else {
                console.error(`❌ [FAILURE] Vite proxy at ${proxyUrl} returned status ${res.status}.`);
            }
        } catch (e: any) {
            console.error(`❌ [FAILURE] Could not reach frontend proxy at ${FRONTEND_URL}: ${e.message}`);
        }

        console.log("\n3. Scanning Codebase for Hardcoded Keys (AIzaSy)...");
        const TARGET_DIRS = [
            'src/features/owner',
            'src/pages/partners',
            'src/hooks',
            'src/features/venues'
        ];

        let leakFound = false;

        function scanDir(directory: string) {
            const absDir = path.resolve(root, directory);
            if (!fs.existsSync(absDir)) {
                console.warn(`⚠️ [SCAN_SKIP] Directory ${directory} does not exist. Skipping.`);
                return;
            }

            console.log(`📂 Scanning ${directory}...`);
            const files = fs.readdirSync(absDir);

            for (const file of files) {
                const fullPath = path.join(absDir, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    if (file !== 'node_modules' && file !== '.git') {
                        scanDir(path.join(directory, file));
                    }
                } else if (stat.isFile()) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    if (content.includes('AIzaSy')) {
                        // Ignore the script itself and configuration files that SHOULD have the key (like .env)
                        if (file !== 'verify-maps-integrity.ts' && !file.endsWith('.env') && !file.endsWith('.example')) {
                            console.error(`❌ [LEAK DETECTED] Potential hardcoded key found in ${fullPath}`);
                            leakFound = true;
                        }
                    }
                }
            }
        }

        for (const dir of TARGET_DIRS) {
            scanDir(dir);
        }

        if (leakFound) {
            console.error("\n[CRITICAL] Hardcoded keys detected! Cleanup required before proceeding.");
            process.exit(1);
        } else {
            console.log("✅ [SAFE] No leaks found in target directories.");
        }

        console.log("\nScan complete. If all checks passed, the Google Maps infrastructure is healthy.");
    } catch (globalError: any) {
        console.error(`\n💥 [FATAL ERROR] Integrity scan crashed: ${globalError.stack}`);
        process.exit(1);
    }
}

verifyMapsIntegrity();
