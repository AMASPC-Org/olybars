// TODO: Phase 4 - Refactor into specific subtypes: FoodBounty, DrinkBounty, TimeBounty.
import { QuickReplyOption } from '../../components/artie/QuickReplyChips';

export const handleFlashBountyInit = (
    addUserMessage: (text: string) => void,
    setOpsState: (state: any) => void,
    addSchmidtResponse: (text: string, options?: QuickReplyOption[]) => void
) => {
    addUserMessage('Flash Bounty');
    setOpsState('flash_deal_init_method');
    addSchmidtResponse("Target acquired. What kind of Flash Bounty are we deploying?", [
        { id: 'food', label: 'Food Special', value: 'bounty_food', icon: '🍔' },
        { id: 'drink', label: 'Drink Special', value: 'bounty_drink', icon: '🍸' },
        { id: 'time', label: 'Time Event', value: 'bounty_time', icon: '⏰' }
    ]);
};

export const handleTypeSelection = (
    action: string,
    addUserMessage: (text: string) => void,
    setDraftData: (data: (prev: any) => any) => void,
    setOpsState: (state: any) => void,
    addSchmidtResponse: (text: string, options?: QuickReplyOption[]) => void
) => {
    const labels: Record<string, string> = {
        bounty_food: 'Food Special',
        bounty_drink: 'Drink Special',
        bounty_time: 'Time Event'
    };

    addUserMessage(labels[action] || 'Specialty Bounty');
    setDraftData(prev => ({ ...prev, bountyType: action }));
    setOpsState('flash_deal_input');

    if (action === 'bounty_food') {
        addSchmidtResponse("Which menu item is the star?");
    } else if (action === 'bounty_drink') {
        addSchmidtResponse("What are we pouring?");
    } else if (action === 'bounty_time') {
        addSchmidtResponse("What's the occasion? (e.g. Happy Hour, late night)");
    }
};

export const handleMethodIdeation = (
    addUserMessage: (text: string) => void,
    setIsLoading: (loading: boolean) => void,
    venue: any,
    addSchmidtResponse: (text: string, options?: QuickReplyOption[]) => void,
    setOpsState: (state: any) => void,
    setDraftData: (data: any) => void
) => {
    addUserMessage('Help me decide');
    setIsLoading(true);

    // Analyze high margin items
    const highMarginItems = venue?.fullMenu?.filter((item: any) => item.margin_tier === 'High') || [];

    if (highMarginItems.length > 0) {
        const pickedItem = highMarginItems[Math.floor(Math.random() * highMarginItems.length)];
        addSchmidtResponse(`I took a look at your menu. Your **${pickedItem.name}** has a great margin. \n\nHow about a Flash Bounty like: "$2 off ${pickedItem.name} for the next hour"?`, [
            { id: 'accept_idea', label: 'Sounds good', value: 'accept_ideation_proposal', icon: '✅' },
            { id: 'manual', label: 'I have a different idea', value: 'method_manual_input', icon: '📝' }
        ]);
        setDraftData({ pickedItem });
    } else {
        addSchmidtResponse("I'm still learning your menu! Once I have your food and drink list, I'll be able to suggest high-margin bounties. \n\nFor now, please enter the bounty manually.");
        setTimeout(() => {
            setOpsState('flash_deal_input');
            addSchmidtResponse("So, what's the bounty? (e.g., '$5 Pints until 8pm')");
        }, 1500);
    }
    setIsLoading(false);
};

export const handleAcceptIdeationProposal = async (
    addUserMessage: (text: string) => void,
    draftData: any,
    processAction: (action: string, payload?: string) => Promise<void>
) => {
    const proposal = `$2 off ${draftData.pickedItem?.name} for the next hour`;
    addUserMessage('Sounds good');
    await processAction('SUBMIT_DEAL_TEXT', proposal);
};

export const handleMethodManualInput = (
    addUserMessage: (text: string) => void,
    setOpsState: (state: any) => void,
    addSchmidtResponse: (text: string, options?: QuickReplyOption[]) => void
) => {
    addUserMessage('I have a bounty');
    setOpsState('flash_deal_input');
    addSchmidtResponse("Got it. What's the offer? (e.g., 'Half price nachos', '$4 Wells')");
};

export const handleSubmitBountyText = async (
    payload: string | undefined,
    addUserMessage: (text: string) => void,
    setIsLoading: (loading: boolean) => void,
    validateLCBCompliance: (text: string) => { valid: boolean; reason?: string },
    validateSchedule: (timeISO: string, duration: number) => Promise<{ valid: boolean; reason?: string }>,
    draftData: any,
    setDraftData: (data: any) => void,
    setOpsState: (state: any) => void,
    addSchmidtResponse: (text: string, options?: QuickReplyOption[]) => void
) => {
    if (!payload) return;
    addUserMessage(payload);
    setIsLoading(true);

    const compliance = validateLCBCompliance(payload);

    if (!compliance.valid) {
        setIsLoading(false);
        addSchmidtResponse(`⚠️ Hold on. ${compliance.reason}`);
    } else {
        const now = new Date();
        const startTimeISO = now.toISOString();
        const duration = 60;

        const trafficCheck = await validateSchedule(startTimeISO, duration);
        if (!trafficCheck.valid) {
            setIsLoading(false);
            addSchmidtResponse(`⚠️ I can't schedule that. ${trafficCheck.reason}`);
        } else {
            setDraftData({
                ...draftData,
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

            const typeLabel = draftData.bountyType === 'bounty_food' ? 'Food' : draftData.bountyType === 'bounty_drink' ? 'Drink' : 'Time';

            setIsLoading(false);
            setOpsState('confirm_action');
            addSchmidtResponse(`Looks valid. I've drafted this **${typeLabel} Bounty**:\n\n"${payload}"\n\nStarting: NOW\nDuration: 1 Hour\n\nPost to the Buzz Clock?`, [
                { id: 'confirm', label: 'Post It', value: 'confirm_post', icon: '🚀' },
                { id: 'edit', label: 'Edit', value: 'skill_flash_deal', icon: '✏️' },
                { id: 'cancel', label: 'Cancel', value: 'cancel', icon: '❌' }
            ]);
        }
    }
};
