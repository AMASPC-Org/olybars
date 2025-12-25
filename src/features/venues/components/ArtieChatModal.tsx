import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bot, CheckCircle2 } from 'lucide-react';
import { useArtie } from '../../../hooks/useArtie';
import { useToast } from '../../../components/ui/BrandedToast';
import { UserProfile } from '../../../types';

interface ArtieChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile?: UserProfile;
}

interface ArtieAction {
    skill: string;
    params: Record<string, any>;
    venueId?: string;
}

export const ArtieChatModal: React.FC<ArtieChatModalProps> = ({ isOpen, onClose, userProfile }) => {
    const { messages, sendMessage, isLoading, error } = useArtie();
    const { showToast } = useToast();
    const [input, setInput] = useState('');
    const [pendingAction, setPendingAction] = useState<ArtieAction | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        // Check for pending actions or suggestions in the last message
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'model') {
            // Actions
            if (lastMessage.content.includes('[ACTION]:')) {
                try {
                    const actionJson = lastMessage.content.split('[ACTION]:')[1].trim();
                    const action = JSON.parse(actionJson) as ArtieAction;
                    setPendingAction(action);
                } catch (e) {
                    console.error("Failed to parse Artie action:", e);
                }
            }

            // Suggestions
            if (lastMessage.content.includes('[SUGGESTIONS]:')) {
                try {
                    const suggJson = lastMessage.content.split('[SUGGESTIONS]:')[1].trim();
                    const suggs = JSON.parse(suggJson) as string[];
                    setSuggestions(suggs);
                } catch (e) {
                    console.error("Failed to parse Artie suggestions:", e);
                }
            } else {
                setSuggestions([]);
            }
        }
    }, [messages, isLoading]);

    const handleSend = async (text?: string) => {
        const userText = text || input.trim();
        if (!userText || isLoading) return;

        setInput('');
        setPendingAction(null);
        setSuggestions([]);
        setActionStatus('idle');
        await sendMessage(userText, userProfile?.uid, userProfile?.role);
    };

    const handleSuggestionClick = (suggestion: string) => {
        handleSend(suggestion);
    };

    const handleConfirmAction = async () => {
        if (!pendingAction || !userProfile) return;

        setActionStatus('loading');
        try {
            const { VenueOpsService } = await import('../../../services/VenueOpsService');
            // Use venueId from action, or fallback to user's homeBase
            const venueId = pendingAction.venueId || userProfile.homeBase;

            if (!venueId) {
                showToast("No venue context found. Please specify which venue to update.", "error");
                setActionStatus('error');
                return;
            }

            let successMessage = "Update complete!";

            switch (pendingAction.skill) {
                case 'update_flash_deal':
                    await VenueOpsService.updateFlashDeal(venueId, {
                        title: pendingAction.params.summary,
                        description: pendingAction.params.details,
                        price: pendingAction.params.price,
                        isActive: true
                    });
                    successMessage = `FLASH DEAL: ${pendingAction.params.summary} is now LIVE!`;
                    break;
                case 'update_hours':
                    await VenueOpsService.updateHours(venueId, pendingAction.params.hours);
                    successMessage = `OFFICIAL HOURS: Updated to ${pendingAction.params.hours}`;
                    break;
                case 'update_happy_hour':
                    await VenueOpsService.updateHappyHour(venueId, {
                        schedule: pendingAction.params.schedule,
                        specials: pendingAction.params.specials
                    });
                    successMessage = `HAPPY HOUR: ${pendingAction.params.schedule} is now set!`;
                    break;
                case 'add_event':
                    await VenueOpsService.addEvent(venueId, {
                        type: pendingAction.params.type,
                        time: pendingAction.params.time,
                        description: pendingAction.params.description
                    });
                    successMessage = `NEW EVENT: ${pendingAction.params.type} added for ${pendingAction.params.time}!`;
                    break;
                default:
                    throw new Error(`Unknown skill: ${pendingAction.skill}`);
            }

            setActionStatus('success');
            showToast(`SUCCESS: ${successMessage}`, 'success');

            // Auto-clear success message after 3 seconds
            setTimeout(() => {
                setPendingAction(null);
                setActionStatus('idle');
            }, 3000);
        } catch (e: any) {
            console.error("Action Failed:", e);
            showToast(`Action failed: ${e.message}`, 'error');
            setActionStatus('error');
        }
    };

    const handleEditAction = () => {
        if (!pendingAction) return;

        // Simplify Edit template for better parsing
        const editContent = `Draft Correction: "${pendingAction.params.summary || pendingAction.params.hours || pendingAction.params.type}". Let's change it to: `;

        setInput(editContent);
        setPendingAction(null);
        setActionStatus('idle');

        // Focus the input field
        const inputElement = document.querySelector('input[placeholder="Ask Artie..."]') as HTMLInputElement;
        if (inputElement) {
            inputElement.focus();
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
                    {/* Static Greeting */}
                    {messages.length === 0 && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none">
                                Cheers! I&apos;m Artie, your local guide powered by Well 80 Artesian Water. Ask me anything about Oly&apos;s bars, deals, or events!
                            </div>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed ${m.role === 'user'
                                ? 'bg-primary text-black rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'
                                }`}>
                                {m.content.split('[ACTION]:')[0].split('[SUGGESTIONS]:')[0].trim()}
                            </div>
                        </div>
                    ))}

                    {/* Pending Action Card */}
                    {pendingAction && (
                        <div className="flex justify-center my-4 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-gradient-to-br from-slate-800 to-black border-2 border-primary/50 p-4 rounded-2xl shadow-xl w-full max-w-[90%]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Action Required</span>
                                </div>
                                <h4 className="text-white font-bold text-sm mb-1">Update Flash Deal</h4>
                                <p className="text-slate-400 text-xs mb-4 italic">&ldquo;{pendingAction.summary}&rdquo;</p>

                                {actionStatus === 'success' ? (
                                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Update Deployed!</span>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleConfirmAction}
                                            disabled={actionStatus === 'loading'}
                                            className="flex-1 bg-primary hover:bg-yellow-400 text-black font-black text-[10px] py-2 rounded-lg uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            {actionStatus === 'loading' ? 'Deploying...' : 'Deploy Now'}
                                        </button>
                                        <button
                                            onClick={handleEditAction}
                                            disabled={actionStatus === 'loading'}
                                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-black text-[10px] py-2 rounded-lg uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setPendingAction(null)}
                                            disabled={actionStatus === 'loading'}
                                            className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black text-[10px] py-2 rounded-lg uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="flex justify-center">
                            <div className="bg-red-500/10 text-red-400 text-xs p-2 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-surface border-t border-white/5 space-y-3">
                    {/* Suggestions */}
                    {!isLoading && suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {suggestions.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSuggestionClick(s)}
                                    className="bg-slate-800 hover:bg-slate-700 text-primary text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-primary/20 transition-all active:scale-95"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

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
                                window.location.href = '/meet-artie';
                            }}
                            className="text-[10px] text-slate-600 font-bold uppercase tracking-widest hover:text-primary transition-colors cursor-pointer"
                        >
                            Artie&apos;s Story
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
