import { Message } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
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
