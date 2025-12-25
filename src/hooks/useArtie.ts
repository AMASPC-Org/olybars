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

    const sendMessage = async (prompt: string, userId?: string, userRole?: string) => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);

        // Optimistic update: Add user message immediately
        const userMessage: Message = { role: 'user', content: prompt };
        const newHistory = [...messages, userMessage];
        setMessages(newHistory);

        try {
            const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

            // Convert internal message format to the simple role/content pairs Artie expects
            const historyForArtie = messages.map(m => ({
                role: m.role,
                content: m.content
            })).slice(-10);

            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: prompt,
                    history: historyForArtie,
                    userId,
                    userRole
                })
            });

            if (!response.ok) {
                throw new Error(`Artie connection failed: ${response.statusText}`);
            }

            const result = await response.json();

            // Add model response
            const modelMessage: Message = { role: 'model', content: result.data };
            setMessages(prev => [...prev, modelMessage]);

        } catch (err: any) {
            console.error("Artie hook failure:", err);
            setError(err.message || "Artie is having trouble connecting to the hive mind.");
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
