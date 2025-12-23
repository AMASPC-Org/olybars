
import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

const ai = genkit({
    plugins: [
        vertexAI({ location: 'us-central1' }),
    ],
});

async function main() {
    // In Genkit 0.9.x, we can access the registry.
    // However, registry access might be internal.
    // Let's try to list actions with type 'model'.

    // In 0.9.12, assuming we can just try to generate and catching specific error might be harder locally without auth.
    // But let's try to mock the auth or just see what the plugin registers.

    console.log("Registered plugins:", ai);
    // There isn't a simple public API to list models in 0.9.12 without digging into internals.
    // But we can try to inspect the `vertexAI` plugin object if it exports constants.
}

main();
