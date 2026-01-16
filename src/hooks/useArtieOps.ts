// File: src/hooks/useArtieOps.ts
import { useState, useCallback, useMemo } from 'react';
import { QuickReplyOption } from '../components/artie/QuickReplyChips';
import { VenueOpsService } from '../services/VenueOpsService';
import { SkillContext, EventSkillContext } from '../types/skill';

// Modular Skill Handlers - CONSOLIDATED UNDER PERSONAS
import * as SchmidtBounty from '../features/Schmidt/flashBounty';
import * as SchmidtImages from '../features/Schmidt/imageGen';
import * as SchmidtContent from '../features/Schmidt/contentOps';
import * as SchmidtEvents from '../features/Schmidt/eventOps';
import * as ArtieConcierge from '../features/artie/concierge';

// 1. State Definitions
export type ArtieOpsState =
    | 'idle'
    | 'selecting_skill'
    | 'flash_deal_init_method'
    | 'flash_deal_input'
    | 'flash_deal_time_check'
    | 'event_input'         // Initial "Paste everything" state
    | 'event_input_title'   // Interview Mode: Asking for Title
    | 'event_input_date'    // Interview Mode: Asking for Date
    | 'event_input_time'    // Interview Mode: Asking for Time
    | 'event_input_type'    // Interview Mode: Asking for Type (Trivia, Karaoke, etc.)
    | 'event_input_prizes'
    | 'event_input_details' // Interview Mode: Asking for Description/Prizes
    | 'event_init_check_flyer'
    | 'event_init_check_gen'
    | 'event_upload_wait'
    | 'generating_creative_copy'
    | 'review_event_copy'
    | 'play_input'
    | 'social_post_input'
    | 'email_draft_input'
    | 'calendar_post_input'
    | 'website_content_input'
    | 'image_gen_purpose'
    | 'image_gen_goal'
    | 'image_gen_event'
    | 'image_gen_audience'
    | 'image_gen_specials'
    | 'image_gen_context'
    | 'post_image_gen'
    | 'confirm_action'
    | 'upload_file'
    | 'completed';

export interface ArtieMessage {
    id: string;
    role: 'artie' | 'user';
    text: string;
    timestamp: number;
    imageUrl?: string;
}

// Helper Interface for building the event step-by-step
interface EventDraft {
    title?: string;
    date?: string;
    time?: string;
    description?: string;
    prizes?: string;
    marketingCopy?: string;
    vibeMode?: 'hype' | 'chill' | 'funny' | 'standard';
    type?: string;
    imageState: 'none' | 'uploaded' | 'generated';
    imageUrl?: string;
}

// 2. Regulatory Guardrails (LCB Compliance)
const LCB_FORBIDDEN_TERMS = ['free alcohol', 'free beer', 'free shots', 'free drinks', 'unlimited', 'bottomless', 'complimentary', 'giveaway', '0.00', '$0'];
const ALCOHOL_TERMS = ['beer', 'wine', 'shots', 'cocktails', 'drinks', 'booze', 'ipa', 'stout', 'pilsner', 'mimosas', 'tequila', 'whiskey', 'vodka', 'gin', 'rum'];

export type PersonaType = 'schmidt' | 'artie';

