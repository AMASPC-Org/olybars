import React from 'react';
import {
    Trophy,
    Share2,
    X,
    Flame,
    Crown,
    Zap,
    MapPin,
    Activity
} from 'lucide-react';
import { VibeReceiptData, shareVibeReceipt } from '../services/VibeReceiptService';
import { logUserActivity } from '../../../services/userService';

interface VibeReceiptModalProps {
    data: VibeReceiptData;
    onClose: () => void;
}

export const VibeReceiptModal: React.FC<VibeReceiptModalProps> = ({ data, onClose }) => {
    const isTrivia = data.type === 'trivia';

    const handleShare = async () => {
        await shareVibeReceipt(data, logUserActivity);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="relative w-full max-w-[360px] animate-in zoom-in-95 duration-300">

                {/* Receipt Header / "Tear Off" line */}
                <div className="absolute -top-12 left-0 right-0 flex justify-between items-center px-2 text-primary/40">
                    <span className="text-[10px] font-black tracking-[0.3em]">OLYBARS.COM // VIBE RECEIPT</span>
                    <button onClick={onClose} className="p-2 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Receipt Body */}
                <div className="bg-slate-950 border-2 border-primary/20 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.1)]">

                    {/* Header Section */}
                    <div className="bg-gradient-to-b from-primary to-yellow-600 p-8 text-black text-center relative">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                            <div className="text-4xl font-black rotate-12 translate-x-10">98501 98501 98501</div>
                        </div>

                        <div className="bg-black text-primary p-3 rounded-full w-fit mx-auto mb-4 border-2 border-white shadow-xl">
                            {isTrivia ? <Crown className="w-8 h-8" /> : <Activity className="w-8 h-8" />}
                        </div>

                        <h3 className="text-[14px] font-black tracking-widest uppercase mb-1 drop-shadow-sm font-league">
                            {isTrivia ? '98501 LEAGUE: TRIVIA CHAMPIONS' : '98501 PLAY CHECK-IN'}
                        </h3>
                        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2 font-league">
                            {data.venueName}
                        </h2>
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest transform -skew-x-12">
                                VIBE: {data.vibeStatus.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center group hover:border-primary/50 transition-all">
                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-1">XP Earned</span>
                                <span className="text-3xl font-black text-primary font-league leading-none">+{data.pointsEarned}</span>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center group hover:border-primary/50 transition-all">
                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                                    {isTrivia ? 'Streak' : 'Table Status'}
                                </span>
                                <span className="text-xl font-black text-white font-league leading-none">
                                    {isTrivia ? '3-WEEK' : 'KING'}
                                </span>
                            </div>
                        </div>

                        {/* Artie's Hook */}
                        <div className="relative pt-6 border-t border-white/10">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-950 px-4">
                                <div className="bg-primary/20 p-1.5 rounded-full">
                                    <Flame className="w-3 h-3 text-primary" />
                                </div>
                            </div>
                            <p className="text-center text-sm italic text-slate-400 font-medium leading-relaxed px-2">
                                "{data.artieHook}"
                            </p>
                            <p className="text-center text-[8px] text-slate-600 font-black uppercase tracking-[0.4em] mt-4">
                                — Certifed by Artie Wells
                            </p>
                        </div>
                    </div>

                    {/* Share Footer */}
                    <div className="p-6 bg-primary/5 border-t border-white/5">
                        <button
                            onClick={handleShare}
                            className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                        >
                            <Share2 className="w-5 h-5" />
                            SHARE VIBE RECEIPT
                        </button>
                        <p className="text-center text-[9px] text-slate-500 font-bold uppercase mt-4 tracking-tight">
                            Tapped into the 98501 via OlyBars.com
                        </p>
                    </div>
                </div>

                {/* Bottom Logo Detail */}
                <div className="mt-8 text-center opacity-30">
                    <div className="text-2xl font-black tracking-tighter text-white">
                        OLYBARS<span className="text-primary">.COM</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
