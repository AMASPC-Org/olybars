import React, { useState } from 'react';
import {
    Plus, Trash2, Edit2, Gamepad2,
    ChevronDown, ChevronUp, Star, Search,
    Hash, Info
} from 'lucide-react';
import { Venue, AmenityDetail } from '../../../types';
import { barGames } from '../../../data/barGames';

interface AmenityManagerProps {
    venue: Venue;
    onChange: (updates: Partial<Venue>) => void;
}

export const AmenityManager: React.FC<AmenityManagerProps> = ({ venue, onChange }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const currentAmenities = venue.amenityDetails || [];

    const handleAdd = (gameName: string) => {
        const id = gameName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const newAmenity: AmenityDetail = {
            id,
            name: gameName,
            count: 1,
            isLeaguePartner: true
        };

        const updated = [...currentAmenities, newAmenity];
        onChange({
            amenityDetails: updated,
            assets: { ...venue.assets, [id]: true }
        });
        setIsAdding(false);
        setSearchQuery('');
    };

    const handleRemove = (id: string) => {
        const updated = currentAmenities.filter(a => a.id !== id);
        const updatedAssets = { ...venue.assets };
        delete updatedAssets[id];

        onChange({
            amenityDetails: updated,
            assets: updatedAssets
        });
    };

    const handleUpdate = (id: string, updates: Partial<AmenityDetail>) => {
        const updated = currentAmenities.map(a =>
            a.id === id ? { ...a, ...updates } : a
        );
        onChange({ amenityDetails: updated });
    };

    const availableGames = barGames.flatMap(cat => cat.games)
        .filter(g => !currentAmenities.some(a => a.name.toLowerCase() === g.name.toLowerCase()))
        .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h4 className="text-sm font-black text-white uppercase flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-primary" />
                        Specific Games & Assets
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Configure counts and names for Vibe Check</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary text-black text-[10px] font-black uppercase rounded-lg hover:scale-105 transition-transform"
                    >
                        <Plus size={14} strokeWidth={3} /> Add Game
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-slate-900 border border-primary/30 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="SEARCH LEAGUE GLOSSARY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs font-bold text-white uppercase focus:border-primary outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {availableGames.map(game => (
                            <button
                                key={game.name}
                                onClick={() => handleAdd(game.name)}
                                className="text-left p-2.5 bg-white/5 hover:bg-primary/20 border border-white/5 hover:border-primary/50 rounded-lg group transition-all"
                            >
                                <p className="text-[10px] font-black text-slate-300 group-hover:text-white uppercase transition-colors">{game.name}</p>
                            </button>
                        ))}
                        {availableGames.length === 0 && (
                            <p className="col-span-2 text-center text-slate-500 text-[10px] font-bold uppercase py-4 italic">No matching games found</p>
                        )}
                    </div>

                    <button
                        onClick={() => setIsAdding(false)}
                        className="w-full py-2 text-[10px] font-black text-slate-500 uppercase hover:text-white"
                    >
                        Cancel
                    </button>
                </div>
            )}

            <div className="space-y-2">
                {currentAmenities.map(amenity => (
                    <div key={amenity.id} className="bg-slate-900/50 border border-white/5 rounded-xl p-4 group transition-all hover:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center border border-white/5">
                                    <Hash className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <h5 className="text-xs font-black text-white uppercase tracking-wider">{amenity.name}</h5>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{amenity.count} Unit{amenity.count !== 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEditingId(editingId === amenity.id ? null : amenity.id)}
                                    className="p-2 text-slate-500 hover:text-primary transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleRemove(amenity.id)}
                                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {editingId === amenity.id && (
                            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Display Name</label>
                                    <input
                                        type="text"
                                        value={amenity.name}
                                        onChange={(e) => handleUpdate(amenity.id, { name: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs font-bold text-white uppercase outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantity</label>
                                    <input
                                        type="number"
                                        value={amenity.count}
                                        onChange={(e) => handleUpdate(amenity.id, { count: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs font-bold text-white uppercase outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Artie Lore / Specifics</label>
                                    <textarea
                                        value={amenity.artieLore || ''}
                                        onChange={(e) => handleUpdate(amenity.id, { artieLore: e.target.value })}
                                        placeholder="E.G. LOCATED IN THE BACK ROOM NEAR THE STAGE..."
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs font-bold text-white uppercase outline-none focus:border-primary h-20 resize-none"
                                    />
                                </div>
                                <div className="col-span-2 flex items-center justify-between p-2 bg-black/30 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Star className={`w-4 h-4 ${amenity.isLeaguePartner ? 'text-primary' : 'text-slate-600'}`} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">League Partner Machine</span>
                                    </div>
                                    <button
                                        onClick={() => handleUpdate(amenity.id, { isLeaguePartner: !amenity.isLeaguePartner })}
                                        className={`w-8 h-4 rounded-full p-0.5 transition-all ${amenity.isLeaguePartner ? 'bg-primary' : 'bg-slate-700'}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full bg-white transition-all ${amenity.isLeaguePartner ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {currentAmenities.length === 0 && !isAdding && (
                    <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl bg-slate-900/30">
                        <Gamepad2 className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">No specific games configured</p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="mt-4 text-xs font-black text-primary hover:text-white uppercase tracking-widest underline underline-offset-4"
                        >
                            Add Your First Game
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