export const useArtieOps = () => {
    const [persona, setPersona] = useState<PersonaType>('schmidt');
    const [opsState, setOpsState] = useState<ArtieOpsState>('idle');
    const [messages, setMessages] = useState<ArtieMessage[]>([]);
    const [currentBubbles, setCurrentBubbles] = useState<QuickReplyOption[]>([]);
    const [draftData, setDraftData] = useState<any>({});
    const [eventDraft, setEventDraft] = useState<EventDraft>({ imageState: 'none' }); // Specific state for the interview
    const [isLoading, setIsLoading] = useState(false);
    const [venue, setVenue] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // 2. Fetch Venue Context
    const fetchVenue = useCallback(async (venueId: string) => {
        if (!venueId) return;
        try {
            const { db } = await import('../lib/firebase');
            const { doc, getDoc } = await import('firebase/firestore');
            const docRef = doc(db, 'venues', venueId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setVenue({ id: docSnap.id, ...docSnap.data() });
            }
        } catch (err) {
            console.error("Artie failed to load venue context:", err);
            setError("Could not load venue context. Some features may be limited.");
        }
    }, []);

    // 3. The Compliance Engine
    const validateLCBCompliance = useCallback((text: string): { valid: boolean; reason?: string } => {
        if (!text) return { valid: true };
        const lowerText = text.toLowerCase();

        // Check for "Free Alcohol" specifically (Combinations)
        const hasForbidden = LCB_FORBIDDEN_TERMS.some(term => lowerText.includes(term));
        const hasAlcohol = ALCOHOL_TERMS.some(word => lowerText.includes(word));

        // Rule: "Free" + Alcohol Context
        if (lowerText.includes('free') && hasAlcohol) {
            return {
                valid: false,
                reason: "I can't post that. Washington LCB regulations prohibit advertising 'free' alcohol. Try a specific price (e.g., '$1 Shots')."
            };
        }

        // Rule: "Unlimited" / "Bottomless"
        if (lowerText.includes('unlimited') || lowerText.includes('bottomless')) {
            return {
                valid: false,
                reason: "I can't post that. 'Unlimited' or 'Bottomless' drink offers are prohibited by LCB rules."
            };
        }

        return { valid: true };
    }, []);

    // 4. Time/Schedule Validator
    const validateSchedule = useCallback(async (timeISO: string, duration: number) => {
        const mockVenue = { partnerConfig: { tier: 'FREE', flashBountiesUsed: 0 } } as any;
        try {
            const check = await VenueOpsService.validateSlot(mockVenue, new Date(timeISO).getTime(), duration);
            return check;
        } catch (e) {
            console.warn("Validation service unreachable, proceeding with caution.");
            return { valid: true };
        }
    }, []);


    // 5. The Traffic Controller (Skill Context Provider)
    const processAction = useCallback(async (action: string, rawPayload?: string, venueId?: string) => {
        setError(null);
        const payload = rawPayload?.trim();

        if (venueId && !venue) {
            await fetchVenue(venueId);
        }

        // --- Context Implementation ---
        const addUserMessage = (text: string) => {
            setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text, timestamp: Date.now() }]);
        };

        const addSchmidtResponse = (text: string, options: QuickReplyOption[] = []) => {
            const newMessage: ArtieMessage = {
                id: Date.now().toString(),
                role: 'artie',
                text: text,
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, newMessage]);
            setCurrentBubbles(options);
        };

        const ctx: SkillContext = {
            addUserMessage,
            addSchmidtResponse,
            setIsLoading,
            setOpsState,
            currentOpsState: opsState,
            draftData,
            setDraftData,
            venue,
            processAction,
            validateLCBCompliance,
            validateSchedule
        };

        const eventCtx: EventSkillContext = {
            ...ctx,
            eventDraft,
            setEventDraft
        };

        // --- VISITOR MODE (ARTIE) ---
        if (persona === 'artie' && !['START_SESSION', 'cancel'].includes(action)) {
            await ArtieConcierge.handleVisitorQuery(payload || action, ctx);
            return;
        }

        // --- THE ROUTING TABLE (SCHMIDT / OWNER ADMIN) ---
        switch (action) {
            case 'START_SESSION':
                setOpsState('selecting_skill');
                setMessages([]);
                const welcomeMsg = persona === 'schmidt'
                    ? "Welcome back! I'm ready to help. What's the mission?"
                    : "Hey there! Artie here. How can I help you find some fun tonight?";

                const welcomeBubbles = persona === 'schmidt' ? [
                    { id: '1', label: 'Flash Bounty', value: 'skill_flash_deal', icon: '⚡' },
                    { id: '2', label: 'Add Event', value: 'skill_add_event', icon: '📅' },
                    { id: '3', label: 'Social Post', value: 'skill_social_post', icon: '📱' },
                    { id: '4', label: 'Draft Email', value: 'skill_email_draft', icon: '✉️' },
                    { id: '5', label: 'Calendar Post', value: 'skill_calendar_post', icon: '🗓️' },
                    { id: '6', label: 'Web Content', value: 'skill_website_content', icon: '🌐' },
                    { id: '7', label: 'Gen Image', value: 'skill_generate_image', icon: '🎨' }
                ] : [
                    { id: 'v1', label: 'Find Trivia', value: 'find_trivia', icon: '🧠' },
                    { id: 'v2', label: 'What\'s Buzzing?', value: 'whats_buzzing', icon: '🔥' }
                ];

                addSchmidtResponse(welcomeMsg, welcomeBubbles);
                break;

            // --- SCHMIDT: Flash Bounties ---
            case 'skill_flash_deal':
                SchmidtBounty.handleFlashBountyInit(ctx);
                break;
            case 'bounty_food':
            case 'bounty_drink':
            case 'bounty_time':
                SchmidtBounty.handleTypeSelection(action, ctx);
                break;
            case 'method_ideation':
                SchmidtBounty.handleMethodIdeation(ctx);
                break;
            case 'accept_ideation_proposal':
                await SchmidtBounty.handleAcceptIdeationProposal(ctx);
                break;
            case 'method_manual_input':
                SchmidtBounty.handleMethodManualInput(ctx);
                break;
            case 'SUBMIT_DEAL_TEXT':
                await SchmidtBounty.handleSubmitBountyText(payload, ctx);
                break;

            // --- SCHMIDT: Image Generation ---
            case 'skill_generate_image':
                SchmidtImages.handleImageGenInit(ctx);
                break;
            case 'SUBMIT_IMAGE_PURPOSE':
            case 'purpose_social':
            case 'purpose_web':
            case 'purpose_print':
            case 'purpose_exclusive':
                {
                    const labelMap: any = { 'purpose_social': 'Social Media', 'purpose_web': 'Website', 'purpose_print': 'Print Flyer', 'purpose_exclusive': 'Member Only' };
                    SchmidtImages.handleSubmitPurpose(labelMap[action] || payload, ctx);
                }
                break;
            case 'SUBMIT_IMAGE_GOAL':
            case 'goal_event':
            case 'goal_menu':
            case 'goal_vibe':
            case 'goal_hiring':
                {
                    const labelMap: any = { 'goal_event': 'Promote Event', 'goal_menu': 'Showcase Menu', 'goal_vibe': 'Daily Vibe', 'goal_hiring': 'Hiring/Team' };
                    SchmidtImages.handleSubmitGoal(labelMap[action] || payload, ctx);
                }
                break;
            case 'SUBMIT_IMAGE_EVENT':
                SchmidtImages.handleSubmitEventDetails(payload, ctx);
                break;
            case 'SUBMIT_IMAGE_AUDIENCE':
                SchmidtImages.handleSubmitAudience(payload, ctx);
                break;
            case 'SUBMIT_IMAGE_SPECIALS':
            case 'no_specials':
                SchmidtImages.handleSubmitSpecials(action === 'no_specials' ? 'no_specials' : payload, ctx);
                break;
            case 'SUBMIT_IMAGE_CONTEXT':
                await SchmidtImages.handleSubmitContext(payload, ctx);
                break;
            case 'COMPLETE_IMAGE_GEN':
                SchmidtImages.handlePostImageGen(ctx);
                break;

            // --- SCHMIDT: Content & Copy ---
            case 'skill_social_post':
                SchmidtContent.handleSocialPostInit(ctx);
                break;
            case 'SUBMIT_SOCIAL_POST_TEXT':
                await SchmidtContent.handleSubmitSocialText(payload, ctx);
                break;
            case 'skill_email_draft':
                SchmidtContent.handleEmailDraftInit(ctx);
                break;
            case 'SUBMIT_EMAIL_TEXT':
                await SchmidtContent.handleSubmitEmailText(payload, ctx);
                break;
            case 'skill_ad_copy':
                SchmidtContent.handleAdCopyRequest(ctx);
                break;
            case 'SUBMIT_CALENDAR_TEXT':
                await SchmidtContent.handleSubmitCalendarText(payload, ctx);
                break;
            case 'SUBMIT_WEB_TEXT':
                await SchmidtContent.handleSubmitWebText(payload, ctx);
                break;
            case 'generating_creative_copy':
            case 'regen_hype':
            case 'regen_chill':
            case 'regen_funny':
                await SchmidtContent.handleGeneratingCreativeCopy(payload, eventCtx);
                break;

            // --- SCHMIDT: Events ---
            case 'skill_add_event':
                SchmidtEvents.handleAddEventInit(eventCtx);
                break;
            case 'event_has_flyer':
                SchmidtEvents.handleHasFlyer(eventCtx);
                break;
            case 'event_no_flyer':
                SchmidtEvents.handleNoFlyer(eventCtx);
                break;
            case 'event_gen_flyer':
                await SchmidtEvents.handleGenFlyerRequest(eventCtx);
                break;
            case 'event_text_only':
                SchmidtEvents.handleTextOnlyEvent(eventCtx);
                break;
            case 'SUBMIT_EVENT_TEXT':
                await SchmidtEvents.handleSubmitEventText(payload, eventCtx);
                break;
            case 'edit_event':
                SchmidtEvents.handleEditEvent(eventCtx);
                break;
            case 'copy_approved':
                SchmidtEvents.handleCopyApproved(eventCtx);
                break;

            // --- SCHMIDT: CMS Operations ---
            case 'skill_calendar_post':
                SchmidtContent.handleCalendarPostInit(ctx);
                break;
            case 'skill_website_content':
                SchmidtContent.handleWebsiteContentInit(ctx);
                break;

            // --- COMMON ENGINE ---
            case 'confirm_post':
                addUserMessage('Post It');
                setIsLoading(true);

                if (opsState === 'confirm_action' && draftData.skill === 'generate_image') {
                    if (draftData.isEventFlyer) {
                        setOpsState('event_input');
                        addSchmidtResponse("Visual assets are staged! Now, paste the event details (Name, Date, Time) so I can link them.");
                        setIsLoading(false);
                        break;
                    }
                    // FLOW THROUGH to run the actual API call below
                }

                try {
                    let result: { success: boolean; error?: string };
                    const vId = venue?.id || venueId || '';

                    switch (draftData.skill) {
                        case 'schedule_flash_deal':
                            result = await VenueOpsService.scheduleFlashBounty(vId, draftData.params);
                            break;
                        case 'add_calendar_event':
                            result = await VenueOpsService.submitCalendarEvent(vId, draftData.params);
                            break;
                        case 'promote_menu_item':
                            // Reusing for general social posts as well
                            result = await VenueOpsService.saveDraft(vId, {
                                topic: draftData.params.item_name,
                                copy: draftData.params.copy,
                                type: 'social'
                            });
                            break;
                        case 'draft_email':
                            result = await VenueOpsService.draftEmail(vId, draftData.params);
                            break;
                        case 'add_to_calendar':
                            result = await VenueOpsService.addToCalendar(vId, draftData.params);
                            break;
                        case 'update_website':
                            result = await VenueOpsService.updateWebsite(vId, draftData.params);
                            break;
                        case 'generate_image':
                            result = await VenueOpsService.generateImage(vId, draftData.params);
                            break;
                        default:
                            result = { success: false, error: `Unknown skill: ${draftData.skill}` };
                    }

                    if (result.success) {
                        setOpsState('completed');
                        let doneMsg = `Mission achieved! **${draftData.skill.replace(/_/g, ' ')}** is live.`;

                        if (draftData.skill === 'add_calendar_event') {
                            const eventLink = `/venues/${vId}/events`;
                            if (eventDraft.imageState !== 'none') {
                                doneMsg = "Event & Assets Saved! Would you like to distribute this to social media now?";
                                addSchmidtResponse(doneMsg, [
                                    { id: 'post_socials', label: 'Post to Socials', value: 'skill_social_post', icon: '📱' },
                                    { id: 'done', label: 'Done', value: 'cancel', icon: '✅' }
                                ]);
                            } else {
                                doneMsg = `Event Created! View it here: [See Event](${eventLink})`;
                                addSchmidtResponse(doneMsg, [
                                    { id: 'new', label: 'New Mission', value: 'START_SESSION', icon: '🚀' },
                                    { id: 'done', label: 'Done', value: 'cancel', icon: '✅' }
                                ]);
                            }

                        } else if (draftData.skill === 'generate_image') {
                            const imgUrl = (result as any).imageUrl;
                            if (imgUrl) addArtieMessage("Here is your specialized visual asset:", imgUrl);
                            addSchmidtResponse(`${doneMsg} Would you like to write some copy for this?`, [
                                { id: 'write_copy', label: 'Write Ad Copy', value: 'skill_ad_copy', icon: '📝' },
                                { id: 'done', label: 'Done', value: 'cancel', icon: '✅' }
                            ]);
                        } else {
                            addSchmidtResponse(`${doneMsg} What's next?`, [
                                { id: 'new', label: 'New Mission', value: 'START_SESSION', icon: '🚀' },
                                { id: 'done', label: 'Done', value: 'cancel', icon: '✅' }
                            ]);
                        }
                    } else {
                        setError(result.error || "Action failed. Please try again.");
                    }
                } catch (e: any) {
                    console.error("Confirmation Error:", e);
                    setError(e.message || "An unexpected error occurred.");
                } finally {
                    setIsLoading(false);
                }
                break;

            case 'UPLOAD_FILE':
                if (!payload) return;
                setIsLoading(true);
                addSchmidtResponse("Schmidt is reading the flyer... 🧐");

                try {
                    const extraction = await VenueOpsService.analyzeFlyer(venueId || venue?.id || '', payload, new Date().toISOString());

                    // Merge extraction results into eventDraft
                    const currentDraft: EventDraft = {
                        ...eventDraft,
                        imageState: 'uploaded',
                        title: extraction.title || eventDraft.title,
                        date: extraction.date || eventDraft.date,
                        time: extraction.time || eventDraft.time,
                        type: extraction.type || eventDraft.type,
                        description: extraction.description || eventDraft.description
                    };
                    setEventDraft(currentDraft);
                    setIsLoading(false);

                    if (extraction.lcbViolationDetected) {
                        addSchmidtResponse("⚠️ Heads up: Schmidt detected potential LCB compliance issues in this flyer. I've adjusted the description to be safe.");
                    }

                    // --- Smart Fallback Logic (The Slot Filling Check) ---
                    if (!currentDraft.title) {
                        setOpsState('event_input_title');
                        addSchmidtResponse("Schmidt read the flyer, but couldn't find a clear TITLE. What's the name of the event?");
                        return;
                    }

                    if (!currentDraft.date) {
                        setOpsState('event_input_date');
                        addSchmidtResponse(`I've got "${currentDraft.title}" ready. What DATE is this happening?`, [
                            { id: 'today', label: 'Today', value: 'SUBMIT_EVENT_TEXT', icon: '📅' },
                            { id: 'tmrw', label: 'Tomorrow', value: 'SUBMIT_EVENT_TEXT', icon: '⏭️' }
                        ]);
                        return;
                    }

                    if (!currentDraft.time) {
                        setOpsState('event_input_time');
                        addSchmidtResponse(`Okay, ${currentDraft.date}. What TIME does it start?`, [
                            { id: '7pm', label: '7:00 PM', value: 'SUBMIT_EVENT_TEXT', icon: '🕖' },
                            { id: '8pm', label: '8:00 PM', value: 'SUBMIT_EVENT_TEXT', icon: '🕗' },
                            { id: '9pm', label: '9:00 PM', value: 'SUBMIT_EVENT_TEXT', icon: '🕘' }
                        ]);
                        return;
                    }

                    if (!currentDraft.type) {
                        setOpsState('event_input_type');
                        addSchmidtResponse("Schmidt read the flyer, but couldn't be sure about the event CATEGORY. What type is this?", [
                            { id: 'trivia', label: 'Trivia', value: 'SUBMIT_EVENT_TEXT', icon: '🧠' },
                            { id: 'karaoke', label: 'Karaoke', value: 'SUBMIT_EVENT_TEXT', icon: '🎤' },
                            { id: 'music', label: 'Live Music', value: 'SUBMIT_EVENT_TEXT', icon: '🎸' },
                            { id: 'other', label: 'Other', value: 'SUBMIT_EVENT_TEXT', icon: '🎉' }
                        ]);
                        return;
                    }

                    if (!currentDraft.prizes && (currentDraft.type === 'trivia' || currentDraft.type === 'bingo')) {
                        setOpsState('event_input_prizes');
                        addSchmidtResponse("Schmidt missed it—what are the PRIZES? (e.g. $50 Venue Tab)");
                        return;
                    }

                    if (!currentDraft.description) {
                        setOpsState('event_input_details');
                        addSchmidtResponse("Schmidt extracted the basics, but do you have any extra details or rules to add?");
                        return;
                    }

                    // All slots filled -> Transition to Creative Engine
                    setEventDraft(currentDraft);
                    await processAction('generating_creative_copy');

                } catch (e: any) {
                    setIsLoading(false);
                    addSchmidtResponse(`Schmidt had trouble reading that: ${e.message}. Let's do it manually. What's the event title?`);
                    setOpsState('event_input_title');
                }
                break;

            case 'completed':
                setOpsState('selecting_skill');
                setDraftData({});
                setEventDraft({ imageState: 'none' });
                addSchmidtResponse("Mission accomplished. What's next?", [
                    { id: '1', label: 'Flash Bounty', value: 'skill_flash_deal', icon: '⚡' },
                    { id: '2', label: 'Add Event', value: 'skill_add_event', icon: '📅' },
                    { id: '3', label: 'Social Post', value: 'skill_social_post', icon: '📱' },
                    { id: '7', label: 'Gen Image', value: 'skill_generate_image', icon: '🎨' }
                ]);
                break;

            case 'cancel':
                setOpsState('selecting_skill');
                setDraftData({});
                setEventDraft({ imageState: 'none' });
                setCurrentBubbles([
                    { id: '1', label: 'Flash Bounty', value: 'skill_flash_deal', icon: '⚡' },
                    { id: '2', label: 'Add Event', value: 'skill_add_event', icon: '📅' },
                    { id: '3', label: 'Social Post', value: 'skill_social_post', icon: '📱' },
                    { id: '4', label: 'Draft Email', value: 'skill_email_draft', icon: '✉️' },
                    { id: '5', label: 'Calendar Post', value: 'skill_calendar_post', icon: '🗓️' },
                    { id: '6', label: 'Web Content', value: 'skill_website_content', icon: '🌐' },
                    { id: '7', label: 'Gen Image', value: 'skill_generate_image', icon: '🎨' }
                ]);
                addSchmidtResponse("Cancelled. What else?");
                break;

            default:
                console.warn("Unknown Artie Action:", action);
                addSchmidtResponse(`I'm learning a new trick called ${action}, but I haven't mastered it yet.`);
                setOpsState('selecting_skill');
        }
    }, [draftData, eventDraft, opsState, validateLCBCompliance, validateSchedule, venue, fetchVenue, persona]);

    const addArtieMessage = useCallback((text: string, imageUrl?: string) => {
        const newMessage: ArtieMessage = {
            id: `artie-${Date.now()}`,
            role: 'artie',
            text,
            timestamp: Date.now(),
            imageUrl
        };
        setMessages(prev => [...prev, newMessage]);
    }, []);

    const resetOps = useCallback(() => {
        setMessages([]);
        setOpsState('idle');
        setDraftData({});
        setEventDraft({ imageState: 'none' });
        setCurrentBubbles([]); // CLEAR BUBBLES

        // Final sanity re-init
        setMessages([{
            id: 'artie-init',
            role: 'artie',
            text: `${persona === 'schmidt' ? 'Schmidt' : 'Artie'} here. System reset complete. Ready for new orders.`,
            timestamp: Date.now()
        }]);

        // Trigger start session to repopulate bubbles
        processAction('START_SESSION');
    }, [processAction, persona]);

    return {
        persona,
        setPersona,
        opsState,
        setOpsState, // Exposed for external control (e.g. Edit button)
        messages,
        currentBubbles,
        processAction,
        draftData,
        isLoading,
        venue,
        error,
        addArtieMessage,
        resetOps
    };
};
