import React from 'react';
import { Mic, X, Crown, Settings } from 'lucide-react';
import { Venue } from '../../venues/screens/BuzzScreen'; // Reusing the Venue interface

// --- Mock Data (Filter only relevant venues) ---
const MOCK_VENUES: Venue[] = [
    { id: 'hannahs', name: "Hannah's Bar", status: 'buzzing', checkIns: 42, type: 'Dive Bar', vibe: 'Chaotic Good', leagueEvent: 'karaoke' },
    { id: 'crypt', name: "Cryptatropa", status: 'chill', checkIns: 12, type: 'Goth Bar', vibe: 'Spooky Quiet', leagueEvent: 'karaoke' },
];

export const KaraokeScreen: React.FC = () => {
    const venues = MOCK_VENUES; // Replace with useQuery later

    const renderKaraokeHub = () => (
        <div className="p-4 pb-28 space-y-6 bg-background">
            {/* The Header Block (Modern Theme) */}
            <div className="bg-surface border border-primary/50 p-4 rounded-xl shadow-lg">
                <h2 className="text-3xl font-['Bangers'] text-white uppercase tracking-wider leading-none">KARAOKE LOUNGE</h2>
                <p className="font-['Roboto_Condensed'] font-bold text-slate-400 text-sm mt-1">MIC IS HOT</p>
            </div>
            
            {/* The Venue List */}
            {venues.filter(v => v.leagueEvent === 'karaoke').map(v => (
                <div key={v.id} 
                    // Theme Update: Sleek card, removing thick borders
                    className="bg-surface border border-slate-700 p-4 rounded-lg shadow-md active:scale-[0.99] transition-transform cursor-pointer"
                >
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-['Bangers'] text-white tracking-wide">{v.name}</h3>
                        <div className="p-1 bg-fuchsia-900/30 rounded-full">
                          <Mic className="w-5 h-5 text-fuchsia-400" strokeWidth={3} />
                        </div>
                    </div>
                    <p className="text-slate-400 font-bold text-sm mt-1">{v.description?.substring(0,60) || v.type}...</p>
                </div>
            ))}
            
            {venues.filter(v => v.leagueEvent === 'karaoke').length === 0 && (
                <div className="text-center p-8 border-2 border-dashed border-slate-700 font-['Roboto_Condensed'] text-slate-500 font-bold uppercase rounded-lg">No Active Karaoke</div>
            )}
        </div>
    );
    
    return renderKaraokeHub();
};