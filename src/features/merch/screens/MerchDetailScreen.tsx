import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Package, QrCode, CheckCircle2 } from 'lucide-react';
import { MERCH_ITEMS } from '../../../config/merch';
import { UserProfile, UserVoucher, Venue } from '../../../types';
import { useToast } from '../../../components/ui/BrandedToast';

interface MerchDetailScreenProps {
    venues: Venue[];
    userProfile: UserProfile;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const MerchDetailScreen: React.FC<MerchDetailScreenProps> = ({ venues, userProfile, setUserProfile }) => {
    const { itemId } = useParams<{ itemId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const item = MERCH_ITEMS.find(i => i.id === itemId);
    const [selectedSize, setSelectedSize] = useState<string>(item?.sizes?.[0] || '');
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!item) return <div className="p-10 text-center">Item not found</div>;

    const venue = venues.find(v => v.id === item.venueId);

    const handlePurchase = async () => {
        setIsPurchasing(true);

        // Safety Rail: Daily Drink Bounty Limit (1 per 24h)
        if (item.category === 'Drink Bounty') {
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;
            const lastRedemption = userProfile.lastDrinkBountyRedemption || 0;
            const timeSince = Date.now() - lastRedemption;

            if (timeSince < ONE_DAY_MS) {
                showToast("Limit Reached: One Drink Bounty per 24 hours.", "error");
                setIsPurchasing(false);
                return;
            }
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newVoucher: UserVoucher = {
            id: `vouch_${Math.random().toString(36).substring(2, 11)}`,
            userId: userProfile.uid,
            itemId: item.id,
            venueId: item.venueId,
            status: 'active',
            purchaseDate: Date.now(),
            qrToken: `TOKEN_${Math.random().toString(36).toUpperCase().substring(2, 11)}`
        };

        const updatedProfile = {
            ...userProfile,
            vouchers: [...(userProfile.vouchers || []), newVoucher],
            lastDrinkBountyRedemption: item.category === 'Drink Bounty' ? Date.now() : userProfile.lastDrinkBountyRedemption
        };

        setUserProfile(updatedProfile);
        localStorage.setItem('oly_profile', JSON.stringify(updatedProfile));

        setIsPurchasing(false);
        setShowSuccess(true);
        showToast('Order Confirmed! Your voucher is ready.', 'success');
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-background text-white p-6 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(251,191,36,0.3)]">
                    <CheckCircle2 className="w-12 h-12 text-black" strokeWidth={3} />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tight font-league mb-4">ORDER SECURED</h1>
                <p className="text-slate-400 font-body mb-10 max-w-[280px]">
                    Head over to <span className="text-white font-bold">{venue?.name}</span> whenever you're ready. Shows the bartender your voucher to claim your gear.
                </p>

                <div className="w-full space-y-4">
                    <button
                        onClick={() => navigate('/vouchers')}
                        className="w-full py-5 bg-primary text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                    >
                        <QrCode className="w-5 h-5" />
                        View Digital Voucher
                    </button>
                    <button
                        onClick={() => navigate('/merch')}
                        className="w-full py-5 bg-white/5 text-slate-400 font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
                    >
                        Back to Stand
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white pb-32">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-white/10 p-6 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-primary" />
                </button>
                <span className="text-lg font-black uppercase tracking-tight font-league">ITEM DETAILS</span>
            </header>

            {/* Hero Image */}
            <div className="aspect-square relative">
                <img src={item.imageURL} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="px-6 -mt-10 relative z-10">
                <div className="flex items-baseline justify-between mb-4">
                    <div>
                        <span className="text-primary text-[10px] font-black uppercase tracking-widest block mb-1">
                            {venue?.name} OFFICIAL
                        </span>
                        <h1 className="text-3xl font-black uppercase tracking-tight font-league">{item.name}</h1>
                    </div>
                    <span className="text-2xl font-black font-mono text-white">${item.price}</span>
                </div>

                <p className="text-slate-400 leading-relaxed font-body text-sm mb-8">
                    {item.description}
                </p>

                {/* Size Selection */}
                {item.sizes && item.sizes.length > 0 && (
                    <div className="mb-10">
                        <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Select Size</h3>
                        <div className="flex flex-wrap gap-2">
                            {item.sizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 font-black transition-all ${selectedSize === size
                                        ? 'bg-primary border-primary text-black'
                                        : 'border-white/10 bg-white/5 text-slate-400'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Logistics Info */}
                <div className="bg-surface border border-white/5 p-6 rounded-3xl space-y-4 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-tight">In-Bar Pickup</p>
                            <p className="text-[10px] text-slate-500 font-medium">Claim at {venue?.name} anytime during business hours.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <Info className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-tight">Zero Waste Policy</p>
                            <p className="text-[10px] text-slate-500 font-medium">No plastic mailers or shipping trucks. 100% local fulfillment.</p>
                        </div>
                    </div>
                </div>

                {/* Buy Button */}
                <button
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest text-lg shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isPurchasing ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-primary text-black'
                        }`}
                >
                    {isPurchasing ? (
                        'Processing Secure Order...'
                    ) : (
                        <>
                            Confirm & Get Voucher <ArrowRight className="w-6 h-6" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const ArrowRight = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

export default MerchDetailScreen;
