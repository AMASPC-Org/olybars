export interface VibeReceiptData {
    type: 'trivia' | 'play' | 'vibe';
    venueName: string;
    pointsEarned: number;
    vibeStatus: string;
    artieHook: string;
    username: string;
    userId: string;
    venueId?: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export const generateArtieHook = (type: VibeReceiptData['type'], vibeStatus: string): string => {
    const hooks: Record<string, string[]> = {
        trivia: [
            "The well of knowledge runs deep tonight.",
            "Knowledge is the only draft that doesn't run dry.",
            "Brainpower fueled by the 98501."
        ],
        play: [
            "The felt is fast and the spirits are high.",
            "A clean break and a cold one. Perfection.",
            "Dominating the local arena, one game at a time."
        ],
        vibe: [
            "Caught the rhythm of the downtown pulse.",
            "Bottle the lightning, drink the vibe.",
            "Downtown Olympia: Where every seat has a story."
        ]
    };

    const options = hooks[type] || hooks['vibe'];
    return options[Math.floor(Math.random() * options.length)];
};

export const shareVibeReceipt = async (data: VibeReceiptData, logUserActivity?: any) => {
    // In a real mobile app, this would use the Web Share API with a generated blob/file
    const shareText = `Tapped into the 98501 via OlyBars.com! Just earned ${data.pointsEarned} points at ${data.venueName}. #OlyBars #SpiritOfTheWell`;

    let shared = false;
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'OlyBars Vibe Receipt',
                text: shareText,
                url: 'https://olybars.com',
            });
            shared = true;
        } catch (err) {
            console.error('Error sharing:', err);
        }
    } else {
        // Fallback: Copy to clipboard
        try {
            await navigator.clipboard.writeText(shareText);
            shared = true;
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    if (shared && logUserActivity && data.userId) {
        // Award Social Bounty (+5 Points)
        await logUserActivity(data.userId, {
            type: 'social_share',
            venueId: data.venueId,
            points: 5,
            metadata: {
                receiptType: data.type,
                bounty: 'Social Bounty v1'
            }
        });
    }

    return shared ? (navigator.share ? 'Shared!' : 'Link copied to clipboard!') : null;
};
