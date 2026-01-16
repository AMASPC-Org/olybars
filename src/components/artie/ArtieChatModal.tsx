import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, X, Send, Bot, Sparkles, Loader2, CheckCircle2, MessageSquare, AlertCircle, Paperclip, Mic, MicOff } from 'lucide-react';

/**
 * Strict Link Parser (Security-First)
 * Specifically handles [label](url) patterns for Coach Mode guidance.
 */
const renderTextWithLinks = (text: string) => {
    if (!text) return null;

    const regex = /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s\)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        const title = match[1];
        const url = match[2];

        parts.push(
            <a
                key={match.index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary hover:text-yellow-400 font-bold transition-colors"
            >
                {title}
            </a>
        );
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
};

import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useArtie } from '../../hooks/useArtie';
import { useArtieOps } from '../../hooks/useArtieOps';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { QuickReplyChips, QuickReplyOption } from './QuickReplyChips';
import { useToast } from '../../components/ui/BrandedToast';
import { UserProfile, isSystemAdmin } from '../../types';
// Note: Ensure these paths exist in your assets folder
import artieLogo from '../../assets/Artie-Only-Logo.png';
import schmidtLogo from '../../assets/Schmidt-Only-Logo (40 x 40 px).png';

interface ArtieChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile?: UserProfile;
    initialVenueId?: string;
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
        // [OPS MODE] Greeting is handled by the Ops Hook state machine
        if (profile.role === 'owner' || profile.role === 'manager' || isSystemAdmin(profile)) {
            return {
                message: "Initializing Venue Ops...",
                status: "OPS LINK ESTABLISHED"
            };
        }

        const pointsToTop = 50;
        return {
            message: `Welcome back, ${profile.handle}. You're ${pointsToTop} points behind the Leaderboard Top 10. Want a high-value target?`,
            status: "COACH MODE ACTIVE"
        };
    }

    const hour = new Date().getHours();
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    // Dynamic Time-Based Greeting
    if (hour >= 14 && hour < 17) {
        return {
            message: pick([
                "Clock’s ticking. I know 3 spots with open tables and cheap pints. Thirsty?",
                "Ready to ditch the desk? The first round of happy hours is just getting started."
            ]),
            status: pick(["DECOMPRESSING", "POURING EARLY", "TAPPING FRESH"])
        };
    }
    if (hour >= 17 && hour < 21) {
        return {
            message: pick([
                "Kitchens are open and the vibes are climbing. Need a dinner spot or a pre-game?",
                "The city is hitting its stride. Want to know where the shortest lines are right now?"
            ]),
            status: pick(["VIBES CLIMBING", "KITCHENS ACTIVE", "PRIME TIME"])
        };
    }
    if (hour >= 21 || hour < 2) {
        return {
            message: pick([
                "Double Tap is buzzing, but The Brotherhood is chill. What’s your speed tonight?",
                "Night is young for some, ending for others. Need a nightcap or a dance floor?"
            ]),
            status: pick(["IN THE MIX", "LAST CALL INTEL", "NIGHTSHIFT ACTIVE"])
        };
    }

    return {
        message: "Cheers! I'm Artie, your local guide. Ask me anything about Oly's bars, deals, or events!",
        status: "ONLINE & POURING"
    };
};

