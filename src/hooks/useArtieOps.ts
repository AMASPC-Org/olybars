
// File: src/hooks/useArtieOps.ts
import { useState, useCallback } from 'react';
import { QuickReplyOption } from '../components/artie/QuickReplyChips';
import { VenueOpsService } from '../services/VenueOpsService';

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
    | 'event_input_details' // Interview Mode: Asking for Description/Prizes
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
    type?: string;
}

// 2. Regulatory Guardrails (LCB Compliance)
const LCB_FORBIDDEN_TERMS = ['free alcohol', 'free beer', 'free shots', 'free drinks', 'unlimited', 'bottomless', 'complimentary', 'giveaway', '0.00', '$0'];
const ALCOHOL_TERMS = ['beer', 'wine', 'shots', 'cocktails', 'drinks', 'booze', 'ipa', 'stout', 'pilsner', 'mimosas', 'tequila', 'whiskey', 'vodka', 'gin', 'rum'];

export const useArtieOps = () => {
    const [opsState, setOpsState] = useState<ArtieOpsState>('idle');
    const [messages, setMessages] = useState<ArtieMessage[]>([]);
    const [currentBubbles, setCurrentBubbles] = useState<QuickReplyOption[]>([]);
    const [draftData, setDraftData] = useState<any>({});
    const [eventDraft, setEventDraft] = useState<EventDraft>({}); // Specific state for the interview
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

        const addArtieResponse = (text: string, options: QuickReplyOption[] = []) => {
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
                addArtieResponse("Welcome back! I'm ready to help. What's the mission?", [
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
                addUserMessage('Flash Bounty');
                setOpsState('flash_deal_init_method');
                addArtieResponse("Let's fill some seats. Do you have a deal in mind, or want some ideas?", [
                    { id: 'have_deal', label: 'I have a deal', value: 'method_manual_input', icon: '📝' },
                    { id: 'need_ideas', label: 'Help me decide', value: 'method_ideation', icon: '💡' }
                ]);
                break;

            // --- BRANCH: IDEATION (Placeholder) ---
            case 'method_ideation':
                addUserMessage('Help me decide');
                setIsLoading(true);

                // Analyze high margin items
                const highMarginItems = venue?.fullMenu?.filter((item: any) => item.margin_tier === 'High') || [];

                if (highMarginItems.length > 0) {
                    const pickedItem = highMarginItems[Math.floor(Math.random() * highMarginItems.length)];
                    addArtieResponse(`I took a look at your menu. Your **${pickedItem.name}** has a great margin. \n\nHow about a Flash Bounty like: "$2 off ${pickedItem.name} for the next hour"?`, [
                        { id: 'accept_idea', label: 'Sounds good', value: 'accept_ideation_proposal', icon: '✅' },
                        { id: 'manual', label: 'I have a different idea', value: 'method_manual_input', icon: '📝' }
                    ]);
                    setDraftData({ pickedItem });
                } else {
                    addArtieResponse("I'm still learning your menu! Once I have your food and drink list, I'll be able to suggest high-margin specials. \n\nFor now, please enter the deal manually.");
                    setTimeout(() => {
                        setOpsState('flash_deal_input');
                        addArtieResponse("So, what's the deal? (e.g., '$5 Pints until 8pm')");
                    }, 1500);
                }
                setIsLoading(false);
                break;

            case 'accept_ideation_proposal':
                const proposal = `$2 off ${draftData.pickedItem?.name} for the next hour`;
                addUserMessage('Sounds good');
                await processAction('SUBMIT_DEAL_TEXT', proposal);
                break;

            // --- BRANCH: MANUAL INPUT ---
            case 'method_manual_input':
                addUserMessage('I have a deal');
                setOpsState('flash_deal_input');
                addArtieResponse("Got it. What's the offer? (e.g., 'Half price nachos', '$4 Wells')");
                break;

            case 'SUBMIT_DEAL_TEXT':
                if (!payload) return;
                addUserMessage(payload);
                setIsLoading(true);

                const compliance = validateLCBCompliance(payload);

                if (!compliance.valid) {
                    setIsLoading(false);
                    addArtieResponse(`⚠️ Hold on. ${compliance.reason}`);
                } else {
                    const now = new Date();
                    const startTimeISO = now.toISOString();
                    const duration = 60;

                    const trafficCheck = await validateSchedule(startTimeISO, duration);
                    if (!trafficCheck.valid) {
                        setIsLoading(false);
                        addArtieResponse(`⚠️ I can't schedule that. ${trafficCheck.reason}`);
                    } else {
                        setDraftData({
                            skill: 'schedule_flash_deal',
                            params: {
                                summary: payload,
                                details: "Limited time offer. See bartender for details.",
                                startTimeISO: startTimeISO,
                                duration: duration,
                                staffBriefingConfirmed: true,
                                price: "See details"
                            }
                        });

                        setIsLoading(false);
                        setOpsState('confirm_action');
                        addArtieResponse(`Looks valid. I've drafted this:\n\n"${payload}"\n\nStarting: NOW\nDuration: 1 Hour\n\nPost to the Buzz Clock?`, [
                            { id: 'confirm', label: 'Post It', value: 'confirm_post', icon: '🚀' },
                            { id: 'edit', label: 'Edit', value: 'skill_flash_deal', icon: '✏️' },
                            { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
                        ]);
                    }
                }
                break;

            // --- SKILL: ADD EVENT (INTERVIEW MODE) ---
            case 'skill_add_event':
                addUserMessage('Add Event');
                // Reset draft
                setEventDraft({});
                setOpsState('event_input');
                addArtieResponse("Paste the event details (Name, Date, Time) or a link to the Facebook event.");
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
                        currentDraft.title = payload;
                    }
                }

                setEventDraft(currentDraft);
                setIsLoading(false);

                // 2. The Slot Filling State Machine
                if (!currentDraft.title) {
                    setOpsState('event_input_title');
                    addArtieResponse("I didn't catch the name. What is the title of the event?");
                    return;
                }

                if (!currentDraft.date) {
                    setOpsState('event_input_date');
                    addArtieResponse("Got it. What date is this happening?", [
                        { id: 'today', label: 'Today', value: 'SUBMIT_EVENT_TEXT', icon: '📅' },
                        { id: 'tmrw', label: 'Tomorrow', value: 'SUBMIT_EVENT_TEXT', icon: '⏭️' }
                    ]);
                    return;
                }

                if (!currentDraft.time) {
                    setOpsState('event_input_time');
                    addArtieResponse(`Okay, ${currentDraft.date}. What time does it start?`, [
                        { id: '7pm', label: '7:00 PM', value: 'SUBMIT_EVENT_TEXT', icon: '🕖' },
                        { id: '8pm', label: '8:00 PM', value: 'SUBMIT_EVENT_TEXT', icon: '🕗' },
                        { id: '9pm', label: '9:00 PM', value: 'SUBMIT_EVENT_TEXT', icon: '🕘' }
                    ]);
                    return;
                }

                // NEW: Type Check
                if (!currentDraft.type) {
                    setOpsState('event_input_type');
                    // Simple heuristic: if payload mentions trivia/karaoke, auto-fill
                    const lower = payload.toLowerCase();
                    if (lower.includes('trivia')) currentDraft.type = 'trivia';
                    else if (lower.includes('karaoke')) currentDraft.type = 'karaoke';
                    else if (lower.includes('music') || lower.includes('band') || lower.includes('live')) currentDraft.type = 'live_music';
                    else if (lower.includes('bingo')) currentDraft.type = 'bingo';
                    else if (lower.includes('pool') || lower.includes('tournament') || lower.includes('party')) currentDraft.type = 'other';

                    if (!currentDraft.type) {
                        setEventDraft(currentDraft); // Save progress
                        addArtieResponse("What kind of event is this?", [
                            { id: 'trivia', label: 'Trivia', value: 'SUBMIT_EVENT_TEXT', icon: '🧠' },
                            { id: 'karaoke', label: 'Karaoke', value: 'SUBMIT_EVENT_TEXT', icon: '🎤' },
                            { id: 'music', label: 'Live Music', value: 'SUBMIT_EVENT_TEXT', icon: '🎸' },
                            { id: 'other', label: 'Other', value: 'SUBMIT_EVENT_TEXT', icon: '🎉' }
                        ]);
                        return;
                    }
                }

                // NEW: Details/Description Check
                if (!currentDraft.description) {
                    setOpsState('event_input_details');
                    setEventDraft(currentDraft);

                    // Context-aware prompting based on type
                    let promptText = "Any specials, prizes, or rules I should mention? (Or type 'none' to skip)";
                    const t = currentDraft.type;

                    if (t === 'trivia' || t === 'bingo') promptText = "What are the prizes for the winners? (e.g. $50 Tab)";
                    else if (t === 'live_music') promptText = "Is there a cover charge? Who is opening?";
                    else if (t === 'karaoke') promptText = "Any drink specials for singers?";

                    addArtieResponse(promptText);
                    return;
                }

                // 3. All slots filled -> Confirmation
                setDraftData({
                    skill: 'add_calendar_event',
                    params: {
                        ...currentDraft,
                        type: currentDraft.type || 'other',
                        venueName: venue?.name || '',
                        summary: `${currentDraft.title} on ${currentDraft.date}` // Populates the card
                    }
                });

                setOpsState('confirm_action');
                addArtieResponse(`I've drafted a calendar entry for:\n\n"${currentDraft.title}"\n${currentDraft.date} @ ${currentDraft.time}\nType: ${currentDraft.type}\n\n"${currentDraft.description}"\n\nConfirm adding this to the schedule?`, [
                    // Chips removed to reduce redundancy as requested, OR kept for easy mobile use?
                    // User said "I think those are good". But "confirm and save button... seems redundant".
                    // Let's keep chips as they are quick replies, but maybe minimalize them.
                    { id: 'confirm', label: 'Add Event', value: 'confirm_post', icon: '✅' },
                    { id: 'edit', label: 'Edit', value: 'edit_event', icon: '✏️' }, // Changed value to trigger specific logic
                    { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
                ]);
                break;

            // --- SKILL: Social Post ---
            case 'skill_social_post':
                addUserMessage('Social Post');
                setOpsState('social_post_input');
                addArtieResponse("I'm ready to draft. What's the post about? (e.g. 'New IPA on tap', 'Live music at 8pm')");
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
                addArtieResponse(`I've drafted this for you:\n\n"${draft}"\n\nSave to your marketing dashboard?`, [
                    { id: 'confirm', label: 'Save Draft', value: 'confirm_post', icon: '🚀' },
                    { id: 'gen_img', label: 'Gen Image', value: 'skill_generate_image', icon: '🎨' },
                    { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
                ]);
                break;

            // --- SKILL: Email Draft ---
            case 'skill_email_draft':
                addUserMessage('Draft Email');
                setOpsState('email_draft_input');
                addArtieResponse("Who are we emailing, and what's the occasion? (e.g. 'Newsletter to regulars about Saturday trivia')");
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
                addArtieResponse(`I've drafted this email:\n\n"${emailDraft}"\n\nSave to your marketing dashboard?`, [
                    { id: 'confirm', label: 'Save Draft', value: 'confirm_post', icon: '🚀' },
                    { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
                ]);
                break;

            // --- SKILL: Calendar Post ---
            case 'skill_calendar_post':
                addUserMessage('Calendar Post');
                setOpsState('calendar_post_input');
                addArtieResponse("What event should I add to the community calendar? (e.g. 'St Paddy's Day Bash, March 17th, 6pm')");
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
                addArtieResponse(`I've prepared this calendar entry:\n\n"${payload}"\n\nPush it to the OlyBars calendar?`, [
                    { id: 'confirm', label: 'Post It', value: 'confirm_post', icon: '✅' },
                    { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
                ]);
                break;

            // --- SKILL: Website Content ---
            case 'skill_website_content':
                addUserMessage('Web Content');
                setOpsState('website_content_input');
                addArtieResponse("What page or section are we updating? (e.g. 'About Us section on the homepage')");
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
                addArtieResponse(`Web content drafted:\n\n"${webDraft}"\n\nSave this for your web dev?`, [
                    { id: 'confirm', label: 'Save', value: 'confirm_post', icon: '✅' },
                    { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
                ]);
                break;

            // --- SKILL: Generate Image ---
            case 'skill_generate_image':
                addUserMessage('Gen Image');
                setOpsState('image_gen_purpose');
                addArtieResponse("I'm on it. To get the perfect result, I need a little intel. \n\nWhat is this image for?", [
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
                addArtieResponse(`Got it, a ${payload}. \n\nWhat's the main goal of this asset?`, [
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
                    addArtieResponse("Tell me about the event. (e.g. 'Trivia Night, 8pm, high energy')");
                } else {
                    setOpsState('image_gen_audience');
                    addArtieResponse("Who's the target audience for this? (e.g. 'Regulars', 'Families', 'Night owls')");
                }
                break;

            case 'SUBMIT_IMAGE_EVENT':
                if (!payload) return;
                addUserMessage(payload);
                setDraftData({ ...draftData, eventDetails: payload });
                setOpsState('image_gen_audience');
                addArtieResponse("Solid. And who's the target audience? (e.g. 'Late night party crowd', 'Craft beer lovers')");
                break;

            case 'SUBMIT_IMAGE_AUDIENCE':
                if (!payload) return;
                addUserMessage(payload);
                setDraftData({ ...draftData, audience: payload });
                setOpsState('image_gen_specials');
                addArtieResponse("Are there any specific specials or details I should include in the visual context?", [
                    { id: 'none', label: 'Just the vibe', value: 'no_specials' }
                ]);
                break;

            case 'SUBMIT_IMAGE_SPECIALS':
                if (!payload) return;
                addUserMessage(payload);
                setDraftData({ ...draftData, specials: payload === 'no_specials' ? 'None' : payload });
                setOpsState('image_gen_context');
                addArtieResponse("Final question—do you have any specific input or creative context you'd like me to follow? (Colors, lighting, specific items)");
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
                addArtieResponse(`Artie is firing up the kiln... 🎨\n\nI've generated a multimodal prompt based on our brief: \n\n"${prompt}"\n\nGenerate and save to your dashboard?`, [
                    { id: 'confirm', label: 'Generate', value: 'confirm_post', icon: '🎨' },
                    { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
                ]);
                break;

            case 'edit_event':
                // Reset to inputs but keep draft data
                setOpsState('event_input');
                addArtieResponse("Okay, let's fix the details. Paste the correct info or type what you want to change.");
                break;

            case 'COMPLETE_IMAGE_GEN':
                setOpsState('post_image_gen');
                addArtieResponse("Visual assets are staged. Shall I draft the high-engagement social copy to go with this visual?", [
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

                addArtieResponse(`Here is your suggested ad copy:\n\n---\n${adCopy}\n---\n\nWould you like to save this draft to your marketing suite?`, [
                    { id: 'save_copy', label: 'Save Copy', value: 'completed', icon: '🚀' },
                    { id: 'edit_copy', label: 'Edit', value: 'skill_social_post', icon: '✏️' }
                ]);
                setIsLoading(false);
                break;

            // --- CONFIRMATION & EXECUTION ---
            case 'confirm_post':
                if (opsState === 'confirm_action' && draftData.skill === 'generate_image') {
                    await processAction('COMPLETE_IMAGE_GEN');
                    break;
                }
                setOpsState('completed');
                addArtieResponse("Processing...");
                break;

            case 'cancel':
                setOpsState('selecting_skill');
                setDraftData({});
                setEventDraft({});
                addArtieResponse("Cancelled. What else?", [
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
                addArtieResponse(`I'm learning a new trick called ${action}, but I haven't mastered it yet.`);
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
        setEventDraft({});
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