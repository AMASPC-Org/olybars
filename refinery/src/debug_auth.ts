import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, '../service-account.json');

try {
    const content = fs.readFileSync(serviceAccountPath, 'utf-8');
    console.log('File size:', content.length);
    const serviceAccount = JSON.parse(content);
    console.log('Keys found:', Object.keys(serviceAccount));

    if (serviceAccount.private_key) {
        console.log('Private Key length:', serviceAccount.private_key.length);
        console.log('Private Key starts with:', serviceAccount.private_key.substring(0, 30).replace(/\n/g, '\\n'));
        console.log('Private Key contains \\n literal?', serviceAccount.private_key.includes('\\n'));
        console.log('Private Key contains newline char?', serviceAccount.private_key.includes('\n'));
    } else {
        console.log('❌ MISSING private_key');
    }

    if (serviceAccount.project_id) {
        console.log('Project ID:', serviceAccount.project_id);
    } else {
        console.log('❌ MISSING project_id');
    }

} catch (e) {
    console.error('Error reading/parsing:', e);
}
