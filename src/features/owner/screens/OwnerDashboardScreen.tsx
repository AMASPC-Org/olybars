import React, { useState } from 'react';
import {
    Settings, HelpCircle, X, Trophy, Users, Smartphone, Zap, Plus, Minus, Shield, ChevronRight
} from 'lucide-react';
import { Venue, UserProfile } from '../../../types'; // Import shared Venue type
import { OwnerMarketingPromotions } from '../../../components/OwnerMarketingPromotions';

// Define the Props Interface so App.tsx can talk to this component
interface OwnerDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    venues: Venue[]; // Data passed down from App.tsx
    updateVenue: (venueId: string, updates: Partial<Venue>) => void; // Function passed down
    userProfile: UserProfile;
}

// Stats Helpers
const WEEKLY_STATS = { totalCheckIns: 142, newMembers: 18, returnRate: "34%", topNights: "Fri, Sat" };
const TOP_PLAYERS = [
    { rank: 1, handle: "BarFly_99", visits: 4 }, { rank: 2, handle: "TriviaKing", visits: 3 },
    { rank: 3, handle: "PNW_Hiker", visits: 3 }, { rank: 4, handle: "OlyOlyOxen", visits: 2 },
];
const DEAL_PRESETS = ["$1 Off Drafts", "$5 Well Drinks", "Half-Price Apps", "BOGO Burgers", "Industry Night"];

const calculatePulseScore = (venue: Venue): number => {
    let score = 50;
    switch (venue.status) {
        case 'buzzing': score += 30; break;
        case 'lively': score += 15; break;
        case 'chill': score += 5; break;
    }
    if (venue.deal) score += 10;
    if (venue.leagueEvent) score += 10;
    score += (venue.checkIns || 0) * 1.5;
    return Math.min(Math.round(score), 100);
};

