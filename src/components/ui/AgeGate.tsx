import React from 'react';
import { Shield } from 'lucide-react';

interface AgeGateProps {
    onAccept: () => void;
}

export const AgeGate: React.FC<AgeGateProps> = ({ onAccept }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-12">
                <Shield className="w-16 h-16 text-primary mb-4 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]" />

                <h1 className="text-6xl font-black text-white uppercase tracking-tighter font-league drop-shadow-2xl mb-1">
                    OLYBARS
                </h1>

                <div className="bg-primary px-3 py-1 -rotate-1 shadow-lg border border-black/10">
                    <span className="text-xs font-black text-black uppercase tracking-[0.2em] font-league italic">
                        The Nightlife OS
                    </span>
                </div>
            </div>

            {/* Modal/Box Section */}
            <div className="bg-surface/60 backdrop-blur-md border border-white/10 p-8 rounded-xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
                {/* Decorative shadow inside the box like the image */}
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white mb-4 font-league tracking-wide">
                        21+ ADULTS ONLY
                    </h2>

                    <p className="text-slate-400 text-sm font-body mb-8 leading-relaxed">
                        By continuing, you agree to our <a href="/terms" className="text-primary hover:underline">Terms of Use</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                    </p>

                    <button
                        onClick={onAccept}
                        className="w-full bg-primary hover:bg-yellow-400 text-black font-black text-xl py-4 rounded-lg shadow-[0_4px_0_0_rgba(0,0,0,1)] border-2 border-black active:translate-y-1 active:shadow-none transition-all font-league tracking-widest uppercase"
                    >
                        I AM 21+ & AGREE
                    </button>
                </div>
            </div>

            {/* Bottom Tagline/Shadow (as seen in image) */}
            <div className="mt-8 opacity-20">
                <div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>
        </div>
    );
};
