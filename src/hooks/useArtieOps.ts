
// File: src/hooks/useArtieOps.ts
import { useState, useCallback } from 'react';
import { QuickReplyOption } from '../components/artie/QuickReplyChips';
import { VenueOpsService } from '../services/VenueOpsService';
import * as FlashBounty from '../skills/Schmidt/flashBounty';

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

export const useArtieOps = () => {
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


    // 5. The Skill State Machine
    const processAction = useCallback(async (action: string, rawPayload?: string, venueId?: string) => {
        setError(null);
        const payload = rawPayload?.trim();

        if (venueId && !venue) {
            await fetchVenue(venueId);
        }

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

        switch (action) {
            case 'START_SESSION':
                setOpsState('selecting_skill');
                setMessages([]);
                addSchmidtResponse("Welcome back! I'm ready to help. What's the mission?", [
                    { id: '1', label: 'Flash Bounty', value: 'skill_flash_deal', icon: '⚡' },
                    { id: '2', label: 'Add Event', value: 'skill_add_event', icon: '📅' },
                    { id: '3', label: 'Social Post', value: 'skill_social_post', icon: '📱' },
                    { id: '4', label: 'Draft Email', value: 'skill_email_draft', icon: '✉️' },
                    { id: '5', label: 'Calendar Post', value: 'skill_calendar_post', icon: '🗓️' },
                    { id: '6', label: 'Web Content', value: 'skill_website_content', icon: '🌐' },
                    { id: '7', label: 'Gen Image', value: 'skill_generate_image', icon: '🎨' }
                ]);
                break;

            // --- SKILL: Flash Bounty ---
            case 'skill_flash_deal':
                FlashBounty.handleFlashBountyInit(addUserMessage, setOpsState, addSchmidtResponse);
                break;

            case 'bounty_food':
            case 'bounty_drink':
            case 'bounty_time':
                FlashBounty.handleTypeSelection(action, addUserMessage, setDraftData, setOpsState, addSchmidtResponse);
                break;

            case 'method_ideation':
                FlashBounty.handleMethodIdeation(addUserMessage, setIsLoading, venue, addSchmidtResponse, setOpsState, setDraftData);
                break;

            case 'accept_ideation_proposal':
                await FlashBounty.handleAcceptIdeationProposal(addUserMessage, draftData, processAction);
                break;

            case 'method_manual_input':
                FlashBounty.handleMethodManualInput(addUserMessage, setOpsState, addSchmidtResponse);
                break;

            case 'SUBMIT_DEAL_TEXT':
                await FlashBounty.handleSubmitBountyText(payload, addUserMessage, setIsLoading, validateLCBCompliance, validateSchedule, draftData, setDraftData, setOpsState, addSchmidtResponse);
                break;

            // --- SKILL: ADD EVENT (INTERVIEW MODE) ---
            case 'skill_add_event':
                addUserMessage('Add Event');
                // Reset draft
                setEventDraft({ imageState: 'none' });
                setOpsState('event_init_check_flyer');
                addSchmidtResponse("Do you have an existing flyer or image for this event?", [
                    { id: 'event_has_flyer', label: 'Yes, I have one', value: 'event_has_flyer', icon: '🖼️' },
                    { id: 'event_no_flyer', label: 'No', value: 'event_no_flyer', icon: '📝' }
                ]);
                break;

            case 'event_has_flyer':
                addUserMessage('Yes, I have one');
                setOpsState('event_upload_wait');
                addSchmidtResponse("Great! Drag and drop it here (or click the paperclip).");
                break;

            case 'event_no_flyer':
                addUserMessage('No');
                setOpsState('event_init_check_gen');
                addSchmidtResponse("Would you like me to design a promotional image for you using the Artsian Spirit?", [
                    { id: 'event_gen_flyer', label: 'Yes, Create One', value: 'event_gen_flyer', icon: '🎨' },
                    { id: 'event_text_only', label: 'No, Just Text', value: 'event_text_only', icon: '📝' }
                ]);
                break;

            case 'event_gen_flyer':
                addUserMessage('Yes, Create One');
                setDraftData({ ...draftData, isEventFlyer: true });
                setEventDraft(prev => ({ ...prev, imageState: 'generated' }));
                await processAction('skill_generate_image');
                break;

            case 'event_text_only':
                addUserMessage('No, Just Text');
                setOpsState('event_input');
                addSchmidtResponse("Paste the event details (Name, Date, Time) or a link to the Facebook event.");
                break;

            case 'SUBMIT_EVENT_TEXT':
                if (!payload) return;
                addUserMessage(payload);
                setIsLoading(true);

                // 1. Merge new input into our running draft
                const currentDraft = { ...eventDraft };
                const lowerPayload = payload.toLowerCase();

                // 0. State-Based Capture (Fix for "Infinite Loop" on Details)
                if (opsState === 'event_input_details') {
                    currentDraft.description = payload;
                } else if (opsState === 'event_input_type') {
                    currentDraft.type = payload.toLowerCase().replace(' ', '_') as any;
                } else if (opsState === 'event_input_prizes') {
                    currentDraft.prizes = payload;
                } else if (opsState === 'event_input_date') {
                    // Prioritize date parsing logic here to ensure Chips work
                    const lower = payload.toLowerCase();
                    if (lower.includes('today') || lower.includes('tonig')) {
                        currentDraft.date = new Date().toISOString().split('T')[0];
                    } else if (lower.includes('tomorrow') || lower.includes('tomm')) {
                        const tmrw = new Date();
                        tmrw.setDate(tmrw.getDate() + 1);
                        currentDraft.date = tmrw.toISOString().split('T')[0];
                    } else {
                        // Numeric fallback
                        const dateMatch = payload.match(/(\d{1,2})[/-](\d{1,2})([/-](\d{2,4}))?/);
                        if (dateMatch) currentDraft.date = dateMatch[0];
                    }
                }

                // Heuristics: Try to guess what the user said (only if we aren't in a specific capture state)

                // TYPE PARSING (Heuristic)
                if (!currentDraft.type) {
                    if (lowerPayload.includes('trivia')) currentDraft.type = 'trivia';
                    else if (lowerPayload.includes('karaoke')) currentDraft.type = 'karaoke';
                    else if (lowerPayload.includes('music') || lowerPayload.includes('band') || lowerPayload.includes('live')) currentDraft.type = 'live_music';
                    else if (lowerPayload.includes('bingo')) currentDraft.type = 'bingo';
                    else if (lowerPayload.includes('mic') || lowerPayload.includes('comedy')) currentDraft.type = 'openmic';
                }

                // TIME PARSING
                let timeMatchResult = payload.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);

                if (!timeMatchResult) {
                    const strictMatch = payload.match(/(\d{1,2})[:.](\d{2})/);
                    if (strictMatch) {
                        timeMatchResult = [strictMatch[0], strictMatch[1], strictMatch[2], undefined as unknown as string] as RegExpMatchArray;
                    }
                }

                if (timeMatchResult) {
                    const h = timeMatchResult[1];
                    const m = timeMatchResult[2] || '00';
                    const mer = timeMatchResult[3];

                    if (mer) {
                        let hour = parseInt(h);
                        if (mer.toLowerCase() === 'pm' && hour < 12) hour += 12;
                        if (mer.toLowerCase() === 'am' && hour === 12) hour = 0;
                        currentDraft.time = `${hour}:${m}`;
                    } else {
                        currentDraft.time = `${h}:${m}`;
                    }
                }

                // DATE PARSING
                // 1. Keywords (with fuzzy matching for typos like "tongight")
                if (lowerPayload.includes('today') || lowerPayload.includes('tonig')) {
                    currentDraft.date = new Date().toISOString().split('T')[0];
                } else if (lowerPayload.includes('tomorrow') || lowerPayload.includes('tomm')) {
                    const tmrw = new Date();
                    tmrw.setDate(tmrw.getDate() + 1);
                    currentDraft.date = tmrw.toISOString().split('T')[0];
                }
                // 2. Numeric Dates (e.g. 1/15, 1-15, 1/15/26)
                else {
                    const dateMatch = payload.match(/(\d{1,2})[/-](\d{1,2})([/-](\d{2,4}))?/);
                    if (dateMatch) {
                        currentDraft.date = dateMatch[0];
                    }
                }

                // TITLE PARSING
                // If we don't have a title yet, assume the first input was the title 
                // BUT exclude it if it was clearly JUST a date/time response
                const isShortInput = payload.length < 15;
                const matchesDateOrTime = timeMatchResult
                    || lowerPayload.includes('today')
                    || lowerPayload.includes('tonig')
                    || lowerPayload.includes('tomorrow')
                    || lowerPayload.includes('tomm');

                // Only exclude if it matches a date/time AND is short.
                // "Trivia Night tonight" (length ~20) should NOT be excluded.
                const isJustDateOrTime = matchesDateOrTime && isShortInput;

                if (!currentDraft.title && !isJustDateOrTime && payload.length > 3) {
                    // Check if it's not just a digit string
                    if (!/^\d+$/.test(payload)) {
                        let cleanedTitle = payload;
                        // Strip time string if found
                        if (timeMatchResult && timeMatchResult[0]) {
                            cleanedTitle = cleanedTitle.replace(timeMatchResult[0], '');
                        }
                        // Strip date keywords (insensitive)
                        cleanedTitle = cleanedTitle.replace(/today|tonight|tomorrow/gi, '');

                        // Strip common prepositions left dangling (trailing/leading)
                        cleanedTitle = cleanedTitle.replace(/\s+at\s*$/i, '').replace(/^\s*at\s+/i, '');

                        // [CRITICAL FIX] If the title is just the trigger sentence "I want to add an event...", ignore it.
                        const lowerTitle = cleanedTitle.toLowerCase();
                        const isConversationalTrigger = (lowerTitle.includes('event') && lowerTitle.includes('calendar')) || lowerTitle.startsWith('i am having') || lowerTitle.startsWith('i need to');

                        if (!isConversationalTrigger) {
                            currentDraft.title = cleanedTitle.trim();
                        }
                    }
                }

                // 2. The Slot Filling State Machine
                if (!currentDraft.title) {
                    setOpsState('event_input_title');
                    addSchmidtResponse("I didn't catch the name. What is the OFFICIAL title of the event?"); // Emphasize official
                    return;
                }

                setEventDraft(currentDraft);
                setIsLoading(false);

                // 2. The Slot Filling State Machine
                if (!currentDraft.title) {
                    setOpsState('event_input_title');
                    addSchmidtResponse("I didn't catch the name. What is the title of the event?");
                    return;
                }

                if (!currentDraft.date) {
                    setOpsState('event_input_date');
                    addSchmidtResponse("Got it. What date is this happening?", [
                        { id: 'today', label: 'Today', value: 'SUBMIT_EVENT_TEXT', icon: '📅' },
                        { id: 'tmrw', label: 'Tomorrow', value: 'SUBMIT_EVENT_TEXT', icon: '⏭️' }
                    ]);
                    return;
                }

                if (!currentDraft.time) {
                    setOpsState('event_input_time');
                    addSchmidtResponse(`Okay, ${currentDraft.date}. What time does it start?`, [
                        { id: '7pm', label: '7:00 PM', value: 'SUBMIT_EVENT_TEXT', icon: '🕖' },
                        { id: '8pm', label: '8:00 PM', value: 'SUBMIT_EVENT_TEXT', icon: '🕗' },
                        { id: '9pm', label: '9:00 PM', value: 'SUBMIT_EVENT_TEXT', icon: '🕘' }
                    ]);
                    return;
                }

                // NEW: Type Check (Priority #1)
                if (!currentDraft.type) {
                    setOpsState('event_input_type');
                    addSchmidtResponse("What kind of event is this?", [
                        { id: 'trivia', label: 'Trivia', value: 'SUBMIT_EVENT_TEXT', icon: '🧠' },
                        { id: 'karaoke', label: 'Karaoke', value: 'SUBMIT_EVENT_TEXT', icon: '🎤' },
                        { id: 'music', label: 'Live Music', value: 'SUBMIT_EVENT_TEXT', icon: '🎸' },
                        { id: 'other', label: 'Other', value: 'SUBMIT_EVENT_TEXT', icon: '🎉' }
                    ]);
                    return;
                }

                // NEW: Prizes Check (Priority #2 - Dynamic)
                if (!currentDraft.prizes && (currentDraft.type === 'trivia' || currentDraft.type === 'bingo')) {
                    setOpsState('event_input_prizes');
                    setEventDraft(currentDraft);
                    addSchmidtResponse("Winner's circle intel: What are the prizes? (e.g. $50 Venue Tab, OlyBars T-Shirt)");
                    return;
                }

                // NEW: Details/Description Check (Priority #3)
                if (!currentDraft.description && payload.toLowerCase() !== 'none') {
                    setOpsState('event_input_details');
                    setEventDraft(currentDraft);

                    // Context-aware prompting based on type
                    let promptText = "Any rules or details I should mention? (Or type 'none' to skip)";
                    const t = currentDraft.type;

                    if (t === 'live_music') promptText = "Is there a cover charge? Who is opening?";
                    else if (t === 'karaoke') promptText = "Any drink specials for singers?";

                    addSchmidtResponse(promptText);
                    return;
                }

                // 3. All facts collected -> Transition to Creative Engine
                setEventDraft(currentDraft);
                await processAction('generating_creative_copy');
                break;

            case 'generating_creative_copy':
                setOpsState('generating_creative_copy');
                setIsLoading(true);
                addArtieMessage("Schmidt is cooking up the marketing blurb... 🍳");

                try {
                    // Use payload as a vibe override if available to prevent race conditions with setEventDraft
                    const requestedVibe = (payload && ['hype', 'chill', 'funny', 'standard'].includes(payload))
                        ? (payload as 'hype' | 'chill' | 'funny' | 'standard')
                        : (eventDraft.vibeMode || 'standard');

                    const copy = await VenueOpsService.generateEventCopy(
                        eventDraft,
                        venue?.id || venueId || '',
                        requestedVibe
                    );

                    const finalDraft = { ...eventDraft, marketingCopy: copy };
                    setEventDraft(finalDraft);
                    setIsLoading(false);
                    setOpsState('review_event_copy');

                    addSchmidtResponse(`How does this blurb sound?\n\n"${copy}"`, [
                        { id: 'copy_ok', label: 'Looks Great', value: 'copy_approved', icon: '✅' },
                        { id: 'regen_hype', label: 'More Hype!', value: 'regen_hype', icon: '🔥' },
                        { id: 'regen_chill', label: 'Chill it out', value: 'regen_chill', icon: '🌊' },
                        { id: 'regen_funny', label: 'Make it funny', value: 'regen_funny', icon: '😂' }
                    ]);
                } catch (e: any) {
                    setIsLoading(false);
                    console.error("Copy Gen Failed:", e);
                    addSchmidtResponse("Schmidt's creative engine stalled. Let's use the facts for now.", [
                        { id: 'fallback', label: 'Use Facts', value: 'copy_approved' }
                    ]);
                }
                break;

            case 'copy_approved':
                addUserMessage('Looks Great');
                // Proceed to confirmation or image gen check
                setOpsState('confirm_action');
                setDraftData({
                    skill: 'add_calendar_event',
                    params: {
                        ...eventDraft,
                        description: eventDraft.marketingCopy || eventDraft.description || `${eventDraft.title} on ${eventDraft.date}`,
                        venueName: venue?.name || '',
                        summary: `${eventDraft.title} on ${eventDraft.date}`
                    }
                });

                const [h, m] = (eventDraft.time || '20:00').split(':');
                let hour1 = parseInt(h);
                const ampm1 = hour1 >= 12 ? 'PM' : 'AM';
                const hour12_1 = hour1 % 12 || 12;
                const displayTime1 = `${hour12_1}:${m} ${ampm1}`;

                addSchmidtResponse(`Ready to schedule!\n\n**${eventDraft.title}**\n${eventDraft.date} @ ${displayTime1}\n\n"${eventDraft.marketingCopy || eventDraft.description}"\n\nConfirm adding this to the schedule?`, [
                    { id: 'confirm', label: 'Post It', value: 'confirm_post', icon: '✅' },
                    { id: 'gen_img', label: 'Gen Image', value: 'skill_generate_image', icon: '🎨' },
                    { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
                ]);
                break;

            case 'regen_hype':
                addUserMessage('More Hype!');
                setEventDraft(prev => ({ ...prev, vibeMode: 'hype' }));
                await processAction('generating_creative_copy', 'hype');
                break;

            case 'regen_chill':
                addUserMessage('Chill it out');
                setEventDraft(prev => ({ ...prev, vibeMode: 'chill' }));
                await processAction('generating_creative_copy', 'chill');
                break;

            case 'regen_funny':
                addUserMessage('Make it funny');
                setEventDraft(prev => ({ ...prev, vibeMode: 'funny' }));
                await processAction('generating_creative_copy', 'funny');
                break;

            // --- SKILL: Social Post ---
            case 'skill_social_post':
                addUserMessage('Social Post');
                setOpsState('social_post_input');
                addSchmidtResponse("I'm ready to draft. What's the post about? (e.g. 'New IPA on tap', 'Live music at 8pm')");
                break;

            case 'SUBMIT_SOCIAL_POST_TEXT':
                if (!payload) return;
                addUserMessage(payload);
                setIsLoading(true);

                // Simple AI-like drafting (Client side for now)
                const draft = `✨ OLYBARS EXCLUSIVE ✨\n\n${payload} at ${venue?.name || 'our place'}! \n\nCome down and join the vibe. 🍻\n\n#OlyBars #Olympia #Nightlife`;

                setDraftData({
                    skill: 'promote_menu_item', // Reusing this for general social drafts
                    params: {
                        item_name: 'Special Update',
                        copy: draft
                    }
                });

                setIsLoading(false);
                setOpsState('confirm_action');
                addSchmidtResponse(`I've drafted this for you:\n\n"${draft}"\n\nSave to your marketing dashboard?`, [
                    { id: 'confirm', label: 'Save Draft', value: 'confirm_post', icon: '🚀' },
                    { id: 'gen_img', label: 'Gen Image', value: 'skill_generate_image', icon: '🎨' },
                    { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
                ]);
                break;

            // --- SKILL: Email Draft ---
            case 'skill_email_draft':
                addUserMessage('Draft Email');
                setOpsState('email_draft_input');
                addSchmidtResponse("Who are we emailing, and what's the occasion? (e.g. 'Newsletter to regulars about Saturday trivia')");
                break;

            case 'SUBMIT_EMAIL_TEXT':
                if (!payload) return;
                addUserMessage(payload);
                setIsLoading(true);

                const emailDraft = `Subject: Big News from ${venue?.name || 'OlyBars'}! 🍻\n\nHi everyone,\n\n${payload}\n\nWe can't wait to see you there!\n\nCheers,\nThe ${venue?.name || 'OlyBars'} Team`;

                setDraftData({
                    skill: 'draft_email',
                    params: {
                        subject: `Update from ${venue?.name}`,
                        body: emailDraft
                    }
                });

                setIsLoading(false);
                setOpsState('confirm_action');
                addSchmidtResponse(`I've drafted this email:\n\n"${emailDraft}"\n\nSave to your marketing dashboard?`, [
                    { id: 'confirm', label: 'Save Draft', value: 'confirm_post', icon: '🚀' },
                    { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
                ]);
                break;

            // --- SKILL: Calendar Post ---
            case 'skill_calendar_post':
                addUserMessage('Calendar Post');
                setOpsState('calendar_post_input');
                addSchmidtResponse("What event should I add to the community calendar? (e.g. 'St Paddy's Day Bash, March 17th, 6pm')");
                break;

            case 'SUBMIT_CALENDAR_TEXT':
                if (!payload) return;
                addUserMessage(payload);
                setIsLoading(true);

                setDraftData({
                    skill: 'add_to_calendar',
                    params: {
                        summary: payload,
                        venueId: venue?.id
                    }
                });

                setIsLoading(false);
                setOpsState('confirm_action');
                addSchmidtResponse(`I've prepared this calendar entry:\n\n"${payload}"\n\nPush it to the OlyBars calendar?`, [
                    { id: 'confirm', label: 'Post It', value: 'confirm_post', icon: '✅' },
                    { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
                ]);
                break;

            // --- SKILL: Website Content ---
            case 'skill_website_content':
                addUserMessage('Web Content');
                setOpsState('website_content_input');
                addSchmidtResponse("What page or section are we updating? (e.g. 'About Us section on the homepage')");
                break;

            case 'SUBMIT_WEB_TEXT':
                if (!payload) return;
                addUserMessage(payload);
                setIsLoading(true);

                const webDraft = `New Content for ${venue?.name}:\n\n"${payload}"\n\n(Optimized for local SEO and mobile engagement)`;

                setDraftData({
                    skill: 'update_website',
                    params: {
                        content: webDraft
                    }
                });

                setIsLoading(false);
                setOpsState('confirm_action');
                addSchmidtResponse(`Web content drafted:\n\n"${webDraft}"\n\nSave this for your web dev?`, [
                    { id: 'confirm', label: 'Save', value: 'confirm_post', icon: '✅' },
                    { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
                ]);
                break;

            // --- SKILL: Generate Image ---
            case 'skill_generate_image':
                addUserMessage('Gen Image');
                setOpsState('image_gen_purpose');
                addSchmidtResponse("I'm on it. To get the perfect result, I need a little intel. \n\nWhat is this image for?", [
                    { id: '1', label: 'Social Media', value: 'purpose_social', icon: '📱' },
                    { id: '2', label: 'Website', value: 'purpose_web', icon: '🌐' },
                    { id: '3', label: 'Print Flyer', value: 'purpose_print', icon: '📄' },
                    { id: '4', label: 'Member Only', value: 'purpose_exclusive', icon: '👑' }
                ]);
                break;

            case 'SUBMIT_IMAGE_PURPOSE':
                if (!payload) return;
                addUserMessage(payload);
                setDraftData({ ...draftData, purpose: payload });
                setOpsState('image_gen_goal');
                addSchmidtResponse(`Got it, a ${payload}. \n\nWhat's the main goal of this asset?`, [
                    { id: '1', label: 'Promote Event', value: 'goal_event', icon: '📅' },
                    { id: '2', label: 'Showcase Menu', value: 'goal_menu', icon: '🍔' },
                    { id: '3', label: 'Daily Vibe', value: 'goal_vibe', icon: '✨' },
                    { id: '4', label: 'Hiring/Team', value: 'goal_hiring', icon: '🤝' }
                ]);
                break;

            case 'SUBMIT_IMAGE_GOAL':
                if (!payload) return;
                addUserMessage(payload);
                setDraftData({ ...draftData, goal: payload });

                if (payload.toLowerCase().includes('event')) {
                    setOpsState('image_gen_event');
                    addSchmidtResponse("Tell me about the event. (e.g. 'Trivia Night, 8pm, high energy')");
                } else {
                    setOpsState('image_gen_audience');
                    addSchmidtResponse("Who's the target audience for this? (e.g. 'Regulars', 'Families', 'Night owls')");
                }
                break;

            case 'SUBMIT_IMAGE_EVENT':
                if (!payload) return;
                addUserMessage(payload);
                setDraftData({ ...draftData, eventDetails: payload });
                setOpsState('image_gen_audience');
                addSchmidtResponse("Solid. And who's the target audience? (e.g. 'Late night party crowd', 'Craft beer lovers')");
                break;

            case 'SUBMIT_IMAGE_AUDIENCE':
                if (!payload) return;
                addUserMessage(payload);
                setDraftData({ ...draftData, audience: payload });
                setOpsState('image_gen_specials');
                addSchmidtResponse("Are there any specific specials or details I should include in the visual context?", [
                    { id: 'none', label: 'Just the vibe', value: 'no_specials' }
                ]);
                break;

            case 'SUBMIT_IMAGE_SPECIALS':
                if (!payload) return;
                addUserMessage(payload);
                setDraftData({ ...draftData, specials: payload === 'no_specials' ? 'None' : payload });
                setOpsState('image_gen_context');
                addSchmidtResponse("Final question—do you have any specific input or creative context you'd like me to follow? (Colors, lighting, specific items)");
                break;

            case 'SUBMIT_IMAGE_CONTEXT':
                if (!payload) return;
                addUserMessage(payload);
                setIsLoading(true);

                const finalData = { ...draftData, context: payload };
                const prompt = `A high-end, professionally shot marketing image for ${venue?.name || 'an Olympia Bar'}.
Purpose: ${finalData.purpose}.
Goal: ${finalData.goal}.
${finalData.eventDetails ? `Focusing on: ${finalData.eventDetails}.` : ''}
Targeting: ${finalData.audience}.
Details to hint at: ${finalData.specials}.
Style/Vibe: ${finalData.context}.
Maintain the OlyBars brand aesthetic: Local, authentic, and vibrant Olympia energy. Use brand colors if applicable.`;

                setDraftData({
                    skill: 'generate_image',
                    params: {
                        prompt: prompt,
                        ...finalData
                    }
                });

                setIsLoading(false);
                setOpsState('confirm_action');
                addSchmidtResponse(`Artie is firing up the kiln... 🎨\n\nI've generated a multimodal prompt based on our brief: \n\n"${prompt}"\n\nGenerate and save to your dashboard?`, [
                    { id: 'confirm', label: 'Generate', value: 'confirm_post', icon: '🎨' },
                    { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
                ]);
                break;

            case 'edit_event':
                // Reset to inputs but keep draft data
                setOpsState('event_input');
                addSchmidtResponse("Okay, let's fix the details. Paste the correct info or type what you want to change.");
                break;

            case 'COMPLETE_IMAGE_GEN':
                setOpsState('post_image_gen');
                addSchmidtResponse("Visual assets are staged. Shall I draft the high-engagement social copy to go with this visual?", [
                    { id: 'draft_copy', label: 'Draft Ad Copy', value: 'skill_ad_copy', icon: '✍️' },
                    { id: 'edit_vis', label: 'Edit Visual', value: 'skill_generate_image', icon: '🎨' },
                    { id: 'finish', label: 'All Done', value: 'completed', icon: '✅' }
                ]);
                break;

            case 'skill_ad_copy':
                addUserMessage('Draft Ad Copy');
                setIsLoading(true);
                const { goal, audience, eventDetails, specials, context } = draftData;
                const adCopy = `✨ NEW ASSET ALERT ✨\n\nGoal: ${goal}\nTarget: ${audience}\n\n"Come down to ${venue?.name || 'Hannah\'s'}! 🍻 ${eventDetails ? `We've got ${eventDetails} happening.` : ''} ${specials !== 'None' ? `Don't miss out on ${specials}!` : ''} Our vibe is always ${context} and we can't wait to see you!"\n\n#OlyBars #SocialMarketing #LocalVibes`;

                addSchmidtResponse(`Here is your suggested ad copy:\n\n---\n${adCopy}\n---\n\nWould you like to save this draft to your marketing suite?`, [
                    { id: 'save_copy', label: 'Save Copy', value: 'completed', icon: '🚀' },
                    { id: 'edit_copy', label: 'Edit', value: 'skill_social_post', icon: '✏️' }
                ]);
                setIsLoading(false);
                break;

            // --- CONFIRMATION & EXECUTION ---
            case 'confirm_post':
                if (opsState === 'confirm_action' && draftData.skill === 'generate_image') {
                    if (draftData.isEventFlyer) {
                        setOpsState('event_input');
                        addSchmidtResponse("Visual assets are staged! Now, paste the event details (Name, Date, Time) so I can link them.");
                        break;
                    }
                    await processAction('COMPLETE_IMAGE_GEN');
                    break;
                }
                setOpsState('completed');

                let doneMsg = "Action complete. I've updated the system.";
                if (draftData.skill === 'add_calendar_event') {
                    const eventLink = `/venues/${venue?.id || ''}/events`;
                    if (eventDraft.imageState !== 'none') {
                        doneMsg = "Event & Assets Saved! Would you like to distribute this to social media now?";
                        addSchmidtResponse(doneMsg, [
                            { id: 'post_socials', label: 'Post to Socials', value: 'skill_social_post', icon: '📱' }
                        ]);
                        break;
                    } else {
                        doneMsg = `Event Created! View it here: [See Event](${eventLink})`;
                    }
                }

                addSchmidtResponse(`${doneMsg} What's next?`);
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

            case 'cancel':
                setOpsState('selecting_skill');
                setDraftData({});
                setEventDraft({ imageState: 'none' });
                addSchmidtResponse("Cancelled. What else?", [
                    { id: '1', label: 'Flash Bounty', value: 'skill_flash_deal', icon: '⚡' },
                    { id: '2', label: 'Add Event', value: 'skill_add_event', icon: '📅' },
                    { id: '3', label: 'Social Post', value: 'skill_social_post', icon: '📱' },
                    { id: '4', label: 'Draft Email', value: 'skill_email_draft', icon: '✉️' },
                    { id: '5', label: 'Calendar Post', value: 'skill_calendar_post', icon: '🗓️' },
                    { id: '6', label: 'Web Content', value: 'skill_website_content', icon: '🌐' },
                    { id: '7', label: 'Gen Image', value: 'skill_generate_image', icon: '🎨' }
                ]);
                break;

            default:
                console.warn("Unknown Artie Action:", action);
                addSchmidtResponse(`I'm learning a new trick called ${action}, but I haven't mastered it yet.`);
                setOpsState('selecting_skill');
        }
    }, [draftData, eventDraft, validateLCBCompliance, validateSchedule, venue]);

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
        setOpsState('event_input'); // Resets to initial input state
        setDraftData({ skill: 'none', params: {} });
        setEventDraft({ imageState: 'none' });
        // Re-inject initial greeting if desired, or let the component handle it
        setMessages([{
            id: 'artie-init',
            role: 'artie',
            text: `Schmidt here. System reset complete. Ready for new orders.`,
            timestamp: Date.now()
        }]);
    }, []);

    return {
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