import { Message } from '../types';

// IMPORTANT: Replace this with the actual URL of your deployed Google Cloud Function.
const CLOUD_FUNCTION_URL = 'https://us-west1-your-gcp-project-id.cloudfunctions.net/getArtieResponse';

/**
 * Sends a user's message to the secure backend proxy, which then communicates with the Gemini API.
 * This approach keeps the API key secure on the server side.
 *
 * @param userMessage The message typed by the user.
 * @param history The previous chat messages to provide context.
 * @returns The text response from the Gemini model.
 */
export const getArtieResponse = async (userMessage: string, history: Message[]): Promise<string> => {
  try {
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        // Map the message format to what the Google GenAI SDK expects for history.
        history: history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        })),
      }),
    });

    if (!response.ok) {
      console.error("API call failed with status:", response.status);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      return "The network is a bit spotty here. Could you say that again?";
    }

    const data = await response.json();
    return data.text || "Sorry, I'm drawing a blank right now. Try asking again.";

  } catch (error) {
    console.error("Error calling the Artie backend service:", error);
    return "I'm having trouble connecting to the network. Please check your connection.";
  }
};