import React from 'react';
import { Clock } from 'lucide-react';
import { BuzzDeal } from '../../types';

export const MOCK_BUZZ_DATA: BuzzDeal[] = [
    {
        id: '1',
        venueName: "HANNAH'S BAR & GRILLE",
        isHQ: true,
        timeLeft: "0h 45m LEFT",
        dealText: "$4 RAINIER PINTS & 1/2 PRICE NACHOS",
        urgencyColor: 'red'
    },
    {
        id: '2',
        venueName: "LEGENDS ARCADE",
        isHQ: false,
        timeLeft: "1h 0m LEFT",
        dealText: "FREE TOKENS W/ PITCHER",
        urgencyColor: 'green'
    }
];

export const BuzzClock: React.FC = () => {
    return (
        <div className="bg-black border-b-2 border-primary/20 p-4 space-y-4">
            {/* Header Row */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
                        <Clock className="w-6 h-6 text-primary" strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-white leading-none uppercase tracking-tight font-league">
                            THE BUZZ CLOCK
                        </h2>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            LIVE COUNTDOWN · FOCUSED DEALS
                        </span>
                    </div>
                </div>

                <div className="bg-primary px-3 py-1 rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black -rotate-1">
                    <span className="text-[11px] font-black text-black uppercase tracking-widest italic">
                        LIVE
                    </span>
                </div>
            </div>

            {/* Deals List */}
            <div className="flex flex-col gap-3">
                {MOCK_BUZZ_DATA.map((deal) => (
                    <div
                        key={deal.id}
                        className="bg-surface border-2 border-slate-800 p-3 rounded-md flex flex-col gap-1 transition-all active:scale-[0.98] hover:border-primary/40 group relative overflow-hidden"
                    >
                        {/* Subtle glow for HQ */}
                        {deal.isHQ && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-2xl rounded-full -mr-8 -mt-8" />
                        )}

                        <div className="flex justify-between items-start z-10">
                            <div className="flex items-center gap-2">
                                <h3 className="text-[15px] font-black text-white uppercase tracking-tight font-league group-hover:text-primary transition-colors">
                                    {deal.venueName}
                                </h3>
                                {deal.isHQ && (
                                    <span className="bg-white text-black text-[9px] font-black px-1.5 py-0.5 rounded-sm flex items-center justify-center">
                                        HQ
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end">
                                    <span className={`text-lg font-black font-mono leading-none ${deal.urgencyColor === 'red' ? 'text-oly-red' : 'text-green-500'
                                        }`}>
                                        {deal.timeLeft.split(' ')[0]}
                                    </span>
                                    <span className={`text-lg font-black font-mono leading-none ${deal.urgencyColor === 'red' ? 'text-oly-red' : 'text-green-500'
                                        }`}>
                                        {deal.timeLeft.split(' ')[1]}
                                    </span>
                                </div>
                                <span className="block text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mt-0.5">
                                    LEFT
                                </span>
                            </div>
                        </div>

                        <p className="text-[12px] font-bold text-slate-300 uppercase tracking-wide leading-tight mt-1 border-t border-white/5 pt-2">
                            {deal.dealText}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
