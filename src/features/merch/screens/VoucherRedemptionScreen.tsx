import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, HelpCircle, ArrowLeft } from 'lucide-react';
import { UserProfile, UserVoucher, Venue } from '../../../types';
import { MERCH_ITEMS } from '../../../config/merch';

interface VoucherRedemptionScreenProps {
    userProfile: UserProfile;
    venues: Venue[];
}

const VoucherRedemptionScreen: React.FC<VoucherRedemptionScreenProps> = ({ userProfile, venues }) => {
    const navigate = useNavigate();
    const vouchers = userProfile.vouchers || [];

    if (vouchers.length === 0) {
        return (
            <div className="min-h-screen bg-background text-white p-6 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <HelpCircle className="w-10 h-10 text-slate-500" />
                </div>
                <h1 className="text-2xl font-black uppercase font-league mb-2">NO ACTIVE VOUCHERS</h1>
                <p className="text-slate-500 text-sm mb-10 max-w-[240px]">
                    Buy some official gear at the Merch Stand to get your digital pickup voucher.
                </p>
                <button
                    onClick={() => navigate('/merch')}
                    className="px-8 py-4 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl"
                >
                    Browse The Stand
                </button>
            </div>
        );
    }

    // Show most recent active voucher first
    const activeVoucher = vouchers[vouchers.length - 1];
    const item = MERCH_ITEMS.find(i => i.id === activeVoucher.itemId);
    const venue = venues.find(v => v.id === activeVoucher.venueId);

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-32">
            {/* Header */}
            <header className="p-6 flex items-center gap-4 bg-background">
                <button onClick={() => navigate('/profile')} className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-primary" />
                </button>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight font-league">
                        MERCH STAND <span className="text-primary">REDEMPTION</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Pickup Voucher</p>
                </div>
            </header>

            <div className="p-6">
                {/* The Voucher "Physical" Style Card */}
                <div className="bg-white text-black rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col">
                    {/* Top Section: Branding & Item */}
                    <div className="p-8 border-b-2 border-dashed border-slate-200 relative">
                        {/* Notch circles for ticket effect */}
                        <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-slate-900 rounded-full" />
                        <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-slate-900 rounded-full" />

                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-black text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                Official OlyBars Gear
                            </div>
                            <span className="text-[10px] text-slate-400 font-black uppercase font-mono">
                                #{activeVoucher.id.split('_')[1].toUpperCase()}
                            </span>
                        </div>

                        <h2 className="text-4xl font-black uppercase tracking-tighter font-league text-slate-900 mb-2">
                            {item?.name}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-tight">Pick-up Location:</span>
                            <span className="text-sm font-black text-black uppercase underline decoration-primary decoration-4 underline-offset-2">
                                {venue?.name}
                            </span>
                        </div>
                    </div>

                    {/* QR CODE SECTION */}
                    <div className="p-10 flex flex-col items-center bg-slate-50/50">
                        <div className="bg-white p-6 rounded-3xl shadow-inner border-2 border-slate-100 mb-6">
                            <div className="w-48 h-48 bg-slate-100 flex items-center justify-center relative">
                                {/* Simplified QR Placeholder */}
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${activeVoucher.qrToken}&color=0f172a`}
                                    alt="Voucher QR Code"
                                    className="w-full h-full"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center">
                            Show this to the bartender for scanning
                        </p>
                    </div>

                    {/* Footer Section: User Details */}
                    <div className="p-8 bg-slate-900 text-white">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Purchased By</p>
                                <p className="text-sm font-black uppercase font-league tracking-wide">
                                    {userProfile.handle || "League Member"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Valid Until</p>
                                <p className="text-sm font-black uppercase font-league tracking-wide text-primary">
                                    Forever
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-10 space-y-4 px-2">
                    <div className="flex gap-4">
                        <div className="text-primary font-black text-2xl font-league">01.</div>
                        <p className="text-xs text-slate-400 leading-relaxed font-body">
                            Visit <span className="text-white font-bold">{venue?.name}</span> during their normal league hours.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-primary font-black text-2xl font-league">02.</div>
                        <p className="text-xs text-slate-400 leading-relaxed font-body">
                            Ask the bartender for your pre-ordered gear and show them this screen.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-primary font-black text-2xl font-league">03.</div>
                        <p className="text-xs text-slate-400 leading-relaxed font-body">
                            The bartender will verify the code and hand you your official league swag. <span className="text-white font-bold">Enjoy!</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoucherRedemptionScreen;
