import { GoogleGenAI, Chat } from "@google/genai";
import { Message } from '../types';
import { MOCK_VENUES } from './mockData';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are Artie, the OlyBars Concierge, "Powered by Well 80 Brewhouse".
You are a knowledgeable local guide for Olympia, WA nightlife.
You have a warm, slightly witty personality. You love craft beer and trivia.

Current Venue Statuses (The Pulse):
${JSON.stringify(MOCK_VENUES.map(v => ({ 
  name: v.name, 
  status: v.status, 
  deal: v.deal, 
  event: v.leagueEvent,
  tags: v.alertTags
})))}

Your Goal:
Help users decide where to go based on "The Pulse".
- If they want excitement, check for 'buzzing' venues.
- If they like games, mention the League Events (Karaoke, Trivia, Arcade).
- Remind them they can earn points by Clocking In (limit 2 per 12 hours) and taking Vibe Photos.
- Always keep it brief (under 50 words).
- If asked about yourself, mention you are powered by Well 80.
`;

let chatSession: Chat | null = null;

export const getArtieResponse = async (userMessage: string, history: Message[]): Promise<string> => {
  try {
    if (!chatSession) {
      chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: SYSTEM_INSTRUCTION },
        history: history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }))
      });
    }

    const response = await chatSession.sendMessage({ message: userMessage });
    return response.text || "I'm having trouble connecting to the network. Ask me again in a sec.";
  } catch (error) {
    console.error("Artie Error:", error);
    return "The wifi is spotty here. Say that again?";
  }
};