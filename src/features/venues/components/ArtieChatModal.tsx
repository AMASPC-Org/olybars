import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bot, CheckCircle2 } from 'lucide-react';
import { useArtie } from '../../../hooks/useArtie';
import { useToast } from '../../../components/ui/BrandedToast';
import { UserProfile } from '../../../types';
import artieLogo from '../../../assets/Artie-Only-Logo.png';

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

interface ArtieGreeting {
    message: string;
    status: string;
}

const getArtieGreeting = (profile?: UserProfile): ArtieGreeting => {
    // Coach Mode for Logged In Users
    if (profile && profile.handle) {
        const pointsToTop = 50; // Mocked for now
        return {
            message: `Welcome back, ${profile.handle}. You're ${pointsToTop} points behind the Leaderboard Top 10. Want a high-value target?`,
            status: "COACH MODE ACTIVE"
        };
    }

    const hour = new Date().getHours();

    // Helper to pick a random item from an array
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    // Workday (2 PM - 5 PM)
    if (hour >= 14 && hour < 17) {
        return {
            message: pick([
                "Clock’s ticking. I know 3 spots with open tables and cheap pints. Thirsty?",
                "Ready to ditch the desk? The first round of happy hours is just getting started.",
                "Workday is winding down. I've got the intel on where the quietest booths are."
            ]),
            status: pick(["DECOMPRESSING", "POURING EARLY", "TAPPING FRESH"])
        };
    }

    // Prime Time (5 PM - 9 PM)
    if (hour >= 17 && hour < 21) {
        return {
            message: pick([
                "Kitchens are open and the vibes are climbing. Need a dinner spot or a pre-game?",
                "The city is hitting its stride. Want to know where the shortest lines are right now?",
                "Hungry? Hannah's and Well 80 are cooking. Where are we heading?"
            ]),
            status: pick(["VIBES CLIMBING", "KITCHENS ACTIVE", "PRIME TIME"])
        };
    }

    // Late Night (9 PM - 2 AM)
    if (hour >= 21 || hour < 2) {
        return {
            message: pick([
                "Altitude 15 is buzzing, but The Brotherhood is chill. What’s your speed tonight?",
                "Night is young for some, ending for others. Need a nightcap or a dance floor?",
                "I've got the latest vibe reports. Where's the party at?"
            ]),
            status: pick(["IN THE MIX", "LAST CALL INTEL", "NIGHTSHIFT ACTIVE"])
        };
    }

    // Default/Morning Fallback
    return {
        message: "Cheers! I'm Artie, your local guide. Ask me anything about Oly's bars, deals, or events!",
        status: "ONLINE & POURING"
    };
};

