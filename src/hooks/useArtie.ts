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

    const sendMessage = async (prompt: string, userId?: string, userRole?: string, hpValue?: string) => {
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
                    userRole,
                    _hp_id: hpValue // [SECURITY] Honeypot detection
                })
            });

            if (!response.ok) {
                throw new Error(`Artie connection failed: ${response.statusText}`);
            }

            const contentType = response.headers.get('Content-Type');

            if (contentType?.includes('application/json')) {
                // Handle fallback JSON response (e.g. triage/safety/banned)
                const result = await response.json();
                const modelMessage: Message = { role: 'model', content: result.data };
                setMessages(prev => [...prev, modelMessage]);
            } else {
                // Handle streaming response
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let accumulatedContent = '';

                // Add empty model message to start streaming into
                setMessages(prev => [...prev, { role: 'model', content: '' }]);

                if (reader) {
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            const chunk = decoder.decode(value, { stream: true });
                            accumulatedContent += chunk;

                            setMessages(prev => {
                                const newMessages = [...prev];
                                const lastMsg = newMessages[newMessages.length - 1];
                                if (lastMsg && lastMsg.role === 'model') {
                                    lastMsg.content = accumulatedContent;
                                }
                                return newMessages;
                            });
                        }
                    } catch (streamErr) {
                        // [STREAM_RESILIENCE] Gracefully handle network/stream interruptions
                        console.warn("Artie stream interrupted. Keeping partial response.", streamErr);
                        // The loop breaks, we keep what we have in accumulatedContent
                    } finally {
                        reader.releaseLock();
                    }
                }
            }

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
