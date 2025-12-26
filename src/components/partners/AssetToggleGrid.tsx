import React from 'react';
import {
    Target, Gamepad2, Mic2, HelpCircle, Dog,
    Sun, Music, Box, UserCheck, Star
} from 'lucide-react';

export interface AssetToggle {
    id: string;
    label: string;
    icon: any;
    category: 'activity' | 'amenity';
}

const ASSETS: AssetToggle[] = [
    { id: 'pool', label: 'Pool Tables', icon: Target, category: 'activity' },
    { id: 'darts', label: 'Darts', icon: UserCheck, category: 'activity' },
    { id: 'arcade', label: 'Arcade/Pinball', icon: Gamepad2, category: 'activity' },
    { id: 'cornhole', label: 'Cornhole', icon: Box, category: 'activity' },
    { id: 'karaoke', label: 'Karaoke', icon: Mic2, category: 'activity' },
    { id: 'trivia', label: 'Trivia', icon: HelpCircle, category: 'activity' },
    { id: 'dog_friendly', label: 'Dog Friendly', icon: Dog, category: 'amenity' },
    { id: 'outdoor_seating', label: 'Outdoor Seating', icon: Sun, category: 'amenity' },
    { id: 'live_music', label: 'Live Music Stage', icon: Music, category: 'amenity' },
];

interface AssetToggleGridProps {
    selectedAssets: Record<string, boolean>;
    onChange: (assetId: string, value: boolean) => void;
}

export const AssetToggleGrid: React.FC<AssetToggleGridProps> = ({ selectedAssets, onChange }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ASSETS.map((asset) => {
                const Icon = asset.icon;
                const isActive = !!selectedAssets[asset.id];

                return (
                    <button
                        key={asset.id}
                        onClick={() => onChange(asset.id, !isActive)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 group ${isActive
                                ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10'
                                : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/20 hover:text-white'
                            }`}
                    >
                        <div className={`mb-3 p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/20 scale-110' : 'bg-white/5 group-hover:bg-white/10'
                            }`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">
                            {asset.label}
                        </span>

                        {isActive && (
                            <div className="absolute top-2 right-2">
                                <Star className="w-3 h-3 fill-primary animate-pulse" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
