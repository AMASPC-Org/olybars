
export const generateShareCard = async (
    badgeName: string,
    venueName: string,
    photoUrl?: string // Optional user photo, if not provided we use a gradient/stock
): Promise<File | null> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Instagram Story standard size
    canvas.width = 1080;
    canvas.height = 1920;

    // Background
    ctx.fillStyle = '#0f172a'; // Oly Navy
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Photo if available
    if (photoUrl) {
        // In a real app we'd load the image. For now, we simulate a placeholder or need complex async loading
        // For MVP speed, we'll draw a nice gradient placeholder or just text
        // TODO: Implement actual image loading
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1e293b');
        gradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
    }

    // Overlay "Artesian Frame" (Circular Water-Droplet simulation)
    ctx.strokeStyle = '#fbbf24'; // Oly Gold
    ctx.lineWidth = 15;

    // Circular watermark in corner
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(canvas.width - 150, 150, 80, 0, Math.PI * 2);
    ctx.stroke();
    // Inner droplet effect
    ctx.beginPath();
    ctx.arc(canvas.width - 150, 150, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.restore();

    // Main central ring
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 3, 300, 0, Math.PI * 2);
    ctx.stroke();

    // Text Overlay
    ctx.textAlign = 'center';

    // Badge Name
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 80px "Oswald", sans-serif';
    ctx.fillText(badgeName.toUpperCase(), canvas.width / 2, canvas.height * 0.65);

    // "UNLOCKED AT"
    ctx.fillStyle = '#94a3b8'; // Slate 400
    ctx.font = '40px "Roboto Condensed", sans-serif';
    ctx.fillText('UNLOCKED AT', canvas.width / 2, canvas.height * 0.72);

    // Venue Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px "Oswald", sans-serif';
    ctx.fillText(venueName.toUpperCase(), canvas.width / 2, canvas.height * 0.77);

    // "Maker Tag" footer (Bottom overlay)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; // Darker bg
    ctx.fillRect(0, canvas.height - 150, canvas.width, 150);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Roboto Condensed", sans-serif';
    ctx.fillText(`SOURCED LOCALLY AT ${venueName.toUpperCase()}`, canvas.width / 2, canvas.height - 85);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '24px "Oswald", sans-serif';
    ctx.fillText('WWW.OLYBARS.COM', canvas.width / 2, canvas.height - 40);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'share_card.png', { type: 'image/png' });
                resolve(file);
            } else {
                resolve(null);
            }
        });
    });
};

export const shareAchievement = async (
    badgeName: string,
    venueName: string,
    copy: string,
    onComplete?: () => void
) => {
    if (!navigator.share) {
        // Fallback for desktop mock
        console.log("Mock Share Completion: +5 Points Awarded");
        if (onComplete) onComplete();
        return;
    }

    const file = await generateShareCard(badgeName, venueName);
    if (!file) return;

    try {
        await navigator.share({
            title: `Unlocked: ${badgeName}`,
            text: copy,
            files: [file]
        });

        // Award points on successful share
        if (onComplete) onComplete();
        console.log("Share Bounty Awarded: +5 Points");
    } catch (error) {
        console.error('Error sharing:', error);
    }
};
