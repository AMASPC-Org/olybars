import React from 'react';

interface ArtieFieldNoteProps {
    title: string;
    note: string;
}

export const ArtieFieldNote: React.FC<ArtieFieldNoteProps> = ({ title, note }) => {
    return (
        <div className="h-[150px] relative bg-slate-950 border-2 border-primary/20 rounded-[2rem] overflow-hidden mb-8 flex items-center shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24" />

            <div className="flex-1 p-8 z-10">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Artie's Field Note</span>
                    <div className="h-[1px] flex-1 bg-primary/20" />
                </div>
                <h4 className="text-2xl font-black text-white font-league uppercase mb-2 tracking-tight leading-none">
                    {title} <span className="text-primary italic">Lore</span>
                </h4>
                <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed line-clamp-3">
                    "{note}"
                </p>
            </div>

            <div className="w-[120px] h-full bg-slate-900/50 flex items-center justify-center border-l border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <img
                    src="/brand/Artie-Sticker-Gold.png"
                    alt="Artie"
                    className="w-16 h-16 opacity-30 grayscale hover:opacity-50 transition-opacity transform -rotate-12 group-hover:rotate-0"
                />
            </div>
        </div>
    );
};
