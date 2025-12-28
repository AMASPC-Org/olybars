import { artieChatLogic } from '../flows/artieChat';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from functions/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function verifyRuleIngestion() {
    console.log("🍹🚀 Verifying LCB Rule Ingestion...");

    // Check if API key is loaded
    if (!process.env.GOOGLE_GENAI_API_KEY) {
        console.error("❌ GOOGLE_GENAI_API_KEY is missing!");
        process.exit(1);
    }

    const query = "Artie, verify my compliance rules. Check lcb-compliance-consigliere.md and tell me which specific PDF you will use to judge a 'Speed Drinking' contest.";

    console.log(`\nQUERY: "${query}"`);

    try {
        const input = {
            question: query,
            history: [] // Stateless for this test
        };

        const response = await artieChatLogic(input);

        console.log("\n🤖 Artie Response:");
        console.log("-------------------");
        console.log(response);
        console.log("-------------------");

        // Verification Logic
        const lowerResponse = response.toLowerCase();
        const mentionsPDF = lowerResponse.includes("wac 314-52") || lowerResponse.includes("rcw 66");
        const mentionsSpeed = lowerResponse.includes("speed") || lowerResponse.includes("rapid");
        const mentionsPrecedence = lowerResponse.includes("precedence") || lowerResponse.includes("pdf");

        if (mentionsPDF) {
            console.log("✅ PDF CITATION CHECK PASSED: Artie referenced the specific PDF documents.");
        } else {
            console.log("⚠️ PDF CITATION CHECK WARNING: Artie did not explicitly name the PDF files.");
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error);
    }
}

verifyRuleIngestion();
