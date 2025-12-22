import React from 'react';
import { Music, Calendar, MapPin, Plus } from 'lucide-react';
import { Venue } from '../../../types';

interface LiveMusicScreenProps {
    venues: Venue[];
}

export const LiveMusicScreen: React.FC<LiveMusicScreenProps> = ({ venues }) => {
    const musicVenues = venues.filter(v => v.leagueEvent === 'live_music' || v.type.toLowerCase().includes('music'));

    return (
        <div className="bg-background text-white min-h-screen p-4 font-sans space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-primary tracking-wider font-league uppercase">LIVE MUSIC CIRCUIT</h1>
                <p className="text-sm font-bold text-slate-300 uppercase italic">The Sound of the South Sound</p>
            </div>

            {/* Submit CTA */}
            <div className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center space-y-4">
                <div className="flex justify-center">
                    <div className="bg-primary p-3 rounded-full shadow-lg shadow-primary/20">
                        <Music className="w-6 h-6 text-black" strokeWidth={3} />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-black text-white font-league uppercase">Got a Gig?</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-1">Submit your band or venue to the official OlyBars circuit.</p>
                </div>
                <button
                    onClick={() => alert("Feature coming soon! For now, contact Artie to request a listing.")}
                    className="w-full bg-primary text-black font-black py-3 rounded-xl uppercase tracking-widest text-xs font-league border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all"
                >
                    <Plus className="inline-block w-4 h-4 mr-2" strokeWidth={3} /> Submit Band/Gig
                </button>
            </div>

            {/* Main Content Area */}
            {musicVenues.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 font-league">ACTIVE STAGES</h3>
                    {musicVenues.map(venue => (
                        <div
                            key={venue.id}
                            className="bg-surface rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden group hover:border-primary/50 transition-colors"
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-black text-white font-league uppercase">{venue.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPin className="w-3 h-3 text-primary" />
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{venue.type}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                                        <Music className="w-5 h-5 text-primary" strokeWidth={3} />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/5">
                                        <p className="text-[9px] text-primary font-black uppercase mb-1">Coming Up</p>
                                        <p className="text-xs font-bold text-white uppercase italic">{venue.deal || "Local Showcase @ 8PM"}</p>
                                    </div>
                                    <button className="bg-slate-800 p-3 rounded-xl border border-slate-700 hover:border-primary transition-colors group">
                                        <Calendar className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl">
                    <Music className="w-12 h-12 text-slate-700 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-slate-500 font-black uppercase font-league tracking-widest">No Active Circuits Found</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase mt-2">Check back during the weekend!</p>
                </div>
            )}
        </div>
    );
};
