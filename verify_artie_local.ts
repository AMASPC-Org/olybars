import { GeminiService } from './functions/src/services/geminiService';
import { artieChatLogic } from './functions/src/flows/artieChat';
import { config } from './functions/src/config';

async function verifyArtie() {
    console.log("--- ARTIE OLYMPIA FOCUS VERIFICATION ---");
    const key = config.GOOGLE_GENAI_API_KEY;
    const service = new GeminiService(key);

    const testQuestions = [
        "Does Hannah's have trivia?",
        "What's a good place in Seattle?",
        "How do I join the league?",
        "Where are you located?"
    ];

    for (const q of testQuestions) {
        console.log(`\nTesting Question: "${q}"`);

        // 1. Test Triage
        const triage = await service.getTriage(q);
        console.log(`Triage Result: ${triage}`);

        // 2. Test Logic (Mocking Flow)
        try {
            const result: any = await artieChatLogic({
                history: [],
                question: q,
                userId: 'test-user',
                userRole: 'user'
            });

            if (typeof result === 'string') {
                console.log(`Artie Response (Reject/Fallback): ${result}`);
            } else if (result.stream) {
                let fullText = "";
                for await (const chunk of result.stream) {
                    fullText += chunk.text();
                }
                console.log(`Artie Stream Response: ${fullText}`);
            } else {
                console.log(`Artie Response (Data): ${JSON.stringify(result)}`);
            }
        } catch (err: any) {
            console.error(`Error testing logic for "${q}":`, err.message);
        }
    }
}

verifyArtie().catch(console.error);
