import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bot, CheckCircle2, Mic, MicOff, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';
import { useArtie } from '../../../hooks/useArtie';
import { useArtieOps, ArtieMessage } from '../../../hooks/useArtieOps'; // [NEW] Import Ops Hook
import { QuickReplyChips, QuickReplyOption } from '../../../components/artie/QuickReplyChips'; // [NEW] Import Chips
import { useToast } from '../../../components/ui/BrandedToast';
import { useNavigate } from 'react-router-dom';
import { UserProfile, isSystemAdmin, hasVenueAccess } from '../../../types';
import artieLogo from '../../../assets/Artie-Only-Logo.png';
import schmidtLogo from '../../../assets/Schmidt-Only-Logo (40 x 40 px).png';

interface ArtieChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile?: UserProfile;
    initialVenueId?: string; // [NEW] Track the venue context
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
        // [OPS MODE] Greeting is handled by the Ops Hook, this is just for the Badge status
        if (profile.role === 'owner' || profile.role === 'manager') {
            return {
                message: "Initializing Venue Ops...",
                status: "OPS LINK ESTABLISHED"
            };
        }

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
                "Double Tap is buzzing, but The Brotherhood is chill. What’s your speed tonight?",
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

export const ArtieChatModal: React.FC<ArtieChatModalProps> = ({ isOpen, onClose, userProfile, initialVenueId }) => {
    // --- 1. Mode Determination ---
    const isOpsMode = !((window as any)._artie_force_guest) && userProfile && (isSystemAdmin(userProfile) || userProfile.role === 'owner' || userProfile.role === 'manager');

    // --- 2. Hooks (Always call both, control usage via flags) ---
    // Guest Hook
    const guestArtie = useArtie();
    // Ops Hook
    const opsArtie = useArtieOps();

    const { showToast } = useToast();
    const [input, setInput] = useState('');
    const [pendingAction, setPendingAction] = useState<ArtieAction | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [greeting, setGreeting] = useState<ArtieGreeting | null>(null);
    const [hpValue, setHpValue] = useState(''); // Honeypot value
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [hasInitializedOps, setHasInitializedOps] = useState(false); // Validates start of Ops Session
    const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
        }
    }, [transcript]);

    // --- 3. Initialization ---
    useEffect(() => {
        if (isOpen && !greeting) {
            setGreeting(getArtieGreeting(userProfile));

            // Set global venue context for the LLM Guest Hook to pick up
            const venueContext = initialVenueId || userProfile?.homeBase;
            if (venueContext) {
                (window as any)._artie_venue_id = venueContext;
            }

            if (isOpsMode) {
                // Initialize Ops Session
                if (!hasInitializedOps) {
                    const venueId = initialVenueId || userProfile.homeBase;
                    opsArtie.processAction('START_SESSION', undefined, venueId);
                    setHasInitializedOps(true);
                }
            } else {
                // Default suggestions for Guest
                setSuggestions([
                    "Who's winning?",
                    "Happy Hour now?",
                    "Trivia tonight?",
                    "Local Makers"
                ]);
            }
        }
        // Reset when closed
        if (!isOpen) {
            setHasInitializedOps(false);
        }
    }, [isOpen, userProfile, isOpsMode]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- 4. Guest Mode Effects (Live Chat Stream) ---
    useEffect(() => {
        if (isOpsMode) return; // Skip if in Ops Mode

        scrollToBottom();
        const lastMessage = guestArtie.messages[guestArtie.messages.length - 1];
        if (lastMessage?.role === 'model') {
            if (!guestArtie.isLoading) {
                // ... (Existing parsing logic for Guest Actions/Suggestions)
                if (lastMessage.content.includes('[ACTION]:')) {
                    try {
                        const actionJson = lastMessage.content.split('[ACTION]:')[1].trim();
                        const action = JSON.parse(actionJson) as ArtieAction;
                        setPendingAction(action);
                    } catch (e) { }
                }
                if (lastMessage.content.includes('[SUGGESTIONS]:')) {
                    try {
                        const suggJson = lastMessage.content.split('[SUGGESTIONS]:')[1].trim();
                        const suggs = JSON.parse(suggJson) as string[];
                        setSuggestions(suggs);
                    } catch (e) { }
                }
            }
        }
    }, [guestArtie.messages, guestArtie.isLoading, isOpsMode]);

    // --- 5. Ops Mode Effects ---
    useEffect(() => {
        if (!isOpsMode) return;
        scrollToBottom();

        // Check if Ops Hook produced a draft
        if (opsArtie.draftData && opsArtie.opsState === 'confirm_action') {
            // Translate internal Draft to UI PendingAction
            setPendingAction({
                skill: opsArtie.draftData.skill,
                params: opsArtie.draftData.params,
                venueId: initialVenueId || userProfile?.homeBase
            });
        }
    }, [opsArtie.messages, opsArtie.opsState, opsArtie.draftData, isOpsMode]);


    // --- 6. Handlers ---
    const handleSend = async (text?: string) => {
        const userText = text || input.trim();
        if (!userText) return;

        setInput('');

        if (isOpsMode) {
            const venueId = initialVenueId || userProfile?.homeBase;
            // In Ops mode, check if we are in a specific input step
            if (opsArtie.opsState === 'flash_deal_input') {
                await opsArtie.processAction('SUBMIT_DEAL_TEXT', userText);
            } else if (opsArtie.opsState === 'event_input') {
                await opsArtie.processAction('SUBMIT_EVENT_TEXT', userText);
            } else if (opsArtie.opsState === 'social_post_input') {
                await opsArtie.processAction('SUBMIT_SOCIAL_POST_TEXT', userText, venueId);
            } else if (opsArtie.opsState === 'email_draft_input') {
                await opsArtie.processAction('SUBMIT_EMAIL_TEXT', userText, venueId);
            } else if (opsArtie.opsState === 'calendar_post_input') {
                await opsArtie.processAction('SUBMIT_CALENDAR_TEXT', userText, venueId);
            } else if (opsArtie.opsState === 'website_content_input') {
                await opsArtie.processAction('SUBMIT_WEB_TEXT', userText, venueId);
            } else if (opsArtie.opsState === 'image_gen_purpose') {
                await opsArtie.processAction('SUBMIT_IMAGE_PURPOSE', userText, venueId);
            } else if (opsArtie.opsState === 'image_gen_goal') {
                await opsArtie.processAction('SUBMIT_IMAGE_GOAL', userText, venueId);
            } else if (opsArtie.opsState === 'image_gen_event') {
                await opsArtie.processAction('SUBMIT_IMAGE_EVENT', userText, venueId);
            } else if (opsArtie.opsState === 'image_gen_audience') {
                await opsArtie.processAction('SUBMIT_IMAGE_AUDIENCE', userText, venueId);
            } else if (opsArtie.opsState === 'image_gen_specials') {
                await opsArtie.processAction('SUBMIT_IMAGE_SPECIALS', userText, venueId);
            } else if (opsArtie.opsState === 'image_gen_context') {
                await opsArtie.processAction('SUBMIT_IMAGE_CONTEXT', userText, venueId);
            } else {
                // General chat fallback for partners
                await guestArtie.sendMessage(userText, userProfile?.uid, userProfile?.role, hpValue, 'Schmidt');
            }
        } else {
            // Guest Mode: Send to LLM
            setPendingAction(null);
            setSuggestions([]);
            setActionStatus('idle');
            await guestArtie.sendMessage(userText, userProfile?.uid, userProfile?.role, hpValue, 'Artie');
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        handleSend(suggestion);
    };

    // Handler for Chips
    const handleChipSelect = (option: QuickReplyOption) => {
        const venueId = initialVenueId || userProfile?.homeBase;
        opsArtie.processAction(option.value, undefined, venueId);
    };

    const handleConfirmAction = async () => {
        if (!pendingAction || !userProfile) return;

        setActionStatus('loading');
        try {
            const { VenueOpsService } = await import('../../../services/VenueOpsService');
            const venueId = pendingAction.venueId || userProfile.homeBase;

            if (!venueId) {
                showToast("Whoops! I need to know which venue we're working on. Try opening me from a bar profile!", "error");
                setActionStatus('error');
                return;
            }

            let successMessage = "Update complete!";

            // --- EXECUTE SKILL ---
            switch (pendingAction.skill) {
                case 'schedule_flash_deal':
                    await VenueOpsService.scheduleFlashBounty(venueId, {
                        title: pendingAction.params.summary,
                        description: pendingAction.params.details,
                        price: pendingAction.params.price,
                        startTime: new Date(pendingAction.params.startTimeISO).getTime(),
                        endTime: new Date(pendingAction.params.startTimeISO).getTime() + (Number(pendingAction.params.duration) * 60000),
                        durationMinutes: Number(pendingAction.params.duration),
                        status: 'PENDING',
                        createdBy: 'ARTIE',
                        staffBriefingConfirmed: true,
                        offerDetails: pendingAction.params.summary,
                        terms: pendingAction.params.details
                    });
                    successMessage = "Flash Bounty Scheduled!";
                    // Notify Ops Hook to advance state
                    opsArtie.processAction('confirm_post');
                    break;

                case 'add_menu_item':
                    await VenueOpsService.addMenuItem(venueId, {
                        category: pendingAction.params.category,
                        name: pendingAction.params.name,
                        description: pendingAction.params.description,
                        price: pendingAction.params.price
                    });
                    successMessage = "Menu Item Added!";
                    break;

                case 'promote_menu_item':
                    await VenueOpsService.saveDraft(venueId, {
                        topic: `Promoting ${pendingAction.params.item_name}`,
                        copy: pendingAction.params.copy,
                        type: 'SOCIAL_PROMO'
                    });
                    successMessage = "Social Post Drafted!";
                    break;

                case 'emergency_closure':
                    await VenueOpsService.emergencyClosure(venueId, {
                        reason: pendingAction.params.reason,
                        duration: pendingAction.params.duration
                    });
                    successMessage = "Venue Closed & Buzz Clock Cleared!";
                    break;

                case 'update_order_url':
                    await VenueOpsService.updateOrderUrl(venueId, pendingAction.params.url);
                    successMessage = "Order URL Updated!";
                    break;

                case 'draft_email':
                    await VenueOpsService.draftEmail(venueId, pendingAction.params as { subject: string; body: string });
                    successMessage = "Email Draft Saved!";
                    break;

                case 'add_to_calendar':
                    await VenueOpsService.addToCalendar(venueId, pendingAction.params as { summary: string });
                    successMessage = "Added to Community Calendar!";
                    break;

                case 'update_website':
                    await VenueOpsService.updateWebsite(venueId, pendingAction.params as { content: string });
                    successMessage = "Web Update Sent to Dev!";
                    break;

                case 'generate_image':
                    await VenueOpsService.generateImage(venueId, { prompt: pendingAction.params.prompt });
                    successMessage = "Image Assets Generated!";
                    // Add a mock asset message to WOW the user
                    opsArtie.addArtieMessage(
                        "I've drafted the assets based on your vision. Here's a preview of the primary marketing visual:",
                        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=60"
                    );
                    // ADVANCE STATE to allow for Ad Copy drafting
                    opsArtie.processAction('COMPLETE_IMAGE_GEN');
                    break;

                default:
                    // Fallback to updateVenue for simple field updates if LLM generates them
                    if (pendingAction.skill.startsWith('update_')) {
                        await VenueOpsService.updateVenue(venueId, pendingAction.params);
                        successMessage = "Listing Updated!";
                    }
                    break;
            }

            setActionStatus('success');
            showToast(successMessage, 'success');

            setTimeout(() => {
                setPendingAction(null);
                setActionStatus('idle');
                if (!isOpsMode) setPendingAction(null);
            }, 3000);

        } catch (e: any) {
            console.error("Action Failed:", e);
            showToast(e.message, 'error');
            setActionStatus('error');
        }
    };

    const handleEditAction = () => {
        if (!pendingAction) return;

        if (isOpsMode) {
            opsArtie.processAction('skill_flash_deal'); // Just loop back to start for now
            setPendingAction(null);
            setActionStatus('idle');
        } else {
            // Guest Edit Logic
            const editContent = `Draft Correction: "${pendingAction.params.summary}". Change to: `;
            setInput(editContent);
            setPendingAction(null);
            setActionStatus('idle');
            const inputElement = document.querySelector('input[placeholder="Ask Artie..."]') as HTMLInputElement;
            if (inputElement) inputElement.focus();
        }
    };

    if (!isOpen) return null;

    // Unified Messages Array
    const activeMessages = isOpsMode
        ? [...opsArtie.messages, ...guestArtie.messages.map(m => ({ ...m, role: m.role === 'model' ? 'artie' : 'user', text: m.content, timestamp: Date.now() }))]
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        : guestArtie.messages;

    const activeIsLoading = isOpsMode ? (opsArtie.isLoading || guestArtie.isLoading) : guestArtie.isLoading;
    const activeError = isOpsMode ? guestArtie.error : guestArtie.error;

    const handleContactSupport = (e: React.MouseEvent) => {
        // We do NOT preventDefault here. We let the native mailto: link fire.
        // We just opportunistically copy the email to clipboard as a fallback.
        navigator.clipboard.writeText('support@olybars.com')
            .then(() => showToast('Email copied to clipboard!', 'success'))
            .catch((err) => console.error('Clipboard failed', err));
    };

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
                            <img
                                src={isOpsMode ? schmidtLogo : artieLogo}
                                className="w-full h-full object-cover scale-110"
                                alt={isOpsMode ? "Schmidt" : "Artie"}
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight font-league">
                                {isOpsMode ? "Schmidt" : "Artie"}
                            </h3>
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
                    {/* Welcome Message (Show Guest Greeting if no guest messages yet) */}
                    {guestArtie.messages.length === 0 && greeting && (
                        <div className="space-y-4">
                            <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none">
                                    {greeting.message}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mode Badge */}
                    {isOpsMode && (
                        <div className="flex justify-center -mt-2 mb-2">
                            <div className="bg-primary/20 border border-primary/30 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                                <Bot className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Operator Mode Active</span>
                            </div>
                        </div>
                    )}

                    {/* Message Render Loop */}
                    {activeMessages.map((m: any, i: number) => {
                        // Logic from original to strip RATIONALE only if in Guest Mode (Ops messages are clean)
                        let displayContent = m.content || m.text; // Support both interfaces
                        const isModel = m.role === 'model' || m.role === 'artie';
                        const isUser = m.role === 'user';

                        if (!isOpsMode && isModel) {
                            // ... (Original stripping logic)
                            displayContent = displayContent.split('[ACTION]:')[0].split('[SUGGESTIONS]:')[0].trim();
                        }

                        return (
                            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed ${isUser
                                    ? 'bg-primary text-black rounded-tr-none'
                                    : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'
                                    }`}>
                                    {displayContent}
                                    {m.imageUrl && (
                                        <div className="mt-3 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                            <img src={m.imageUrl} alt="Artie Generated Content" className="w-full h-auto object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Ops Chips (Bubbles) */}
                    {isOpsMode && opsArtie.currentBubbles.length > 0 && (
                        <div className="flex justify-end pr-8">
                            <QuickReplyChips
                                options={opsArtie.currentBubbles}
                                onSelect={handleChipSelect}
                                maxVisible={3}
                            />
                        </div>
                    )}


                    {/* Pending Action Card */}
                    {pendingAction && (
                        <div className="flex justify-center my-4 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-gradient-to-br from-slate-800 to-black border-2 border-primary/50 p-4 rounded-2xl shadow-xl w-full max-w-[90%]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                        Action Required
                                    </span>
                                </div>
                                <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-tight">
                                    {pendingAction.skill.split('_').join(' ')}
                                </h4>
                                <div className="bg-black/30 p-2 rounded-lg border border-white/5 mb-4">
                                    <p className="text-slate-300 text-[11px] font-medium leading-relaxed italic line-clamp-2">
                                        &ldquo;{pendingAction.params.summary || pendingAction.params.topic || pendingAction.params.prompt || (pendingAction.skill === 'generate_image' ? 'Crafting multimodal prompt...' : 'Updating...')}&rdquo;
                                    </p>
                                </div>

                                {actionStatus === 'success' ? (
                                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live on Buzz Clock!</span>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleConfirmAction}
                                            disabled={actionStatus === 'loading'}
                                            className="flex-1 bg-primary hover:bg-yellow-400 text-black font-black text-[10px] py-2 rounded-lg uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            {actionStatus === 'loading' ? 'Processing...' : (
                                                pendingAction.skill === 'generate_image' ? 'Generate Assets' :
                                                    pendingAction.skill === 'schedule_flash_deal' ? 'Deploy to Buzz Clock' : 'Confirm & Save'
                                            )}
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
                    {activeIsLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                    {activeError && (
                        <div className="flex justify-center">
                            <div className="bg-red-500/10 text-red-400 text-xs p-2 rounded-lg border border-red-500/20">
                                {activeError}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-surface border-t border-white/5 space-y-3">
                    {/* Guest Suggestions */}
                    {!isOpsMode && !activeIsLoading && suggestions.length > 0 && (
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
                        <div className="flex-1 relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={isListening ? "Listening..." : (isOpsMode ? (
                                    opsArtie.opsState === 'flash_deal_input' ? "Type deal details..." :
                                        opsArtie.opsState === 'social_post_input' ? "What's the post about?" :
                                            opsArtie.opsState === 'email_draft_input' ? "Who/what is the email for?" :
                                                opsArtie.opsState === 'calendar_post_input' ? "Event summary for calendar?" :
                                                    opsArtie.opsState === 'website_content_input' ? "Web content update details?" :
                                                        opsArtie.opsState === 'image_gen_purpose' ? "What's the image for?" :
                                                            opsArtie.opsState === 'image_gen_goal' ? "What's the goal?" :
                                                                opsArtie.opsState === 'image_gen_event' ? "Event details..." :
                                                                    opsArtie.opsState === 'image_gen_audience' ? "Who's the audience?" :
                                                                        opsArtie.opsState === 'image_gen_specials' ? "Any specials/deals?" :
                                                                            opsArtie.opsState === 'image_gen_context' ? "Extra context/vibe..." :
                                                                                "Ask Coach..."
                                ) : "Ask Artie...")}
                                className={`w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-600 font-medium ${isListening ? 'animate-pulse' : ''}`}
                            />
                            {isSupported && (
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`p-2 rounded-lg transition-all ${isListening ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-white'
                                        }`}
                                >
                                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                                </button>
                            )}
                        </div>
                        {/* Honeypot Field */}
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
                            disabled={!input.trim() || activeIsLoading || isListening}
                            className="bg-primary hover:bg-yellow-400 text-black p-2.5 rounded-xl disabled:opacity-50 disabled:hover:bg-primary transition-all flex items-center justify-center shrink-0 w-10 h-10"
                        >
                            {activeIsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* AI Disclaimer Footer */}
                <div className="px-4 pb-2 bg-surface text-center">
                    <p className="text-[9px] text-slate-600 font-medium leading-tight">
                        Artie is an AI powered by the Artesian Well. He may make mistakes.
                        <br />
                        <span className="opacity-80">Verify critical info. Needs help? </span>
                        <a
                            href="mailto:support@olybars.com?subject=OlyBars%20Support&body=Describe%20issue%20here..."
                            onClick={handleContactSupport}
                            className="text-slate-500 hover:text-primary underline decoration-slate-600 underline-offset-2 transition-colors cursor-pointer"
                        >
                            Contact HQ
                        </a>.
                    </p>
                </div>
            </div>
        </div>
    );
};
