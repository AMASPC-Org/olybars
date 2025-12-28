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

export const generateArtieHook = (type: VibeReceiptData['type'], vibeStatus: string, metadata?: Record<string, any>): string => {
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
        vibe: metadata?.gameBonus ? [
            "Checked the games, validated the pulse. Ultimate scout.",
            "The felt looks fast tonight. Good intel.",
            "Intel gathered. The League thanks you for the field report."
        ] : [
            "Caught the rhythm of the downtown pulse.",
            "Bottle the lightning, drink the vibe.",
            "Downtown Olympia: Where every seat has a story."
        ]
    };

    const options = hooks[type] || hooks['vibe'];
    return options[Math.floor(Math.random() * options.length)];
};

export const getFacebookShareUrl = (url: string, quote: string) => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`;
};

export const getTwitterShareUrl = (url: string, text: string) => {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
};

export const shareVibeReceipt = async (data: VibeReceiptData, logUserActivity?: any, platform?: 'facebook' | 'twitter' | 'copy') => {
    const shareUrl = window.location.origin; // Dynamically use current origin
    const shareText = `Tapped into the 98501 via OlyBars.com! Just earned ${data.pointsEarned} points at ${data.venueName}. #OlyBars #SpiritOfTheWell`;

    let shared = false;

    if (platform === 'facebook') {
        window.open(getFacebookShareUrl(shareUrl, shareText), '_blank', 'width=600,height=400');
        shared = true;
    } else if (platform === 'twitter') {
        window.open(getTwitterShareUrl(shareUrl, shareText), '_blank', 'width=600,height=400');
        shared = true;
    } else if (platform === 'copy') {
        try {
            await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            shared = true;
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    } else if (navigator.share) {
        // Generic Mobile Share
        try {
            await navigator.share({
                title: 'OlyBars Vibe Receipt',
                text: shareText,
                url: shareUrl,
            });
            shared = true;
        } catch (err) {
            console.error('Error sharing:', err);
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
                platform: platform || 'generic',
                bounty: 'Social Bounty v1'
            }
        });
    }

    return shared;
};
