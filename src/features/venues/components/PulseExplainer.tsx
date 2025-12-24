import React from 'react';
import { Flame, Users, Zap, Clock, Star, Info } from 'lucide-react';
import { PULSE_CONFIG } from '../../../config/pulse';

export const PulseExplainer: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section explains the overall goal */}
            <header className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                    <Zap className="w-5 h-5 fill-current" />
                    <h2 className="text-xl font-black uppercase tracking-tight font-league">How the Pulse Works</h2>
                </div>
                <p className="text-sm text-slate-400 font-medium">
                    The Oly Pulse isn't just a count—it's a real-time "Vibe Engine" that balances recent activity with long-term flow.
                </p>
            </header>

            {/* Metric 1: Buzz Score */}
            <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Flame className="w-24 h-24" />
                </div>

                <div className="flex items-start gap-4 mb-4">
                    <div className="bg-orange-500/20 p-3 rounded-xl">
                        <Flame className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight font-league text-white">1. The Buzz Score (Heat)</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Updated every {PULSE_CONFIG.WINDOWS.STALE_THRESHOLD / 60000} mins</p>
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Every interaction releases "Heat" at a venue. We sum these up and apply a decay so the status reflects right <span className="text-white font-bold italic">now</span>, not two hours ago.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pb-2">
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                            <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Check-In</span>
                            <span className="text-xl font-black text-white font-league">+{PULSE_CONFIG.POINTS.CHECK_IN} Pts</span>
                        </div>
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                            <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Vibe Report</span>
                            <span className="text-xl font-black text-white font-league">+{PULSE_CONFIG.POINTS.VIBE_REPORT} Pts</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-900/20 rounded-xl border border-blue-500/20">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <p className="text-[11px] font-bold text-blue-200">
                            THE FADE: Scores drop by 50% every {PULSE_CONFIG.WINDOWS.DECAY_HALFLIFE / 3600000} hour.
                        </p>
                    </div>
                </div>
            </section>

            {/* Metric 2: Live Headcount */}
            <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Users className="w-24 h-24" />
                </div>

                <div className="flex items-start gap-4 mb-4">
                    <div className="bg-blue-500/20 p-3 rounded-xl">
                        <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight font-league text-white">2. Live Headcount</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{PULSE_CONFIG.WINDOWS.LIVE_HEADCOUNT / 60000} Min Window</p>
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        This is a literal count of unique League Members physically at the venue.
                    </p>
                    <div className="p-4 bg-slate-950 rounded-xl border border-white/5 italic text-[11px] text-slate-400">
                        "{PULSE_CONFIG.DESCRIPTIONS.LIVE_MEANING}"
                    </div>
                </div>
            </section>

            {/* Status Thresholds */}
            <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-600 pl-1">Thresholds</h3>
                <div className="space-y-3">
                    {[
                        { label: 'Buzzing', icon: Flame, color: 'text-orange-500', score: `> ${PULSE_CONFIG.THRESHOLDS.BUZZING}`, meaning: PULSE_CONFIG.DESCRIPTIONS.BUZZING_MEANING },
                        { label: 'Lively', icon: Users, color: 'text-yellow-500', score: `> ${PULSE_CONFIG.THRESHOLDS.LIVELY}`, meaning: PULSE_CONFIG.DESCRIPTIONS.LIVELY_MEANING },
                        { label: 'Chill', icon: Star, color: 'text-blue-500', score: `Chill Zone`, meaning: PULSE_CONFIG.DESCRIPTIONS.CHILL_MEANING },
                    ].map((status) => (
                        <div key={status.label} className="flex items-center justify-between p-4 bg-surface border border-white/10 rounded-2xl group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-3">
                                <status.icon className={`w-5 h-5 ${status.color}`} />
                                <div>
                                    <span className="text-xs font-black uppercase tracking-tight text-white mb-0.5 block">{status.label}</span>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase leading-none">{status.meaning}</p>
                                </div>
                            </div>
                            <span className="font-league font-black text-primary italic uppercase tracking-tighter">{status.score}</span>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex gap-3">
                <Info className="w-5 h-5 text-primary shrink-0" />
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
                    Rules are strictly enforced by the WA State LCB Compliance Layer. Check-ins are limited to 2 per 12-hour window.
                </p>
            </footer>
        </div>
    );
};
