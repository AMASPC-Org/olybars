import React, { useState } from 'react';
import { Venue } from '../../../types';
import { useToast } from '../../../components/ui/BrandedToast';
import { Save, AlertTriangle, Plus, X, Search, Check } from 'lucide-react';
import { API_BASE_URL } from '../../../lib/api-config';

interface LocalMakerManagementTabProps {
    venue: Venue;
    onUpdate: (venueId: string, updates: Partial<Venue>) => void;
    venues: Venue[]; // List of all venues to select from (though technically makers are venues too in this model)
}

export const LocalMakerManagementTab: React.FC<LocalMakerManagementTabProps> = ({ venue, onUpdate, venues }) => {
    const { showToast } = useToast();
    const [isLocalMaker, setIsLocalMaker] = useState(venue.isLocalMaker || false);
    const [localScore, setLocalScore] = useState(venue.localScore || 0);
    const [carryingMakers, setCarryingMakers] = useState<string[]>(venue.carryingMakers || []);
    const [makerSearch, setMakerSearch] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);

    const handleRequestActivation = async () => {
        setIsRequesting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'MAKER_ACTIVATION',
                    payload: {
                        venueId: venue.id,
                        venueName: venue.name,
                        message: "Venue requesting Artesian Anchor / Local Maker status."
                    }
                })
            });

            if (response.ok) {
                showToast('Feature Request Sent to Admin Panel', 'success');
            } else {
                showToast('Failed to send request.', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Network error.', 'error');
        } finally {
            setIsRequesting(false);
        }
    };

    const handleSave = async () => {
        try {
            await onUpdate(venue.id, {
                isLocalMaker,
                localScore,
                carryingMakers
            });
            showToast('Maker profile updated!', 'success');
        } catch (error) {
            showToast('Failed to save changes.', 'error');
        }
    };

    const toggleCarrier = (makerId: string) => {
        setCarryingMakers(prev =>
            prev.includes(makerId)
                ? prev.filter(id => id !== makerId)
                : [...prev, makerId]
        );
    };

    // Filter for venues that are MARKED as Local Makers to add to the "carrying" list
    // In a real scenario, you might want to carry ANY venue/brand, but let's assume we filter for Makers.
    // However, if we simply want to say "We carry Well 80", Well 80 is a Venue.
    const availableMakers = venues.filter(v => v.id !== venue.id && (v.isLocalMaker || v.makerType === 'Brewery' || v.makerType === 'Distillery'));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="bg-surface p-6 rounded-xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <AlertTriangle className="w-32 h-32 text-primary" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase font-league mb-2 relative z-10">Artesian Anchor Status</h3>
                <p className="text-sm text-slate-400 max-w-md relative z-10 leading-relaxed">
                    Identify this venue as a <strong>Local Maker</strong> (Brewery, Distillery, Roaster).
                    This unlocks the "Master Maker" badge and allows other bars to list you on their menus.
                </p>

                <div className="mt-8 flex items-center gap-4 relative z-10">
                    <label className={`flex items-center gap-3 group ${venue.isVerifiedMaker ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                        <div className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${isLocalMaker ? 'bg-primary shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'bg-slate-700'}`}
                            onClick={() => venue.isVerifiedMaker && setIsLocalMaker(!isLocalMaker)}>
                            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${isLocalMaker ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <span className={`font-black uppercase tracking-widest text-sm transition-colors ${isLocalMaker ? 'text-primary' : 'text-slate-500'}`}>
                            {isLocalMaker ? 'Active Maker' : 'Standard Venue'}
                        </span>
                    </label>
                    {!venue.isVerifiedMaker && (
                        <button
                            onClick={handleRequestActivation}
                            disabled={isRequesting}
                            className="bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded border border-primary/30 ml-4 animate-pulse disabled:opacity-50"
                        >
                            {isRequesting ? 'Sending...' : 'Request Activation'}
                        </button>
                    )}
                </div>
            </div>

            {!venue.isVerifiedMaker && (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                    <AlertTriangle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-600 uppercase font-league mb-2">Gatekeeper Locked</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-sm">
                        Verification required. Only approved "Artesian Anchor" partners can enable Maker tools.
                        <br /><span className="text-primary mt-2 block">Contact Ryan for approval.</span>
                    </p>
                </div>
            )}

            {/* Gated Content */}
            {venue.isVerifiedMaker && (
                <>

                    {/* Local Score Slider */}
                    <div className="bg-surface p-6 rounded-xl border border-white/10">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h4 className="text-lg font-black text-white uppercase font-league">Local Score</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Impacts Point Multipliers</p>
                            </div>
                            <span className="text-4xl font-black text-primary font-league">{localScore}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={localScore}
                            onChange={(e) => setLocalScore(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mt-2">
                            <span>Imported</span>
                            <span>Hyper-Local</span>
                        </div>
                    </div>

                    {/* Carrying Makers Selection */}
                    <div className="bg-surface p-6 rounded-xl border border-white/10">
                        <h4 className="text-lg font-black text-white uppercase font-league mb-4">Who do you carry?</h4>
                        <p className="text-xs text-slate-400 mb-4">Select other Local Makers you serve. This populates their "Where to find us" list.</p>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search local makers..."
                                value={makerSearch}
                                onChange={(e) => setMakerSearch(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-lg py-2 pl-10 text-sm text-white focus:border-primary outline-none font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {availableMakers
                                .filter(m => m.name.toLowerCase().includes(makerSearch.toLowerCase()))
                                .map(maker => (
                                    <button
                                        key={maker.id}
                                        onClick={() => toggleCarrier(maker.id)}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${carryingMakers.includes(maker.id)
                                            ? 'bg-primary/10 border-primary text-white'
                                            : 'bg-black/40 border-white/5 text-slate-400 hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="font-bold text-sm">{maker.name}</span>
                                        {carryingMakers.includes(maker.id) && <Check className="w-4 h-4 text-primary" />}
                                    </button>
                                ))}
                            {availableMakers.length === 0 && (
                                <div className="text-center py-8 text-slate-600 font-bold text-xs uppercase">No other makers found in directory.</div>
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4 sticky bottom-0 bg-[#0f172a] pb-4">
                        <button
                            onClick={handleSave}
                            className="w-full bg-primary text-black font-black py-4 rounded-xl uppercase tracking-widest text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <Save className="w-5 h-5" strokeWidth={3} />
                            Save Local Maker Profile
                        </button>
                    </div>
                </>
            )}

            {/* Save Button (Always visible to save un-gated carrying changes if we allowed them, but here we gate everything except carrying requests? Actually let's gate "carrying" too as per prompt "Local Maker Settings") */}
            {/* The prompt implies the entire section is restricted. "Modify the OwnerDashboardScreen.tsx to include two new restricted sections... Logic: These sections should be disabled by default." */}
            {/* So I am wrapping the rest in the check. */}
            {venue.isVerifiedMaker && (
                <div className="pt-4 sticky bottom-0 bg-[#0f172a] pb-4">
                    <button
                        onClick={handleSave}
                        className="w-full bg-primary text-black font-black py-4 rounded-xl uppercase tracking-widest text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <Save className="w-5 h-5" strokeWidth={3} />
                        Save Local Maker Profile
                    </button>
                </div>
            )}
        </div>
    );
};
