import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen } from 'lucide-react';
import { PulseExplainer } from '../../venues/components/PulseExplainer';

export const PulsePlaybookScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-white p-6 pb-24 font-body">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition-opacity uppercase font-black tracking-widest text-xs"
            >
                <ChevronLeft className="w-4 h-4" />
                Back
            </button>

            <div className="max-w-xl mx-auto space-y-12">
                <header className="flex items-center gap-4">
                    <div className="bg-primary/20 p-3 rounded-xl">
                        <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter font-league text-white leading-none">THE PULSE <span className="text-primary block">PLAYBOOK</span></h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">
                            The math behind the vibe • <button onClick={() => navigate('/glossary')} className="text-primary hover:underline">Definitions</button>
                        </p>
                    </div>
                </header>

                {/* The Dynamic Component */}
                <PulseExplainer />

                <footer className="pt-12 text-center border-t border-white/5 mx-4">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
                        Version 2025.12.24<br />
                        Algorithm Governed by AMA Network Integrity
                    </p>
                </footer>
            </div>
        </div>
    );
};
