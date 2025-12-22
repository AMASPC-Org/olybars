import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bot } from 'lucide-react';
import { getArtieResponse } from '../../../services/geminiService';
import { Message } from '../../../types';

interface ArtieChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ArtieChatModal: React.FC<ArtieChatModalProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'initial',
            role: 'model',
            text: "Cheers! I'm Artie, your local guide powered by Well 80 Artesian Water. Ask me anything about Oly's bars, deals, or events!",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput('');
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await getArtieResponse(userText, messages);
            const artieMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, artieMsg]);
        } catch (error) {
            console.error('Artie error:', error);
            const artieError: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: "My artesians are a bit clogged right now. Try again in a minute?",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, artieError]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="bg-surface border-2 border-primary/20 w-full max-w-sm h-[600px] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-primary/10 border-b border-primary/20 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                            <Bot className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight font-league">Artie Concierge</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[9px] text-primary font-bold uppercase tracking-widest">Online & Pouring</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                    {messages.map((m, i) => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed ${m.role === 'user'
                                ? 'bg-primary text-black rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'
                                }`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-surface border-t border-white/5">
                    <div className="flex gap-2 bg-black/40 border-2 border-slate-800 focus-within:border-primary/50 rounded-2xl p-1.5 transition-all">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask Artie..."
                            className="flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-600 font-medium"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="bg-primary hover:bg-yellow-400 text-black p-2.5 rounded-xl disabled:opacity-50 disabled:hover:bg-primary transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex justify-center mt-2 items-center gap-3">
                        <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 m-0">
                            <Sparkles className="w-3 h-3" /> Powered by Well 80 Artesian AI
                        </p>
                        <span className="text-slate-700 text-[10px]">•</span>
                        <a
                            href="/meet-artie"
                            onClick={(e) => {
                                e.preventDefault();
                                onClose();
                                window.location.href = '/meet-artie'; // Using window.location for reliability outside generic Router context inside modal
                            }}
                            className="text-[10px] text-slate-600 font-bold uppercase tracking-widest hover:text-primary transition-colors cursor-pointer"
                        >
                            Artie's Story
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
