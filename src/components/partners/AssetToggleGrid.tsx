import React from 'react';
import {
    Target, Gamepad2, Mic2, HelpCircle, Dog,
    Sun, Music, Box, UserCheck, Star,
    Zap, Beer, Trophy, Coffee, Utensils,
    Dices, Disc, Tv, Ghost, Heart,
    Scissors, Flame, Trash2, Shield, Users
} from 'lucide-react';

export interface AssetToggle {
    id: string;
    label: string;
    icon: any;
    category: 'Games' | 'Entertainment' | 'Atmosphere';
}

export const ASSETS: AssetToggle[] = [
    // Games
    { id: 'pool', label: 'Pool Tables', icon: Target, category: 'Games' },
    { id: 'darts', label: 'Darts', icon: UserCheck, category: 'Games' },
    { id: 'shuffleboard', label: 'Shuffleboard', icon: Disc, category: 'Games' },
    { id: 'arcade', label: 'Retro Arcade', icon: Gamepad2, category: 'Games' },
    { id: 'pinball', label: 'Pinball Machines', icon: Zap, category: 'Games' },
    { id: 'cornhole', label: 'Cornhole', icon: Box, category: 'Games' },
    { id: 'foosball', label: 'Foosball', icon: Trophy, category: 'Games' },
    { id: 'skeeball', label: 'Skeeball', icon: Disc, category: 'Games' },
    { id: 'axe_throwing', label: 'Axe Throwing', icon: Target, category: 'Games' },
    { id: 'board_games', label: 'Board Games', icon: Dices, category: 'Games' },

    // Entertainment
    { id: 'karaoke', label: 'Karaoke', icon: Mic2, category: 'Entertainment' },
    { id: 'trivia', label: 'Trivia', icon: HelpCircle, category: 'Entertainment' },
    { id: 'live_music', label: 'Live Music', icon: Music, category: 'Entertainment' },
    { id: 'bingo', label: 'Bingo', icon: HelpCircle, category: 'Entertainment' },
    { id: 'dancing', label: 'Dance Floor', icon: Flame, category: 'Entertainment' },
    { id: 'open_mic', label: 'Open Mic', icon: Mic2, category: 'Entertainment' },
    { id: 'tv_sports', label: 'Big Screens / Sports', icon: Tv, category: 'Entertainment' },

    // Atmosphere/Amenity
    { id: 'dog_friendly', label: 'Dog Friendly', icon: Dog, category: 'Atmosphere' },
    { id: 'outdoor_seating', label: 'Outdoor / Patio', icon: Sun, category: 'Atmosphere' },
    { id: 'food_onsite', label: 'Full Kitchen', icon: Utensils, category: 'Atmosphere' },
    { id: 'snack_only', label: 'Snacks Only', icon: Beer, category: 'Atmosphere' },
    { id: 'sober_friendly', label: 'Mocktails / Sober', icon: Heart, category: 'Atmosphere' },
    { id: 'family_friendly', label: 'All Ages (Daytime)', icon: Users, category: 'Atmosphere' },
];

interface AssetToggleGridProps {
    selectedAssets: Record<string, boolean>;
    onChange: (assetId: string, value: boolean) => void;
}

export const AssetToggleGrid: React.FC<AssetToggleGridProps> = ({ selectedAssets, onChange }) => {
    const categories: ('Games' | 'Entertainment' | 'Atmosphere')[] = ['Games', 'Entertainment', 'Atmosphere'];

    return (
        <div className="space-y-8">
            {categories.map(category => (
                <div key={category} className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-[1px] flex-1 bg-white/5" />
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">{category}</h4>
                        <div className="h-[1px] flex-1 bg-white/5" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {ASSETS.filter(a => a.category === category).map((asset) => {
                            const Icon = asset.icon;
                            const isActive = !!selectedAssets[asset.id];

                            return (
                                <button
                                    key={asset.id}
                                    type="button"
                                    onClick={() => onChange(asset.id, !isActive)}
                                    className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${isActive
                                        ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10'
                                        : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                                        }`}
                                >
                                    <div className={`mb-3 p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/20 scale-110' : 'bg-white/5 group-hover:bg-white/10 text-slate-600 group-hover:text-white'
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                                        {asset.label}
                                    </span>

                                    {isActive && (
                                        <div className="absolute top-2 right-2">
                                            <Star className="w-2.5 h-2.5 fill-primary animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
