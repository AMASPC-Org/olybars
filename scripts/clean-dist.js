
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

if (fs.existsSync(distPath)) {
    console.log('🧹 Cleaning dist directory...');
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('✨ Dist directory cleaned.');
} else {
    console.log('✨ Dist directory already clean.');
}
