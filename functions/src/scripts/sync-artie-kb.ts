import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env from functions or root directory
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), 'functions', '.env') });

if (getApps().length === 0) {
    initializeApp();
}

const db = getFirestore();

async function syncKnowledge() {
    console.log("🚀 Starting Artie Knowledge Sync...");

    try {
        // 1. Read Knowledge Base JSON
        const kbPath = path.join(__dirname, '..', 'knowledgeBase.json');
        const kb = JSON.parse(fs.readFileSync(kbPath, 'utf8'));

        const knowledgeItems: any[] = [];

        // 2. Add FAQs
        kb.faq.forEach((f: any) => knowledgeItems.push({ question: f.question, answer: f.answer, category: 'FAQ' }));

        // 3. Add History
        Object.entries(kb.history_timeline).forEach(([k, v]) => {
            knowledgeItems.push({ question: `History: ${k}`, answer: v, category: 'History' });
        });

        // 4. Add Market Context
        Object.entries(kb.market_context).forEach(([k, v]) => {
            knowledgeItems.push({ question: `Market: ${k}`, answer: v, category: 'Market' });
        });

        // 5. Batch Upload to Firestore
        const batch = db.batch();
        const knowledgeCol = db.collection('knowledge');

        // Clear old knowledge (optional, or just update)
        // For simplicity in this script, we'll just add/overwrite
        knowledgeItems.forEach(item => {
            const docId = Buffer.from(item.question).toString('base64').substring(0, 50); // Deterministic ID
            batch.set(knowledgeCol.doc(docId), {
                ...item,
                updatedAt: new Date().toISOString()
            });
        });

        await batch.commit();
        console.log(`✅ Synced ${knowledgeItems.length} items to Firestore knowledge collection.`);

    } catch (error) {
        console.error("❌ Sync Failed:", error);
        process.exit(1);
    }
}

syncKnowledge();
