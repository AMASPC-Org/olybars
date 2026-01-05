import { useState, useCallback } from 'react';
import { QuickReplyOption } from '../components/artie/QuickReplyChips';
import { VenueOpsService } from '../services/VenueOpsService';

// 1. State Definitions
export type ArtieOpsState =
    | 'idle'
    | 'selecting_skill'
    | 'flash_deal_init_method' // "I have a deal" vs "Help me"
    | 'flash_deal_input'
    | 'flash_deal_time_check'
    | 'event_input'
    | 'play_input'
    | 'social_post_input'
    | 'email_draft_input'
    | 'calendar_post_input'
    | 'website_content_input'
    | 'image_gen_input'
    | 'confirm_action'
    | 'completed';

export interface ArtieMessage {
    id: string;
    role: 'artie' | 'user';
    text: string;
    timestamp: number;
}

// 2. Regulatory Guardrails (LCB Compliance)
const LCB_FORBIDDEN_TERMS = ['free alcohol', 'free beer', 'free shots', 'free drinks', 'unlimited', 'bottomless', 'complimentary', 'giveaway', '0.00', '$0'];
const ALCOHOL_TERMS = ['beer', 'wine', 'shots', 'cocktails', 'drinks', 'booze', 'ipa', 'stout', 'pilsner', 'mimosas', 'tequila', 'whiskey', 'vodka', 'gin', 'rum'];