export const OwnerDashboardScreen: React.FC<OwnerDashboardProps> = ({ isOpen, onClose, venues, updateVenue, userProfile }) => {
    // Determine accessible venues based on role
    const accessibleVenues = venues.filter(v => {
        if (userProfile.role === 'admin') return true;
        if (userProfile.role === 'owner' && v.ownerId === userProfile.uid) return true;
        if (userProfile.role === 'manager' && v.managerIds?.includes(userProfile.uid)) return true;
        return false;
    });

    const [selectedVenueId, setSelectedVenueId] = useState<string | null>(accessibleVenues[0]?.id || null);
    const myVenue = accessibleVenues.find(v => v.id === selectedVenueId);

    const [dealText, setDealText] = useState('');
    const [dealDuration, setDealDuration] = useState(60); // minutes
    const [showArtieCommands, setShowArtieCommands] = useState(false);
    const [dashboardView, setDashboardView] = useState<'main' | 'marketing'>('main');

    if (!isOpen) return null;
    if (!myVenue && accessibleVenues.length === 0) {
        return (
            <div className="fixed inset-0 z-[80] bg-background text-white flex flex-col items-center justify-center p-6">
                <Shield className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-bold uppercase">Access Denied</h2>
                <p className="text-slate-400 text-center mt-2 max-w-xs">Your account does not have management permissions for any active venues.</p>
                <button onClick={onClose} className="mt-8 bg-slate-800 px-6 py-2 rounded-md font-bold uppercase">Back to Pulse</button>
            </div>
        );
    }

    const pulseScore = myVenue ? calculatePulseScore(myVenue) : 0;

    const handlePublishDeal = () => {
        if (!dealText || !myVenue) return;
        updateVenue(myVenue.id, { deal: dealText, dealEndsIn: dealDuration });
        setDealText('');
        alert('FLASH DEAL BROADCASTED TO NETWORK');
    };

    const clearDeal = () => {
        if (!myVenue) return;
        updateVenue(myVenue.id, { deal: undefined, dealEndsIn: 0 });
    }

    const adjustCheckIns = (delta: number) => {
        if (!myVenue) return;
        const newCount = Math.max(0, myVenue.checkIns + delta);
        updateVenue(myVenue.id, { checkIns: newCount });
    };

    return (
        <div className="fixed inset-0 z-[80] bg-[#0f172a] text-white flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-start shrink-0 bg-black">
                <div className="flex items-center gap-4">
                    <div className="bg-primary p-3 rounded-lg border border-white/20">
                        <Settings className="w-8 h-8 text-black" strokeWidth={3} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter font-league leading-none">
                                COMMAND CENTER
                            </h2>
                            <HelpCircle className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex flex-col mt-1">
                            {accessibleVenues.length > 1 ? (
                                <div className="relative inline-block">
                                    <select
                                        value={selectedVenueId || ''}
                                        onChange={(e) => setSelectedVenueId(e.target.value)}
                                        className="bg-transparent text-primary text-xs font-black uppercase tracking-widest outline-none appearance-none pr-6 cursor-pointer font-league"
                                    >
                                        {accessibleVenues.map(v => (
                                            <option key={v.id} value={v.id} className="bg-[#0f172a]">{v.name}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="w-3 h-3 text-primary absolute right-0 top-1 rotate-90 pointer-events-none" />
                                </div>
                            ) : (
                                <p className="text-xs text-primary font-black uppercase tracking-widest font-league">
                                    ADMIN: {myVenue.name}
                                </p>
                            )}
                            <div className="inline-flex items-center gap-2 mt-1">
                                <div className="bg-primary/10 border border-primary px-2 py-0.5 rounded transform -skew-x-12">
                                    <span className="text-primary text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                        LEAGUE STATUS: ACTIVE
                                    </span>
                                </div>
                                <HelpCircle className="w-3 h-3 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <X className="w-10 h-10" strokeWidth={4} />
                </button>
            </div>

            {/* Premium Separator */}
            <div className="h-1 bg-gradient-to-r from-background via-primary to-background w-full opacity-50" />

            <div className="flex-1 overflow-y-auto space-y-8 p-6 pb-24 scrollbar-hide">
                {/* Top Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface p-4 border border-white/10 rounded-lg shadow-xl translate-y-0 active:translate-y-1 transition-all">
                        <p className="text-[10px] uppercase font-black text-slate-500 mb-1 font-league">Live Check-ins (Today)</p>
                        <p className="text-4xl font-black text-white font-league">{myVenue.checkIns || 42}</p>
                    </div>
                    <div className="bg-surface p-4 border border-white/10 rounded-lg shadow-xl relative">
                        <HelpCircle className="w-3 h-3 text-slate-700 absolute top-2 right-2" />
                        <p className="text-[10px] uppercase font-black text-slate-500 mb-1 font-league tracking-tighter">Live Vibe</p>
                        <p className={`text-2xl font-black uppercase font-league leading-none mt-1 ${myVenue.status === 'buzzing' ? 'text-red-500' : 'text-primary'}`}>
                            {myVenue.status === 'buzzing' ? 'BUZZING' : myVenue.status.toUpperCase()}
                        </p>
                    </div>
                    <div className="bg-surface p-4 border border-white/10 rounded-lg shadow-xl">
                        <p className="text-[10px] uppercase font-black text-slate-500 mb-1 font-league tracking-tighter">Active Promo</p>
                        {myVenue.deal ? (
                            <div>
                                <p className="text-sm font-black text-white leading-tight font-league">{myVenue.deal}</p>
                                <p className="text-[10px] text-primary font-black mt-1 font-league uppercase">{myVenue.dealEndsIn}m left</p>
                            </div>
                        ) : (
                            <p className="text-sm font-black text-slate-600 italic font-league">None Scheduled</p>
                        )}
                    </div>
                    <div className="bg-surface p-4 border border-white/10 rounded-lg shadow-xl">
                        <p className="text-[10px] uppercase font-black text-slate-500 mb-1 font-league tracking-tighter">Next League Event</p>
                        {myVenue.leagueEvent ? (
                            <p className="text-sm font-black text-white uppercase font-league">{myVenue.leagueEvent}</p>
                        ) : (
                            <p className="text-sm font-black text-slate-600 italic font-league uppercase">None Scheduled</p>
                        )}
                    </div>
                </div>

                {/* This Week at a Glance */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-primary flex items-center gap-2 uppercase tracking-widest font-league">
                        <Trophy className="w-4 h-4 text-primary" strokeWidth={3} /> This Week at a Glance
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: 'Total Check-ins', value: WEEKLY_STATS.totalCheckIns },
                            { label: 'New Members', value: WEEKLY_STATS.newMembers },
                            { label: 'Return Rate', value: WEEKLY_STATS.returnRate },
                            { label: 'Top Nights', value: WEEKLY_STATS.topNights }
                        ].map((stat, i) => (
                            <div key={i} className="bg-transparent border-2 border-slate-700 p-2 text-center flex flex-col justify-center items-center h-20">
                                <p className="text-[8px] text-slate-500 uppercase font-black leading-tight mb-1 font-league">{stat.label}</p>
                                <p className="text-lg font-black text-white font-league">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* League Players Table */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest font-league">
                        League Players at {myVenue.name}
                    </h3>
                    <div className="border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                        <table className="w-full text-left text-sm font-black font-league">
                            <thead className="bg-black text-primary">
                                <tr>
                                    <th className="p-3 uppercase tracking-tighter">Rank</th>
                                    <th className="p-3 uppercase tracking-tighter">Handle</th>
                                    <th className="p-3 text-right uppercase tracking-tighter">Visits</th>
                                </tr>
                            </thead>
                            <tbody className="bg-surface text-white divide-y divide-white/5">
                                {TOP_PLAYERS.map(p => (
                                    <tr key={p.rank}>
                                        <td className="p-3 text-slate-500">#{p.rank}</td>
                                        <td className="p-3 uppercase">{p.handle}</td>
                                        <td className="p-3 text-right">{p.visits}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Events & Promos Section */}
                <div className="bg-surface p-6 border border-white/10 rounded-lg shadow-2xl space-y-6">
                    <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-black text-white uppercase leading-none font-league">
                            EVENTS &<br />PROMOS
                        </h3>
                        <button
                            onClick={() => setShowArtieCommands(true)}
                            className="bg-primary text-black font-black px-4 py-2 rounded-md shadow-lg transition-all active:scale-[0.98] font-league text-sm"
                        >
                            <Smartphone className="w-4 h-4 inline mr-2" /> MANAGE VIA TEXT
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-black/40 border border-white/5 p-4 flex justify-between items-center rounded-lg">
                            <span className="text-white font-black text-sm font-league uppercase">
                                FRI 9PM: Karaoke League Night
                            </span>
                            <span className="text-primary font-black text-sm uppercase font-league">
                                Double Points
                            </span>
                        </div>
                        <div className="bg-black/40 border border-white/5 p-4 flex justify-between items-center rounded-lg">
                            <span className="text-white font-black text-sm font-league uppercase">
                                WED 7PM: Pub Trivia
                            </span>
                            <span className="text-slate-500 font-black text-sm uppercase font-league">
                                Regular
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-league">Manual Override Console</h3>
                    <div className="bg-surface p-6 border border-white/10 rounded-lg shadow-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-4 h-4 text-slate-600" />
                            <span className="text-[10px] font-black text-slate-500 uppercase font-league">Manual Headcount Adjust</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <button onClick={() => adjustCheckIns(-1)} className="w-14 h-14 flex items-center justify-center bg-black border border-white/10 text-white rounded-lg transition-all active:scale-[0.9]">
                                <Minus className="w-8 h-8" strokeWidth={4} />
                            </button>
                            <p className="text-5xl font-black text-white font-league tabular-nums">{myVenue.checkIns || 42}</p>
                            <button onClick={() => adjustCheckIns(1)} className="w-14 h-14 flex items-center justify-center bg-primary text-black rounded-lg transition-all active:scale-[0.9]">
                                <Plus className="w-8 h-8" strokeWidth={4} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Flash Deal Console */}
                <div className="bg-surface p-6 border border-white/10 border-dashed rounded-lg shadow-2xl relative mt-10">
                    <div className="absolute -top-4 left-6 bg-[#0f172a] border border-primary px-3 py-1 flex items-center gap-2 rounded-md">
                        <Zap className="w-4 h-4 text-primary" fill="currentColor" />
                        <span className="text-primary text-[10px] font-black uppercase tracking-widest font-league">QUICK FLASH DEAL</span>
                    </div>

                    {myVenue.deal ? (
                        <div className="text-center py-6">
                            <p className="text-slate-500 text-[10px] uppercase mb-4 font-black font-league tracking-widest">Active Broadcast</p>
                            <h4 className="text-3xl font-black text-white mb-2 tracking-tight font-league leading-tight">{myVenue.deal}</h4>
                            <p className="text-primary font-black text-lg mb-8 font-league">{myVenue.dealEndsIn}m remaining</p>
                            <button onClick={clearDeal} className="w-full bg-red-600 text-white rounded-md py-4 font-black uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] font-league">
                                TERMINATE DEAL
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 pt-4">
                            <input
                                type="text"
                                value={dealText}
                                onChange={(e) => setDealText(e.target.value)}
                                placeholder="TYPE CUSTOM DEAL..."
                                className="w-full bg-black border border-white/10 rounded-lg p-4 text-primary font-black placeholder:text-slate-800 outline-none font-league text-lg"
                            />
                            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                                {DEAL_PRESETS.map(preset => (
                                    <button
                                        key={preset}
                                        onClick={() => setDealText(preset)}
                                        className="px-4 py-2 bg-black border border-white/10 rounded-full text-[10px] font-black text-slate-500 hover:border-primary hover:text-white whitespace-nowrap uppercase font-league tracking-widest"
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                {[30, 60, 120].map(mins => (
                                    <button
                                        key={mins}
                                        onClick={() => setDealDuration(mins)}
                                        className={`flex-1 py-3 text-xs font-black rounded-lg transition-all uppercase font-league tracking-widest ${dealDuration === mins ? 'bg-primary text-black' : 'bg-black text-slate-500'}`}
                                    >
                                        {mins}m
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handlePublishDeal}
                                disabled={!dealText}
                                className={`w-full font-black text-xl uppercase tracking-widest py-5 rounded-lg transition-all flex items-center justify-center gap-3 font-league ${dealText ? 'bg-primary text-black' : 'bg-black text-slate-700 cursor-not-allowed opacity-50'}`}
                            >
                                <Zap className="w-6 h-6 fill-current" /> BROADCAST
                            </button>
                        </div>
                    )}
                </div>

                {/* Integrity Panel */}
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg space-y-4">
                    <h4 className="text-red-500 text-sm font-black uppercase tracking-widest flex items-center gap-2 font-league">
                        <Shield className="w-4 h-4" strokeWidth={3} /> League Integrity
                    </h4>
                    <div className="text-xs font-black text-red-400 space-y-2 uppercase font-league tracking-tighter">
                        <p>Suspicious check-ins this week: [0]</p>
                        <p>Manual audits: [1] (Last: Today 2:00PM by League HQ)</p>
                    </div>
                </div>

                {/* View Public Page Link */}
                <button
                    onClick={() => {
                        onClose();
                        // Navigate logic would go here if we had a venue page
                    }}
                    className="w-full bg-white text-[#0f172a] font-black py-6 rounded-lg shadow-xl uppercase tracking-widest font-league text-lg transition-all active:scale-[0.98]"
                >
                    VIEW PUBLIC PAGE
                </button>
            </div>

            {/* Artie Commands Modal */}
            {showArtieCommands && (
                <div className="fixed inset-0 bg-black/95 z-[90] flex items-center justify-center p-6 animate-in fade-in" onClick={() => setShowArtieCommands(false)}>
                    <div className="bg-surface border border-white/10 shadow-2xl w-full max-w-sm relative p-8 rounded-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowArtieCommands(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                            <X className="w-8 h-8" strokeWidth={4} />
                        </button>
                        <h3 className="text-3xl font-black text-primary uppercase mb-6 font-league leading-tight text-center">MANAGE VIA TEXT</h3>
                        <p className="text-sm font-medium text-slate-400 mb-8 font-body leading-relaxed text-center">Text these commands to Artie <span className="text-white">(555-0199)</span> to update your venue instantly.</p>
                        <div className="space-y-4">
                            <div className="bg-black/50 p-4 border border-white/10 rounded-xl">
                                <p className="text-slate-500 mb-1 text-[10px] font-black uppercase font-league">Set Event:</p>
                                <p className="font-bold text-white text-xs italic font-body">"karaoke league night Friday 9-11pm double points"</p>
                            </div>
                            <div className="bg-black/50 p-4 border border-white/10 rounded-xl">
                                <p className="text-slate-500 mb-1 text-[10px] font-black uppercase font-league">Cancel Event:</p>
                                <p className="font-bold text-white text-xs italic font-body">"cancel trivia tonight – low staff"</p>
                            </div>
                        </div>
                        <button onClick={() => setShowArtieCommands(false)} className="w-full mt-10 bg-primary text-black font-black py-4 text-xl uppercase rounded-xl shadow-lg transition-all active:scale-[0.98] font-league">
                            GOT IT
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};