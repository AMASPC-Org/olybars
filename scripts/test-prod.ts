// scripts/test-prod.ts
import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import 'dotenv/config';

// 1. PASTE YOUR FIREBASE WEB CONFIG HERE
const firebaseConfig = {
    apiKey: "AIzaSyAfEWY4NF8WDeh612ctG2VNLjSiIcMCRqk",
    authDomain: "ama-ecosystem-prod.firebaseapp.com",
    projectId: "ama-ecosystem-prod",
    storageBucket: "ama-ecosystem-prod.firebasestorage.app",
    messagingSenderId: "26629455103",
    appId: "1:26629455103:web:987d7a42b4dd82a38720ca"
};

// 2. Initialize the Client SDK
const app = initializeApp(firebaseConfig);
// const auth = getAuth(app); // Skipping auth as anonymous login is disabled
const functions = getFunctions(app, "us-west1");

async function testArtie() {
    console.log("🔓 Skipping authentication (Anonymous login disabled)...");

    try {
        // Create a reference to the deployed Genkit flow
        const chatFlow = httpsCallable(functions, 'chatFlow');

        console.log("🚀 Sending message to Artie...");

        // Call the function
        const result = await chatFlow({
            prompt: "Is there any live jazz tonight?",
            history: []
        });

        console.log("\n🤖 ARTIE'S RESPONSE:");
        console.log("---------------------------------------------------");
        console.log(result.data); // The raw text response from Gemini
        console.log("---------------------------------------------------");

    } catch (error) {
        console.error("❌ Test Failed:", error);
    } finally {
        process.exit();
    }
}

testArtie();
