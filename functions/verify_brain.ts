import { artieChatLogic } from './src/flows/artieChat';

async function testBrain() {
    console.log("🧠 Testing Artie's Brain...");

    const testQuestions = [
        "What's the vibe at Ilk Lodge?",
        "How does the check-in limit work?",
        "What is happening tomorrow night?",
        "What is buzzing right now?",
        "Give me a history fact about Olympia Beer."
    ];

    for (const question of testQuestions) {
        console.log(`\n❓ Question: ${question}`);
        try {
            const response = await artieChatLogic({
                history: [],
                question: question
            });
            console.log(`🤖 Artie: ${response}`);
        } catch (error) {
            console.error(`❌ Error: ${error}`);
        }
    }
}

testBrain();
