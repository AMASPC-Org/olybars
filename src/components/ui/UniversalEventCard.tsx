import React from 'react';
import { MapPin, Share2, Plus, Hammer, Trophy, Music, Mic } from 'lucide-react';
import { Venue } from '../../types';
import { VibeSelector } from './VibeSelector';

interface UniversalEventCardProps {
    venue: Venue;
    title: string;
    time: string;
    category: 'play' | 'live' | 'event' | 'karaoke';
    onCheckIn: () => void;
    onShare: () => void;
    onVibeChange: (vibe: 'buzzing' | 'lively' | 'chill') => void;
    contextSlot?: React.ReactNode;
    points?: number;
}

export const UniversalEventCard: React.FC<UniversalEventCardProps> = ({
    venue,
    title,
    time,
    category,
    onCheckIn,
    onShare,
    onVibeChange,
    contextSlot,
    points = 10
}) => {
    const getIcon = () => {
        switch (category) {
            case 'play': return Trophy;
            case 'live': return Music;
            case 'karaoke': return Mic;
            default: return Hammer;
        }
    };

    const Icon = getIcon();

    return (
        <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl group transition-all hover:border-primary/30 mb-6">
            {/* Visual Header with Artesian Frame Effect */}
            <div className="h-48 relative overflow-hidden bg-slate-900 group-hover:scale-[1.01] transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent z-10" />
                {/* Placeholder for venue photo - utilizing Artesian Frame effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-2 border-primary/20 flex items-center justify-center animate-pulse">
                        <Icon size={48} className="text-primary/40" />
                    </div>
                </div>

                {/* Points Pill */}
                <div className="absolute top-4 right-4 z-20 bg-primary text-black text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-black/10 flex items-center gap-1">
                    <Plus size={12} strokeWidth={4} /> {points} LEAGUE PTS
                </div>

                {/* Category Label */}
                <div className="absolute bottom-4 left-6 z-20 flex items-center gap-2">
                    <span className="bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/10">
                        {category}
                    </span>
                </div>
            </div>

            <div className="p-6 pt-4 space-y-4">
                {/* Core Info */}
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white font-league uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400">
                        <MapPin size={12} className="text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{venue.name} • {time}</span>
                    </div>
                </div>

                {/* Context Slot (League Standings, Genre Tags, etc.) */}
                {contextSlot && (
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                        {contextSlot}
                    </div>
                )}

                {/* Vibe Pulse Section */}
                <div className="space-y-2">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest px-1">Update the Pulse</p>
                    <VibeSelector onSelect={onVibeChange} currentVibe={venue.status} />
                </div>

                {/* Participation Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onCheckIn}
                        className="flex-[2] bg-primary hover:bg-yellow-400 text-black font-black py-4 rounded-2xl transition-all font-league uppercase text-sm border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none"
                    >
                        I'm Here
                    </button>
                    <button
                        onClick={onShare}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center border border-white/10 active:scale-95 shadow-xl"
                    >
                        <Share2 size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Maker Tag Footer */}
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center">
                            <Hammer size={12} className="text-primary" />
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                            {venue.isHQ ? 'Artesian Anchor' : (venue.isLocalMaker ? 'Local Maker' : 'League Destination')}
                        </span>
                    </div>
                    <span className="text-[8px] text-slate-700 font-black uppercase">Established by OlyBars</span>
                </div>
            </div>
        </div>
    );
};