export const useArtieOps = () => {
    const [opsState, setOpsState] = useState<ArtieOpsState>('idle');
    const [messages, setMessages] = useState<ArtieMessage[]>([]);
    const [currentBubbles, setCurrentBubbles] = useState<QuickReplyOption[]>([]);
    const [draftData, setDraftData] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [venue, setVenue] = useState<any>(null);

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
        }
    }, []);

    // 3. The Compliance Engine
    const validateLCBCompliance = useCallback((text: string): { valid: boolean; reason?: string } => {
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
        // Mock venue for check - in real app would get from context
        const mockVenue = { partnerConfig: { tier: 'FREE', flashBountiesUsed: 0 } } as any;
        const check = await VenueOpsService.validateSlot(mockVenue, new Date(timeISO).getTime(), duration);
        return check;
    }, []);


    // 5. The Skill State Machine
    const processAction = useCallback(async (action: string, payload?: string, venueId?: string) => {
        // Auto-fetch if venueId provided and not loaded
        if (venueId && !venue) {
            await fetchVenue(venueId);
        }
        const newMessage: ArtieMessage = {
            id: Date.now().toString(),
            role: 'artie',
            text: '',
            timestamp: Date.now(),
        };

        // Helper to add user message before Artie responds
        const addUserMessage = (text: string) => {
            setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text, timestamp: Date.now() }]);
        };

        switch (action) {
            case 'START_SESSION':
                setOpsState('selecting_skill');
                newMessage.text = "Welcome back! I'm ready to help. What's the mission?";
                setMessages([newMessage]);
                setCurrentBubbles([
                    { id: '1', label: '⚡ Flash Bounty', value: 'skill_flash_deal', icon: '⚡' },
                    { id: '2', label: '📅 Add Event', value: 'skill_add_event', icon: '📅' },
                    { id: '3', label: '📱 Social Post', value: 'skill_social_post', icon: '📱' },
                    { id: '4', label: '✉️ Draft Email', value: 'skill_email_draft', icon: '✉️' },
                    { id: '5', label: '🗓️ Calendar Post', value: 'skill_calendar_post', icon: '🗓️' },
                    { id: '6', label: '🌐 Web Content', value: 'skill_website_content', icon: '🌐' },
                    { id: '7', label: '🎨 Gen Image', value: 'skill_generate_image', icon: '🎨' }
                ]);
                break;

            // --- SKILL: Flash Bounty INTRO ---
            case 'skill_flash_deal':
                addUserMessage('Flash Bounty');
                setOpsState('flash_deal_init_method');
                newMessage.text = "Let's fill some seats. Do you have a deal in mind, or want some ideas?";
                setMessages(prev => [...prev, newMessage]);
                setCurrentBubbles([
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
                    newMessage.text = `I took a look at your menu. Your **${pickedItem.name}** has a great margin. \n\nHow about a Flash Bounty like: "$2 off ${pickedItem.name} for the next hour"?`;
                    setMessages(prev => [...prev, newMessage]);
                    setCurrentBubbles([
                        { id: 'accept_idea', label: 'Sounds good', value: 'accept_ideation_proposal', icon: '✅' },
                        { id: 'manual', label: 'I have a different idea', value: 'method_manual_input', icon: '📝' }
                    ]);
                    // Save for the next step
                    setDraftData({ pickedItem });
                } else {
                    newMessage.text = "I'm still learning your menu! Once I have your food and drink list, I'll be able to suggest high-margin specials. \n\nFor now, please enter the deal manually.";
                    setMessages(prev => [...prev, newMessage]);
                    setTimeout(() => {
                        setOpsState('flash_deal_input');
                        const manualMsg = { ...newMessage, id: Date.now() + '2', text: "So, what's the deal? (e.g., '$5 Pints until 8pm')" };
                        setMessages(prev => [...prev, manualMsg]);
                        setCurrentBubbles([]);
                    }, 1500);
                }
                setIsLoading(false);
                break;

            case 'accept_ideation_proposal':
                const proposal = `$2 off ${draftData.pickedItem?.name} for the next hour`;
                addUserMessage('Sounds good');
                await processAction('SUBMIT_DEAL_TEXT', proposal);
                break;

            // --- SKILL: Social Post ---
            case 'skill_social_post':
                addUserMessage('Social Post');
                setOpsState('social_post_input');
                newMessage.text = "I'm ready to draft. What's the post about? (e.g. 'New IPA on tap', 'Live music at 8pm')";
                setMessages(prev => [...prev, newMessage]);
                setCurrentBubbles([]);
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
                newMessage.text = `I've drafted this for you:\n\n"${draft}"\n\nSave to your marketing dashboard?`;
                setMessages(prev => [...prev, newMessage]);
                setCurrentBubbles([
                    { id: 'confirm', label: '🚀 Save Draft', value: 'confirm_post' },
                    { id: 'gen_img', label: '🎨 Gen Image', value: 'skill_generate_image' },
                    { id: 'cancel', label: '❌ Cancel', value: 'cancel' }
                ]);
                break;

            // --- SKILL: Email Draft ---
            case 'skill_email_draft':
                addUserMessage('Draft Email');
                setOpsState('email_draft_input');
                newMessage.text = "Who are we emailing, and what's the occasion? (e.g. 'Newsletter to regulars about Saturday trivia')";
                setMessages(prev => [...prev, newMessage]);
                setCurrentBubbles([]);
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
                newMessage.text = `I've drafted this email:\n\n"${emailDraft}"\n\nSave to your marketing dashboard?`;
                setMessages(prev => [...prev, newMessage]);
                break;

            // --- SKILL: Calendar Post ---
            case 'skill_calendar_post':
                addUserMessage('Calendar Post');
                setOpsState('calendar_post_input');
                newMessage.text = "What event should I add to the community calendar? (e.g. 'St Paddy's Day Bash, March 17th, 6pm')";
                setMessages(prev => [...prev, newMessage]);
                setCurrentBubbles([]);
                break;

            case 'SUBMIT_CALENDAR_TEXT':
                if (!payload) return;
                addUserMessage(payload);
                setIsLoading(true);

                // Mock parsing for now
                setDraftData({
                    skill: 'add_to_calendar',
                    params: {
                        summary: payload,
                        venueId: venue?.id
                    }
                });

                setIsLoading(false);
                setOpsState('confirm_action');
                newMessage.text = `I've prepared this calendar entry:\n\n"${payload}"\n\nPush it to the OlyBars calendar?`;
                setMessages(prev => [...prev, newMessage]);
                break;

            // --- SKILL: Website Content ---
            case 'skill_website_content':
                addUserMessage('Web Content');
                setOpsState('website_content_input');
                newMessage.text = "What page or section are we updating? (e.g. 'About Us section on the homepage')";
                setMessages(prev => [...prev, newMessage]);
                setCurrentBubbles([]);
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
                newMessage.text = `Web content drafted:\n\n"${webDraft}"\n\nSave this for your web dev?`;
                setMessages(prev => [...prev, newMessage]);
                break;

            // --- SKILL: Generate Image ---
            case 'skill_generate_image':
                addUserMessage('Gen Image');
                setOpsState('image_gen_input');
                newMessage.text = "Describe the image you want me to create. (e.g. 'A cozy pub interior with a roaring fire and people laughing')";
                setMessages(prev => [...prev, newMessage]);
                setCurrentBubbles([]);
                break;

            case 'SUBMIT_IMAGE_GEN_TEXT':
                if (!payload) return;
                addUserMessage(payload);
                setIsLoading(true);

                // In a real flow, we'd call a backend function. For now, we simulate the "Generated" state.
                const imagePrompt = `High-quality, vibrant photo of ${payload} at ${venue?.name}, Olympia style.`;

                setDraftData({
                    skill: 'generate_image',
                    params: {
                        prompt: imagePrompt
                    }
                });

                setIsLoading(false);
                setOpsState('confirm_action');
                newMessage.text = `Artie is firing up the kiln... 🎨\n\nI've generated a prompt for our image engine: \n\n"${imagePrompt}"\n\nGenerate and save to gallery?`;
                setMessages(prev => [...prev, newMessage]);
                break;

            // --- BRANCH: MANUAL INPUT ---
            case 'method_manual_input':
                addUserMessage('I have a deal');
                setOpsState('flash_deal_input');
                newMessage.text = "Got it. What's the offer? (e.g., 'Half price nachos', '$4 Wells')";
                setMessages(prev => [...prev, newMessage]);
                setCurrentBubbles([]); // Wait for text input
                break;

            case 'SUBMIT_DEAL_TEXT':
                if (!payload) return;
                addUserMessage(payload);
                setIsLoading(true); // Simulate "Thinking"

                // EXECUTE LCB CHECK
                const compliance = validateLCBCompliance(payload);

                if (!compliance.valid) {
                    setIsLoading(false);
                    newMessage.text = `⚠️ Hold on. ${compliance.reason}`;
                    setMessages(prev => [...prev, newMessage]);
                    // Stay in input mode
                } else {
                    // Default to "Now" and "1 Hour" for simplicity in this MVP flow
                    // In full version, we'd ask for Time/Duration next.
                    const now = new Date();
                    const startTimeISO = now.toISOString();
                    const duration = 60;

                    // 4. Traffic Check
                    const trafficCheck = await validateSchedule(startTimeISO, duration);
                    if (!trafficCheck.valid) {
                        setIsLoading(false);
                        newMessage.text = `⚠️ I can't schedule that. ${trafficCheck.reason}`;
                        setMessages(prev => [...prev, newMessage]);
                        // Stay in input mode
                    } else {
                        setDraftData({
                            skill: 'schedule_flash_deal',
                            params: {
                                summary: payload,
                                details: "Limited time offer. See bartender for details.",
                                startTimeISO: startTimeISO,
                                duration: duration,
                                staffBriefingConfirmed: true, // Auto-assume for MVP flow speed, or ask in next step
                                price: "See details"
                            }
                        });

                        setIsLoading(false);
                        setOpsState('confirm_action');

                        newMessage.text = `Looks valid. I've drafted this:\n\n"${payload}"\n\nStarting: NOW\nDuration: 1 Hour\n\nPost to the Buzz Clock?`;
                        setMessages(prev => [...prev, newMessage]);
                        setCurrentBubbles([
                            { id: 'confirm', label: '🚀 Post It', value: 'confirm_post' },
                            { id: 'edit', label: '✏️ Edit', value: 'skill_flash_deal' }, // Loop back
                            { id: 'cancel', label: '❌ Cancel', value: 'cancel' }
                        ]);
                    }
                }
                break;

            // --- SKILL: ADD EVENT ---
            case 'skill_add_event':
                addUserMessage('Add Event');
                setOpsState('event_input');
                newMessage.text = "Paste the event details (Name, Date, Time) or a link to the Facebook event.";
                setMessages(prev => [...prev, newMessage]);
                setCurrentBubbles([]);
                break;

            // --- CONFIRMATION & EXECUTION ---
            case 'confirm_post':
                setOpsState('completed');
                // This is where the parent component picks up the 'pendingAction' via the draftData return
                // We simulate Artie confirming the "Intent" to the parent
                newMessage.text = "Processing...";
                setMessages(prev => [...prev, newMessage]);
                break;

            case 'cancel':
                setOpsState('selecting_skill');
                newMessage.text = "Cancelled. What else?";
                setMessages(prev => [...prev, newMessage]);
                setCurrentBubbles([
                    { id: '1', label: '⚡ Flash Bounty', value: 'skill_flash_deal', icon: '⚡' },
                    { id: '2', label: '📅 Add Event', value: 'skill_add_event', icon: '📅' },
                    { id: '3', label: '📱 Social Post', value: 'skill_social_post', icon: '📱' },
                    { id: '4', label: '✉️ Draft Email', value: 'skill_email_draft', icon: '✉️' },
                    { id: '5', label: '🗓️ Calendar Post', value: 'skill_calendar_post', icon: '🗓️' },
                    { id: '6', label: '🌐 Web Content', value: 'skill_website_content', icon: '🌐' },
                    { id: '7', label: '🎨 Gen Image', value: 'skill_generate_image', icon: '🎨' }
                ]);
                break;

            default:
                console.warn("Unknown Artie Action:", action);
        }
    }, [draftData, validateLCBCompliance, validateSchedule]);

    return {
        opsState,
        messages,
        currentBubbles,
        processAction,
        draftData,
        isLoading
    };
};
