import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

// Load .env from functions or root directory
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), 'functions', '.env') });

if (getApps().length === 0) {
    initializeApp();
}

/**
 * Generates a safe document ID from a string using SHA-256 prefix.
 */
function generateSafeId(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex').substring(0, 32);
}

const db = getFirestore();

async function syncKnowledge() {
    try {
        // 1. Read Knowledge Base JSON
        const kbPath = path.join(__dirname, '..', 'knowledgeBase.json');
        const kb = JSON.parse(fs.readFileSync(kbPath, 'utf8'));

        const knowledgeItems: { question: string, answer: string, category: string }[] = [];

        // 2. Add FAQs
        kb.faq.forEach((f: { question: string, answer: string }) => knowledgeItems.push({ question: f.question, answer: f.answer, category: 'FAQ' }));

        // 3. Add History
        Object.entries(kb.history_timeline).forEach(([k, v]) => {
            knowledgeItems.push({ question: `History: ${k}`, answer: v as string, category: 'History' });
        });

        // 4. Add Market Context
        Object.entries(kb.market_context).forEach(([k, v]) => {
            knowledgeItems.push({ question: `Market: ${k}`, answer: v as string, category: 'Market' });
        });

        // 5. Add Local Knowledge (Glossary)
        if (kb.lore && kb.lore.local_knowledge) {
            Object.entries(kb.lore.local_knowledge).forEach(([k, v]) => {
                knowledgeItems.push({ question: `Glossary: ${k}`, answer: v as string, category: 'Glossary' });
            });
        }

        const batch = db.batch();
        const knowledgeCol = db.collection('knowledge');


        // Clear old knowledge (optional, or just update)
        // For simplicity in this script, we'll just add/overwrite
        knowledgeItems.forEach(item => {
            const docId = generateSafeId(item.question);
            batch.set(knowledgeCol.doc(docId), {
                ...item,
                updatedAt: new Date().toISOString()
            });
        });

        console.log("Committing batch to Firestore...");

        // [FINOPS] Race condition protection with 10s Timeout
        const commitPromise = batch.commit();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firestore Batch Commit Timeout (10s reached). Check network/auth.")), 10000)
        );

        await Promise.race([commitPromise, timeoutPromise]);
        console.log(`✅ Synced ${knowledgeItems.length} items to Firestore knowledge collection.`);

    } catch (error) {
        console.error("❌ Sync Failed:", error);
        process.exit(1);
    }
}

syncKnowledge();
