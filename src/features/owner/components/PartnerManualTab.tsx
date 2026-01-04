import React from 'react';
import { Book, Zap, Layout, Clock, Calendar, Users, Globe, ExternalLink, Smartphone } from 'lucide-react';

export const PartnerManualTab: React.FC = () => {
    const sections = [
        {
            title: "Hours of Operation",
            icon: Clock,
            artie: "Ask Artie: \"Artie, update our hours for tonight to close at 2 AM.\"",
            manual: "Manual: Go to the 'Listing' tab and update the 'Hours of Operation' field."
        },
        {
            title: "Happy Hour Scheduling",
            icon: Zap,
            artie: "Ask Artie: \"Artie, schedule a Happy Hour for Monday, 3-6 PM, $1 off drafts.\"",
            manual: "Manual: Go to the 'Listing' tab and scroll to the 'Recurring Happy Hour' manager at the bottom."
        },
        {
            title: "Adding Events",
            icon: Calendar,
            artie: "Ask Artie: \"Artie, add Karaoke every Thursday at 9 PM starting next week.\"",
            manual: "Manual: Use the 'Events' tab to create, edit, or remove calendar listings."
        },
        {
            title: "Flash Deals (Bat Signals)",
            icon: Zap,
            artie: "Ask Artie: \"Artie, run a $5 Burger flash deal for the next 90 minutes.\"",
            manual: "Manual: Use the 'Operations' tab to instantly broadcast or schedule a Flash Deal."
        },
        {
            title: "Listing & Profile Updates",
            icon: Layout,
            artie: "Ask Artie: \"Artie, update our website link and Instagram handle.\"",
            manual: "Manual: Use the 'Listing' tab for website, social links, and venue descriptions."
        },
        {
            title: "Occupancy & Capacity",
            icon: Users,
            artie: "Ask Artie: \"Artie, set our maximum occupancy to 75.\"",
            manual: "Manual: Go to the 'Listing' tab and update the 'Venue Capacity' field."
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <header className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-xl border border-primary/30">
                    <Book className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter font-league leading-none">THE PARTNER MANUAL</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest leading-relaxed">
                        Master your presence on OlyBars. Choose your path: <span className="text-primary italic">The Artie Way</span> or <span className="text-white italic">The Manual Way</span>.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-primary/20 transition-all group">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-primary/10 transition-colors">
                                    <section.icon className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase font-league tracking-tight">{section.title}</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl relative group/artie">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest font-league italic">The Artie Way</span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                                        {section.artie}
                                    </p>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover/artie:opacity-100 transition-opacity">
                                        <Zap className="w-4 h-4 text-primary opacity-30" />
                                    </div>
                                </div>

                                <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-league">The Manual Way</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                        {section.manual}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-br from-[#0f172a] to-black border border-white/10 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="bg-primary p-4 rounded-2xl rotate-3 shadow-2xl shadow-primary/20">
                        <Smartphone className="w-12 h-12 text-black" strokeWidth={2.5} />
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h3 className="text-2xl font-black text-white uppercase font-league tracking-tighter mb-2 italic">Pro-Tip: Hands-Free Ops</h3>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xl">
                            Busy at the bar? You don't need to open the Brew House to update your vibe or deals.
                            Just open the <span className="text-primary font-bold">Artie Voice Interface</span> on your phone and speak your command.
                            Our AI will draft the update and all you have to do is tap "Confirm" when you see the notification.
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.href = '#'}
                        className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        View Skills List
                        <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <footer className="text-center py-8">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    Manual Protocol v1.2.0 • Partnership Integrity Verified
                </p>
            </footer>
        </div>
    );
};
