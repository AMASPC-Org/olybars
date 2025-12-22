import React from 'react';
import { Mic, Music, Trophy, Star, Plus } from 'lucide-react';
import { Venue } from '../../../types';

interface KaraokeScreenProps {
    venues: Venue[];
}

export const KaraokeScreen: React.FC<KaraokeScreenProps> = ({ venues }) => {
    // Find the primary Karaoke venue (e.g., The Brotherhood or first karaoke venue)
    const primaryKaraokeVenue = venues.find(v => v.leagueEvent === 'karaoke' || v.id === 'broho');
    const otherKaraokeSpots = venues.filter(v => v.leagueEvent === 'karaoke' && v.id !== primaryKaraokeVenue?.id);

    return (
        <div className="bg-background text-white min-h-screen p-4 font-body">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-black text-primary tracking-wider font-league uppercase">KARAOKE LOUNGE</h1>
                <p className="text-sm font-bold text-slate-300 uppercase italic">Mic is Hot & Blood is Thin</p>
            </div>

            {/* Main Stage Card */}
            {primaryKaraokeVenue ? (
                <div className="bg-surface rounded-lg border border-slate-700 shadow-[4px_4px_0px_0px_#000] p-5 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-white font-league uppercase leading-none">{primaryKaraokeVenue.name}</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase mt-1">TONIGHT @ 9:00 PM</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-primary font-league">{primaryKaraokeVenue.checkIns} SINGERS</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">IN THE QUEUE</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button className="bg-primary hover:bg-yellow-400 text-black font-black py-4 rounded-md transition-all flex items-center justify-center gap-2 font-league uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                            <Mic size={18} strokeWidth={3} /> JOIN QUEUE
                        </button>
                        <button className="bg-slate-700 hover:bg-slate-600 text-white font-black py-4 rounded-md transition-all flex items-center justify-center gap-2 font-league uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                            <Music size={18} strokeWidth={3} /> REQUEST SONG
                        </button>
                    </div>

                    {/* Rules & Rewards */}
                    <div className="space-y-4">
                        <div className="bg-background/40 p-3 border border-white/5 rounded-md flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Star size={18} className="text-primary" />
                                <div>
                                    <h3 className="font-black text-white text-sm font-league uppercase">VIBE MASTER</h3>
                                    <p className="text-[10px] text-slate-500 font-bold">Crowd vote winner gets +50 League Pts</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-background/40 p-3 border border-white/5 rounded-md flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Trophy size={18} className="text-yellow-400" />
                                <div>
                                    <h3 className="font-black text-white text-sm font-league uppercase">LEAGUE PLAY</h3>
                                    <p className="text-[10px] text-slate-500 font-bold">Sing any song to earn 20 Pts</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="bg-primary text-black text-[10px] font-black px-2 py-0.5 transform -skew-x-12 inline-block font-league uppercase">
                                    ACTIVE
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-surface rounded-lg border border-slate-700 p-8 text-center mb-6">
                    <p className="text-slate-500 font-bold uppercase">No Active Karaoke Stage</p>
                </div>
            )}

            {/* Other Venues */}
            {otherKaraokeSpots.length > 0 && (
                <>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 font-league">OTHER KARAOKE SPOTS</h3>
                    <div className="space-y-3">
                        {otherKaraokeSpots.map((spot, i) => (
                            <div key={i} className="bg-surface/50 border border-white/5 p-4 flex justify-between items-center rounded-lg">
                                <div>
                                    <span className="block text-white font-black text-sm font-league uppercase">{spot.name}</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{spot.hours as string || 'Check Hours'}</span>
                                </div>
                                <span className="text-[10px] font-black text-primary font-league uppercase tracking-widest">ACTIVE</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Submit CTA */}
            <div className="mt-12 bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl p-6 text-center">
                <p className="text-xs text-slate-400 font-bold uppercase mb-4 tracking-widest">Missing a Night?</p>
                <button
                    onClick={() => alert("Registration for new Karaoke nights is coming soon! Contact Artie for now.")}
                    className="w-full bg-slate-800 text-primary font-black py-4 rounded-xl uppercase tracking-widest text-sm font-league border-2 border-primary shadow-[4px_4px_0px_0px_rgba(251,191,36,0.2)]"
                >
                    <Plus className="inline-block w-4 h-4 mr-2" /> Add Karaoke Night
                </button>
            </div>
        </div>
    );
};