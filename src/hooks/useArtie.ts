import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

export interface Message {
    role: 'user' | 'model';
    content: string;
}

export function useArtie() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = async (prompt: string) => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);

        // Optimistic update: Add user message immediately
        const userMessage: Message = { role: 'user', content: prompt };
        const newHistory = [...messages, userMessage];
        setMessages(newHistory);

        try {
            const artieChat = httpsCallable<{ history: Message[], question: string }, string>(functions, 'artieChat');

            // Convert internal message format to the simple role/content pairs Artie expects
            const historyForArtie = messages.map(m => ({
                role: m.role,
                content: m.content
            })).slice(-10); // Hardening: prevent context overflow

            const result = await artieChat({
                question: prompt,
                history: historyForArtie
            });

            // Add model response
            const modelMessage: Message = { role: 'model', content: result.data };
            setMessages(prev => [...prev, modelMessage]);

        } catch (err: any) {
            console.error("Artie connection failed:", err);
            setError(err.message || "Artie is having trouble connecting to the hive mind.");
            // Optionally remove the optimistic user message or show an error state
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = () => setMessages([]);

    return {
        messages,
        sendMessage,
        isLoading,
        error,
        clearHistory
    };
}
