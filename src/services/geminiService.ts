import { Message } from '../types';

const VITE_API_URL = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.MODE === 'development';

// Force local relay in dev mode to avoid CORS/connection issues with production backend
const API_BASE_URL = isDev
  ? 'http://localhost:3000/api'
  : (VITE_API_URL || 'https://olybars-backend-juthzlaerq-uw.a.run.app/api');

console.log('[Artie] Environment:', import.meta.env.MODE);
console.log('[Artie] Connecting to:', API_BASE_URL);

/**
 * Sends a chat message to the Artie AI relay on the production backend.
 */
export const getArtieResponse = async (text: string, history: Message[]): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        history: history,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Relay error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error in getArtieResponse:', error);
    return "I'm having a hard time reaching the well. Try again later, friend!";
  }
};