export const ArtieChatModal: React.FC<ArtieChatModalProps> = ({ isOpen, onClose, userProfile }) => {
    const { messages, sendMessage, isLoading, error } = useArtie();
    const { showToast } = useToast();
    const [input, setInput] = useState('');
    const [pendingAction, setPendingAction] = useState<ArtieAction | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [greeting, setGreeting] = useState<ArtieGreeting | null>(null);
    const [hpValue, setHpValue] = useState(''); // Honeypot value
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Set greeting once on open
    useEffect(() => {
        if (isOpen && !greeting) {
            setGreeting(getArtieGreeting(userProfile));
            // Default suggestions for new users
            setSuggestions([
                "Who's winning?",
                "Happy Hour now?",
                "Trivia tonight?",
                "Local Makers"
            ]);
        }
    }, [isOpen, userProfile]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        // Check for pending actions or suggestions in the last message
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'model') {
            // Wait for stream to finish before parsing JSON blocks to avoid partial parse errors
            if (!isLoading) {
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
                } else if (!lastMessage.content.includes('[ACTION]:')) {
                    // Only clear suggestions if there isn't a pending action occupying the user's attention
                    setSuggestions([]);
                }
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

        // Include honeypot value in request (should be empty for humans)
        await sendMessage(userText, userProfile?.uid, userProfile?.role, hpValue);
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
                        duration: pendingAction.params.duration,
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
                case 'update_profile':
                    await VenueOpsService.updateProfile(venueId, {
                        website: pendingAction.params.website,
                        instagram: pendingAction.params.instagram,
                        facebook: pendingAction.params.facebook,
                        description: pendingAction.params.description
                    });
                    successMessage = "VENUE PROFILE: Successfully matched and updated.";
                    break;
                case 'draft_social_post':
                    await VenueOpsService.saveDraft(venueId, {
                        topic: pendingAction.params.topic,
                        copy: pendingAction.params.copy,
                        type: 'social'
                    });
                    successMessage = "DRAFT SAVED: Your social post is ready for the specialty agent.";
                    break;
                case 'ideate_event':
                    await VenueOpsService.saveDraft(venueId, {
                        topic: 'Event Ideation',
                        copy: pendingAction.params.concepts,
                        type: 'ideation'
                    });
                    successMessage = "CONCEPTS SAVED: Review these ideas in your Owner Dashboard.";
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
                        <div className="bg-primary p-0.5 rounded-xl shadow-lg shadow-primary/20 overflow-hidden w-14 h-14 flex items-center justify-center">
                            <img src={artieLogo} className="w-full h-full object-cover scale-110" alt="Artie Wells" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight font-league">Artie Wells</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[9px] text-primary font-bold uppercase tracking-widest">{greeting?.status || "Online & Pouring"}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                    {/* Dynamic Greeting */}
                    {messages.length === 0 && greeting && (
                        <div className="space-y-4">
                            <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none">
                                    {greeting.message}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Current Mode Badge */}
                    {userProfile && (userProfile.role === 'owner' || userProfile.role === 'manager' || userProfile.role === 'admin' || userProfile.role === 'super-admin') && (
                        <div className="flex justify-center -mt-2 mb-2">
                            <div className="bg-primary/20 border border-primary/30 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                                <Bot className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Operator Mode Active</span>
                            </div>
                        </div>
                    )}

                    {messages.map((m, i) => {
                        // Clean message content: strip [RATIONALE], [ACTION], and [SUGGESTIONS]
                        let displayContent = m.content;
                        if (m.role === 'model') {
                            console.log(`[ARTIE_DEBUG] Raw model content:`, m.content);

                            // 1. Strip Rationale (Everything from [RATIONALE]: to the first newline OR the start of the message)
                            if (displayContent.includes('[RATIONALE]:')) {
                                const parts = displayContent.split('[RATIONALE]:');
                                // If rationale is at the start, take everything after the first rationale block
                                if (displayContent.trim().startsWith('[RATIONALE]:')) {
                                    // Find where the next line or content starts
                                    const contentAfterRationale = parts[1].split('\n').slice(1).join('\n').trim();
                                    displayContent = contentAfterRationale || parts[1].replace(/.*?\n/, '').trim();
                                } else {
                                    // If rationale is elsewhere (shouldn't be), just remove the tag and its immediate text
                                    displayContent = parts[0] + (parts[1].includes('\n') ? parts[1].substring(parts[1].indexOf('\n')) : '');
                                }
                            }

                            // 2. Strip Actions and Suggestions
                            displayContent = displayContent
                                .split('[ACTION]:')[0]
                                .split('[SUGGESTIONS]:')[0]
                                .trim();

                            console.log(`[ARTIE_DEBUG] Cleaned content:`, displayContent);
                        }

                        return (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed ${m.role === 'user'
                                    ? 'bg-primary text-black rounded-tr-none'
                                    : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'
                                    }`}>
                                    {displayContent}
                                </div>
                            </div>
                        );
                    })}

                    {/* Pending Action Card */}
                    {pendingAction && (
                        <div className="flex justify-center my-4 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-gradient-to-br from-slate-800 to-black border-2 border-primary/50 p-4 rounded-2xl shadow-xl w-full max-w-[90%]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                        {pendingAction.skill.includes('draft') || pendingAction.skill.includes('ideate') ? 'Creative Draft' : 'Action Required'}
                                    </span>
                                </div>
                                <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-tight">
                                    {pendingAction.skill.split('_').join(' ')}
                                </h4>
                                <div className="bg-black/30 p-2 rounded-lg border border-white/5 mb-4">
                                    <p className="text-slate-300 text-[11px] font-medium leading-relaxed italic">
                                        &ldquo;{pendingAction.params.summary || pendingAction.params.topic || pendingAction.params.hours || pendingAction.params.type || 'Updating details...'}&rdquo;
                                    </p>
                                </div>

                                {actionStatus === 'success' ? (
                                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Success Deployed!</span>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleConfirmAction}
                                            disabled={actionStatus === 'loading'}
                                            className="flex-1 bg-primary hover:bg-yellow-400 text-black font-black text-[10px] py-2 rounded-lg uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            {actionStatus === 'loading' ? 'Processing...' : (pendingAction.skill.includes('draft') || pendingAction.skill.includes('ideate') ? 'Save Draft' : 'Deploy Now')}
                                        </button>
                                        <button
                                            onClick={handleEditAction}
                                            disabled={actionStatus === 'loading'}
                                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-black text-[10px] py-2 rounded-lg uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            Edit
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
                        {/* Honeypot Field (Invisible to humans) */}
                        <div style={{ display: 'none' }} aria-hidden="true">
                            <input
                                type="text"
                                name="_hp_id"
                                value={hpValue}
                                onChange={(e) => setHpValue(e.target.value)}
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>
                        <button
                            onClick={() => handleSend()}
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
