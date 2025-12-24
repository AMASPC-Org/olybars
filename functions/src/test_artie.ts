import { artieChatLogic } from './flows/artieChat';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from functions/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runTest() {
    console.log("🚀 Starting Artie Brain Test...");
    console.log("Checking API Key:", process.env.GOOGLE_GENAI_API_KEY ? "FOUND" : "MISSING");

    const input = {
        question: "Who has the best happy hour in Olympia?",
        history: []
    };

    try {
        console.log("📡 Sending query to Artie...");
        const response = await artieChatLogic(input);
        console.log("\n🤖 Artie says:");
        console.log("-------------------");
        console.log(response);
        console.log("-------------------\n");
    } catch (error) {
        console.error("❌ Artie Brain Failure:", error);
    }
}

runTest();
