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
        const mockVenue = { partnerConfig: { tier: 'FREE', flashDealsUsed: 0 } } as any;
        const check = await VenueOpsService.validateSlot(mockVenue, new Date(timeISO).getTime(), duration);
        return check;
    }, []);


    // 5. The Skill State Machine
    const processAction = useCallback(async (action: string, payload?: string) => {
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
                    { id: '1', label: '⚡ Flash Deal', value: 'skill_flash_deal', icon: '⚡' },
                    { id: '2', label: '📅 Add Event', value: 'skill_add_event', icon: '📅' },
                    // { id: '3', label: '🎱 Update Play', value: 'skill_update_play', icon: '🎱' } // Hidden for now per user focus
                ]);
                break;

            // --- SKILL: FLASH DEAL INTRO ---
            case 'skill_flash_deal':
                addUserMessage('Flash Deal');
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
                newMessage.text = "I'm still learning your menu! Once I have your food and drink list, I'll be able to suggest high-margin specials. \n\nFor now, please enter the deal manually.";
                setMessages(prev => [...prev, newMessage]);
                // Fallback to manual input
                setTimeout(() => {
                    setOpsState('flash_deal_input');
                    const manualMsg = { ...newMessage, id: Date.now() + '2', text: "So, what's the deal? (e.g., '$5 Pints until 8pm')" };
                    setMessages(prev => [...prev, manualMsg]);
                    setCurrentBubbles([]);
                }, 1500);
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

                    // 4. Traffic Check (Simulated)
                    // In real flow this would wait for await validateSchedule(startTimeISO, duration);
                    // For now assume OPEN

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
                    { id: '1', label: '⚡ Flash Deal', value: 'skill_flash_deal', icon: '⚡' },
                    { id: '2', label: '📅 Add Event', value: 'skill_add_event', icon: '📅' },
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