export const ArtieChatModal: React.FC<ArtieChatModalProps> = ({ isOpen, onClose, userProfile, initialVenueId }) => {
    // --- 1. Mode Determination ---
    const isOpsMode = !((window as any)._artie_force_guest) && userProfile && (isSystemAdmin(userProfile) || userProfile.role === 'owner' || userProfile.role === 'manager');

    // --- 2. Hooks ---
    const guestArtie = useArtie();
    const opsArtie = useArtieOps();
    const { persona, setPersona } = opsArtie;

    const { showToast } = useToast();
    const [input, setInput] = useState('');
    const [pendingAction, setPendingAction] = useState<ArtieAction | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [greeting, setGreeting] = useState<ArtieGreeting | null>(null);
    const [hpValue, setHpValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hasInitializedOps, setHasInitializedOps] = useState(false);
    const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
        }
    }, [transcript]);

    // --- 3. Initialization ---
    useEffect(() => {
        if (isOpen) {
            // Always refresh greeting on open to ensure state is fresh
            setGreeting(getArtieGreeting(userProfile));

            const venueContext = initialVenueId || userProfile?.homeBase;
            if (venueContext) {
                (window as any)._artie_venue_id = venueContext;
            }

            if (isOpsMode) {
                if (!hasInitializedOps) {
                    // Force a full state reset on modal re-open
                    opsArtie.resetOps();
                    setHasInitializedOps(true);
                }
            } else {
                setSuggestions([
                    "Who's winning?",
                    "Happy Hour now?",
                    "Trivia tonight?",
                    "Local Makers"
                ]);
            }
        }
        if (!isOpen) {
            setHasInitializedOps(false);
        }
    }, [isOpen, userProfile, isOpsMode, initialVenueId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- 4. Guest Mode Effects ---
    useEffect(() => {
        if (isOpsMode) return;
        scrollToBottom();
        const lastMessage = guestArtie.messages[guestArtie.messages.length - 1];

        if (lastMessage?.role === 'model' && !guestArtie.isLoading) {
            if (lastMessage.content.includes('[ACTION]:')) {
                try {
                    const actionJson = lastMessage.content.split('[ACTION]:')[1].trim();
                    const action = JSON.parse(actionJson) as ArtieAction;
                    setPendingAction(action);
                } catch (e) { console.error("Failed to parse guest action", e); }
            }
            if (lastMessage.content.includes('[SUGGESTIONS]:')) {
                try {
                    const suggJson = lastMessage.content.split('[SUGGESTIONS]:')[1].trim();
                    const suggs = JSON.parse(suggJson) as string[];
                    setSuggestions(suggs);
                } catch (e) { console.error("Failed to parse guest suggestions", e); }
            }
        }
    }, [guestArtie.messages, guestArtie.isLoading, isOpsMode]);

    // --- 5. Ops Mode Effects ---
    useEffect(() => {
        if (!isOpsMode) return;
        scrollToBottom();

        // Sync Pending Action Logic
        if (opsArtie.draftData && opsArtie.opsState === 'confirm_action') {
            setPendingAction({
                skill: opsArtie.draftData.skill,
                params: opsArtie.draftData.params,
                venueId: initialVenueId || userProfile?.homeBase
            });
        } else if (opsArtie.opsState === 'completed' || opsArtie.opsState === 'idle') {
            // Clear pending action if Ops state moves on
            if (actionStatus === 'idle') setPendingAction(null);
        }
    }, [opsArtie.messages, opsArtie.opsState, opsArtie.draftData, isOpsMode]);


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (isOpsMode) {
            const venueId = initialVenueId || userProfile?.homeBase;
            // Read file as Base64
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64 = event.target?.result as string;
                // Strip the data:image/jpeg;base64, prefix for the backend
                const base64Clean = base64.split(',')[1];

                await opsArtie.processAction('UPLOAD_FILE', base64Clean, venueId);
            };
            reader.readAsDataURL(file);

            // Auto-clear input to allow re-upload of same file if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    // --- 6. Handlers ---
    const handleSend = async (text?: string) => {
        const userText = text || input.trim();
        if (!userText) return;

        setInput('');

        if (isOpsMode) {
            const venueId = initialVenueId || userProfile?.homeBase;

            // Map the current State Machine state to the Trigger Action
            const stateToActionMap: Record<string, string> = {
                'flash_deal_input': 'SUBMIT_DEAL_TEXT',
                'event_input': 'SUBMIT_EVENT_TEXT',
                'event_input_title': 'SUBMIT_EVENT_TEXT',
                'event_input_date': 'SUBMIT_EVENT_TEXT',
                'event_input_time': 'SUBMIT_EVENT_TEXT',
                'event_input_type': 'SUBMIT_EVENT_TEXT',
                'event_input_prizes': 'SUBMIT_EVENT_TEXT',
                'event_input_details': 'SUBMIT_EVENT_TEXT',
                'event_init_check_flyer': 'event_init_check_flyer',
                'event_init_check_gen': 'event_init_check_gen',
                'event_upload_wait': 'event_upload_wait',
                'generating_creative_copy': 'review_event_copy',
                'review_event_copy': 'review_event_copy',
                'play_input': 'SUBMIT_PLAY_TEXT',
                'social_post_input': 'SUBMIT_SOCIAL_POST_TEXT',
                'email_draft_input': 'SUBMIT_EMAIL_TEXT',
                'calendar_post_input': 'SUBMIT_CALENDAR_TEXT',
                'website_content_input': 'SUBMIT_WEB_TEXT',
                'image_gen_purpose': 'SUBMIT_IMAGE_PURPOSE',
                'image_gen_goal': 'SUBMIT_IMAGE_GOAL',
                'image_gen_event': 'SUBMIT_IMAGE_EVENT',
                'image_gen_audience': 'SUBMIT_IMAGE_AUDIENCE',
                'image_gen_specials': 'SUBMIT_IMAGE_SPECIALS',
                'image_gen_context': 'SUBMIT_IMAGE_CONTEXT'
            };

            const action = stateToActionMap[opsArtie.opsState];

            if (action) {
                await opsArtie.processAction(action, userText, venueId);
            } else {
                // Fallback / General Conversation inside Ops Mode (currently just echoes or passes to guest logic if needed)
                // For MVP Ops, we want to stay in the funnel.
                if (opsArtie.opsState === 'selecting_skill') {
                    // If user types instead of clicking a chip in menu
                    // Could implement intent recognition here later.
                    showToast("Please select a skill from the chips above.", "info");
                } else {
                    await guestArtie.sendMessage(userText, userProfile?.uid, userProfile?.role, hpValue, 'Schmidt');
                }
            }

        } else {
            // Guest Mode
            setPendingAction(null);
            setSuggestions([]);
            setActionStatus('idle');
            await guestArtie.sendMessage(userText, userProfile?.uid, userProfile?.role, hpValue, 'Artie');
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        handleSend(suggestion);
    };

    const handleChipSelect = (option: QuickReplyOption) => {
        const venueId = initialVenueId || userProfile?.homeBase;
        // Fix: Pass the label (e.g. "Today") as the text payload so heuristics work
        opsArtie.processAction(option.value, option.label, venueId);
    };

    const handleConfirmAction = async () => {
        if (!pendingAction || !userProfile) return;

        setActionStatus('loading');
        try {
            // Dynamic import to avoid circular deps or bloat if not needed
            const { VenueOpsService } = await import('../../services/VenueOpsService');
            const venueId = pendingAction.venueId || userProfile.homeBase;

            if (!venueId) {
                showToast("Whoops! I need to know which venue we're working on.", "error");
                setActionStatus('error');
                return;
            }

            let successMessage = "Update complete!";

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
                    opsArtie.processAction('confirm_post'); // Advance state machine
                    break;

                case 'promote_menu_item':
                    await VenueOpsService.saveDraft(venueId, {
                        topic: `Promoting ${pendingAction.params.item_name}`,
                        copy: pendingAction.params.copy,
                        type: 'SOCIAL_PROMO'
                    });
                    successMessage = "Social Post Drafted!";
                    opsArtie.processAction('confirm_post');
                    break;

                case 'draft_email':
                    await VenueOpsService.draftEmail(venueId, pendingAction.params as { subject: string; body: string });
                    successMessage = "Email Draft Saved!";
                    opsArtie.processAction('confirm_post');
                    break;

                case 'add_to_calendar':
                case 'add_calendar_event':
                    const result = await VenueOpsService.submitCalendarEvent(venueId, pendingAction.params);
                    successMessage = "Event Scheduled Successfully!";
                    // Pass the created event ID to the ops hook so it can show a link
                    opsArtie.processAction('confirm_post', result?.id);
                    break;

                case 'update_website':
                    await VenueOpsService.updateWebsite(venueId, pendingAction.params as { content: string });
                    successMessage = "Web Update Sent to Dev!";
                    opsArtie.processAction('confirm_post');
                    break;

                case 'generate_image':
                    await VenueOpsService.generateImage(venueId, { prompt: pendingAction.params.prompt });
                    successMessage = "Image Assets Generated!";

                    // Mock Visual feedback
                    opsArtie.addArtieMessage(
                        "I've drafted the assets based on your vision. Here's a preview:",
                        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=60"
                    );
                    // Critical: Advance state so user can draft copy next
                    opsArtie.processAction('COMPLETE_IMAGE_GEN');
                    break;

                default:
                    if (pendingAction.skill.startsWith('update_')) {
                        await VenueOpsService.updateVenue(venueId, pendingAction.params);
                        successMessage = "Listing Updated!";
                        opsArtie.processAction('confirm_post');
                    }
                    break;
            }

            setActionStatus('success');
            showToast(successMessage, 'success');

            setTimeout(() => {
                setPendingAction(null);
                setActionStatus('idle');
            }, 2500);

        } catch (e: any) {
            console.error("Action Failed:", e);
            showToast(e.message || "Action failed", 'error');
            setActionStatus('error');
        }
    };

    const handleEditAction = () => {
        if (!pendingAction) return;

        if (isOpsMode) {
            // Context-aware edit routing
            if (pendingAction.skill === 'add_calendar_event') {
                opsArtie.setOpsState('event_input');
            } else {
                opsArtie.processAction('skill_flash_deal'); // Default fallback
            }
            setPendingAction(null);
            setActionStatus('idle');
        } else {
            const editContent = `Draft Correction: "${pendingAction.params.summary}". Change to: `;
            setInput(editContent);
            setPendingAction(null);
            setActionStatus('idle');
        }
    };

    const handleContactSupport = () => {
        navigator.clipboard.writeText('support@olybars.com')
            .then(() => showToast('Email copied to clipboard!', 'success'))
            .catch(() => { });
    };

    const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop({
        onDrop: (file) => {
            if (isOpsMode) {
                const venueId = initialVenueId || userProfile?.homeBase;
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const base64 = event.target?.result as string;
                    const base64Clean = base64.split(',')[1];
                    await opsArtie.processAction('UPLOAD_FILE', base64Clean, venueId);
                };
                reader.readAsDataURL(file);
            }
        }
    });

    if (!isOpen) return null;

    // Unified Messages
    const activeMessages = isOpsMode
        ? [...opsArtie.messages, ...guestArtie.messages.map(m => ({ ...m, role: m.role === 'model' ? 'artie' : 'user', text: m.content, timestamp: Date.now() }))]
            .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
        : guestArtie.messages;

    const activeIsLoading = isOpsMode ? (opsArtie.isLoading || guestArtie.isLoading) : guestArtie.isLoading;
    const activeError = isOpsMode ? (opsArtie.error || guestArtie.error) : guestArtie.error;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="bg-surface border-2 border-primary/20 w-full max-w-sm h-[600px] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-primary/10 border-b border-primary/20 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-0.5 rounded-xl shadow-lg shadow-primary/20 overflow-hidden w-14 h-14 flex items-center justify-center">
                            <img
                                src={(isOpsMode && persona === 'schmidt') ? schmidtLogo : artieLogo}
                                className="w-full h-full object-cover scale-110"
                                alt={(isOpsMode && persona === 'schmidt') ? "Schmidt" : "Artie"}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight font-league">
                                    {(isOpsMode && persona === 'schmidt') ? "Schmidt" : "Artie"}
                                </h3>
                                {isOpsMode && (
                                    <button
                                        onClick={() => {
                                            const newPersona = persona === 'schmidt' ? 'artie' : 'schmidt';
                                            setPersona(newPersona);
                                            opsArtie.resetOps();
                                            showToast(`Switched to ${newPersona === 'schmidt' ? 'Schmidt (Owner)' : 'Artie (Visitor)'} Mode`, "info");
                                        }}
                                        className="bg-primary/20 hover:bg-primary/40 p-1 rounded-md transition-colors"
                                        title="Switch Persona"
                                    >
                                        {persona === 'schmidt' ? <Bot size={14} className="text-primary" /> : <Sparkles size={14} className="text-primary" />}
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOpsMode ? 'bg-primary' : 'bg-green-500'}`} />
                                <span className="text-[9px] text-primary font-bold uppercase tracking-widest">{greeting?.status || "Online"}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (isOpsMode) {
                                opsArtie.resetOps();
                                setPendingAction(null);
                            } else {
                                // For Guest Artie, we might want a similar reset, but for now just clear local state
                                // setGuestArtieMessages([]); // If we had access to setter
                                onClose(); // Fallback for guest, or implement Guest reset later
                            }
                        }}
                        className="text-slate-500 hover:text-white transition-colors mr-2"
                        title="Reset Conversation"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                    {/* Mode Badge */}
                    {isOpsMode && (
                        <div className="flex justify-center -mt-2 mb-2">
                            <div className="bg-primary/20 border border-primary/30 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                                <Bot className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Operator Mode Active</span>
                            </div>
                        </div>
                    )}

                    {/* Guest Greeting if empty */}
                    {!isOpsMode && guestArtie.messages.length === 0 && greeting && (
                        <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none">
                                {greeting.message}
                            </div>
                        </div>
                    )}

                    {/* Message Loop */}
                    {activeMessages.map((m: any, i: number) => {
                        let displayContent = m.content || m.text || '';
                        const isUser = m.role === 'user';

                        if (!isOpsMode && !isUser) {
                            displayContent = displayContent.split('[ACTION]:')[0].split('[SUGGESTIONS]:')[0].trim();
                        }

                        return (
                            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed ${isUser
                                    ? 'bg-primary text-black rounded-tr-none'
                                    : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'
                                    }`}>
                                    {renderTextWithLinks(displayContent)}
                                    {m.imageUrl && (
                                        <div className="mt-3 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                            <img src={m.imageUrl} alt="Generated Asset" className="w-full h-auto object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Chips */}
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
                                        &ldquo;{pendingAction.params.summary || pendingAction.params.topic || pendingAction.params.prompt || 'Review details below...'}&rdquo;
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
                                                    pendingAction.skill === 'schedule_flash_deal' ? 'Deploy' : 'Confirm & Save'
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
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
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

                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex gap-2 bg-black/40 border-2 rounded-2xl p-1.5 transition-all ${isDragging ? 'border-primary bg-primary/10' : 'border-slate-800 focus-within:border-primary/50'
                            }`}
                    >
                        <div className="flex-1 relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={isListening ? "Listening..." : (isOpsMode ? (
                                    opsArtie.opsState.includes('input') ? "Type details..." : "Ask Schmidt..."
                                ) : "Ask Artie...")}
                                className={`w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-600 font-medium ${isListening ? 'animate-pulse' : ''}`}
                            />
                            {isOpsMode && !activeIsLoading && (
                                <button
                                    onClick={handleFileClick}
                                    className="p-2 rounded-lg text-slate-500 hover:text-white transition-all"
                                    title="Upload Image"
                                >
                                    <Paperclip size={16} />
                                </button>
                            )}
                            {isSupported && (
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`p-2 rounded-lg transition-all ${isListening ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-white'}`}
                                >
                                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                                </button>
                            )}
                        </div>
                        {/* Honeypot */}
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
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || activeIsLoading || isListening}
                            className="bg-primary hover:bg-yellow-400 text-black p-2.5 rounded-xl disabled:opacity-50 disabled:hover:bg-primary transition-all flex items-center justify-center shrink-0 w-10 h-10"
                        >
                            {activeIsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 pb-2 bg-surface text-center">
                    <p className="text-[9px] text-slate-600 font-medium leading-tight">
                        Powered by the Artesian Well. Verify critical info.
                        <br />
                        <span className="opacity-80 cursor-pointer hover:text-primary transition-colors" onClick={handleContactSupport}>
                            Need help? Contact HQ
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};
