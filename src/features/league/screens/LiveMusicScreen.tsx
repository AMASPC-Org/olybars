import React from 'react';
import { Music, Ticket, Bell, Play } from 'lucide-react';

export const LiveMusicScreen: React.FC = () => {
    return (
        <div className="bg-background text-white min-h-screen p-4 font-body">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-black text-primary tracking-wider font-league uppercase">LIVE STAGE</h1>
                <p className="text-sm font-bold text-slate-300 uppercase italic">Support Oly Local Music</p>
            </div>

            {/* Featured Headliner */}
            <div className="bg-surface rounded-lg border border-slate-700 shadow-[4px_4px_0px_0px_#000] p-5 mb-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-black px-3 py-1 uppercase tracking-widest font-league">
                    HEADLINER
                </div>

                <div className="flex items-center justify-between mb-4 mt-2">
                    <div>
                        <h2 className="text-2xl font-black text-white font-league uppercase leading-none">THE OLYMPIANS</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-1">WELL 80 STAGE @ 8:00 PM</p>
                    </div>
                </div>

                <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                    Local psych-rock legends returning for a one-night-only artesian well benefit show. Limited capacity!
                </p>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button className="bg-primary hover:bg-yellow-400 text-black font-black py-4 rounded-md transition-all flex items-center justify-center gap-2 font-league uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                        <Ticket size={18} strokeWidth={3} /> BUY TICKETS
                    </button>
                    <button className="bg-slate-700 hover:bg-slate-600 text-white font-black py-4 rounded-md transition-all flex items-center justify-center gap-2 font-league uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                        <Bell size={18} strokeWidth={3} /> NOTIFY ME
                    </button>
                </div>

                <div className="bg-background/40 p-3 border border-white/5 rounded-md flex items-center gap-3">
                    <Play size={18} className="text-primary fill-primary" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider underline cursor-pointer">Listen to Latest Single</span>
                </div>
            </div>

            {/* Upcoming Shows */}
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 font-league">UPCOMING SHOWS</h3>
            <div className="space-y-3">
                {[
                    { band: "SALTWATER TATTOO", venue: "THE BROHO", date: "SAT 12/28", price: "$10" },
                    { band: "DOWNTOWN DIRT", venue: "HANNAH'S", date: "SUN 12/29", price: "FREE" }
                ].map((show, i) => (
                    <div key={i} className="bg-surface/50 border border-white/5 p-4 flex justify-between items-center rounded-lg group hover:border-primary transition-colors cursor-pointer">
                        <div>
                            <span className="block text-white font-black text-sm font-league uppercase group-hover:text-primary transition-colors">{show.band}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{show.venue} • {show.date}</span>
                        </div>
                        <span className="bg-slate-900 border border-white/10 px-3 py-1 rounded text-[10px] font-black font-league text-slate-300 uppercase">{show.price}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
