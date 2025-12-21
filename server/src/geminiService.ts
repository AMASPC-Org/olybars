import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { Message } from '../../src/types';
import { fetchVenues } from './venueService';
import kb from './knowledgeBase.json';

// OlyBars Constitution Rule: Use us-west1 for all resources.
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'ama-ecosystem-prod';
const LOCATION = 'us-west1';

const client = new GoogleGenAI({
    project: PROJECT_ID,
    location: LOCATION,
});

const BASE_SYSTEM_INSTRUCTION = `
### IDENTITY
You are **${kb.persona.name}**, the ${kb.persona.title}. ${kb.persona.tagline}.
Vibes: ${kb.persona.vibes.join(', ')}.

### CORE DIRECTIVES (PRIME DIRECTIVES)
${kb.directives.map((d, i) => `${i + 1}. ${d}`).join('\n')}

### FAQ & LORE
${kb.faq.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n')}
Lore: ${kb.lore.origin}
Artesian Well: ${kb.lore.artesian_well}
Local Slang: ${Object.entries(kb.lore.local_knowledge).map(([k, v]) => `${k} = ${v}`).join(', ')}

### STYLE
${kb.persona.tone} Always mention "${kb.persona.tagline}" when appropriate.
`;

export const getArtieResponse = async (userMessage: string, history: Message[]): Promise<string> => {
    try {
        // LEVEL 1 RAG: Fetch real-time venue status to inform Artie's brain
        const venues = await fetchVenues();
        const venueContext = venues
            .map(v => `- ${v.name}: ${v.status.toUpperCase()} (${v.vibe})`)
            .join('\n');

        const currentInstruction = `${BASE_SYSTEM_INSTRUCTION}

### CURRENT OLYMPIA PULSE
${venueContext}

Use this real-time data to answer questions about what is happening right now in town.`;

        const result = await client.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
                { role: 'user', parts: [{ text: currentInstruction }] },
                ...history.map(msg => ({
                    role: msg.role === 'model' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                })),
                { role: 'user', parts: [{ text: userMessage }] }
            ],
            // Vertex AI Node SDK uses snake_case in some versions or safety_settings
            safety_settings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
            ]
        });

        const candidates = result.response.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content?.parts?.length > 0) {
            return candidates[0].content.parts[0].text || "I'm drawing a blank, friend.";
        }
        return "I'm having trouble thinking today. Try again?";
    } catch (error) {
        console.error('Error in Artie AI Relay:', error);
        return "I'm having trouble connecting to the Artesian Well. Check your connection!";
    }
};
