import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';

// Refinement 1: Explicitly map Gemini 3.0 Flash if named export is missing
const gemini30Flash = 'googleai/gemini-3.0-flash';

export default configureGenkit({
  plugins: [
    googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }),
    firebase(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
