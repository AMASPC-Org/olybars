import React, { useState, useRef, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export const ArtieChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Hey! I'm Artie, your OlyBars guide. Looking for a happy hour or a specific vibe?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const artieChat = httpsCallable<{ history: Message[], question: string }, string>(functions, 'artieChat');

            // Hardening: Slice history to last 10 turns to save tokens and prevent context overflow
            const historyForModel = messages
                .filter(m => m.role === 'user' || m.role === 'model')
                .slice(-10);

            const result = await artieChat({
                history: historyForModel,
                question: userMsg.content
            });

            const responseText = result.data;
            setMessages(prev => [...prev, { role: 'model', content: responseText }]);
        } catch (error) {
            console.error("Artie failed:", error);
            setMessages(prev => [...prev, { role: 'model', content: "Oof, I spilt my drink. (Network Error). Can you ask that again?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-body">
            {/* Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-oly-navy hover:bg-slate-800 text-oly-gold p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-oly-gold/20"
                >
                    <Sparkles className="mr-2 text-oly-gold animate-pulse" size={20} />
                    <span className="font-league font-bold text-lg tracking-wide hidden sm:inline">ASK ARTIE</span>
                    <MessageCircle size={24} className="sm:hidden" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-surface/95 backdrop-blur-md border border-slate-600/50 rounded-2xl shadow-2xl w-[90vw] sm:w-96 h-[600px] max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-oly-navy/90 p-4 flex justify-between items-center border-b border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="bg-oly-gold text-oly-navy p-2 rounded-full">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h3 className="text-white font-league text-xl font-bold tracking-wide leading-none">ARTIE</h3>
                                <p className="text-xs text-slate-400 font-body">Powered by Well 80</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-700">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-slate-700 text-slate-100 rounded-bl-sm border border-slate-600'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-700 p-4 rounded-2xl rounded-bl-sm text-slate-300 text-xs flex items-center gap-2">
                                    <Sparkles size={14} className="animate-spin text-oly-gold" />
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-surface border-t border-slate-700 flex gap-2">
                        <input
                            className="flex-1 bg-slate-900/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-oly-gold border border-slate-600 placeholder-slate-500 transition-all"
                            placeholder="Ask about cheap beer or vibes..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            className="bg-oly-gold text-oly-navy p-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50 disabled:scale-95 transition-all shadow-lg shadow-yellow-900/20"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
