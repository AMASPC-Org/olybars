import React from 'react';
import { Flame, Users, Beer } from 'lucide-react';

interface VibeSelectorProps {
    onSelect: (vibe: 'buzzing' | 'lively' | 'chill') => void;
    currentVibe?: string;
}

export const VibeSelector: React.FC<VibeSelectorProps> = ({ onSelect, currentVibe }) => {
    return (
        <div className="flex gap-2 p-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl">
            <button
                onClick={() => onSelect('buzzing')}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${currentVibe === 'buzzing' ? 'bg-primary text-black scale-105' : 'hover:bg-white/5 text-slate-400'
                    }`}
            >
                <Flame className={currentVibe === 'buzzing' ? 'animate-pulse' : ''} size={20} strokeWidth={3} />
                <span className="text-[8px] font-black uppercase tracking-widest">Buzzing</span>
            </button>

            <button
                onClick={() => onSelect('lively')}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${currentVibe === 'lively' ? 'bg-blue-500 text-white scale-105' : 'hover:bg-white/5 text-slate-400'
                    }`}
            >
                <Users size={20} strokeWidth={3} />
                <span className="text-[8px] font-black uppercase tracking-widest">Lively</span>
            </button>

            <button
                onClick={() => onSelect('chill')}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${currentVibe === 'chill' ? 'bg-slate-700 text-white scale-105' : 'hover:bg-white/5 text-slate-400'
                    }`}
            >
                <Beer size={20} strokeWidth={3} />
                <span className="text-[8px] font-black uppercase tracking-widest">Chill</span>
            </button>
        </div>
    );
};
