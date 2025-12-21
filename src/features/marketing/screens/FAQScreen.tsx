import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import kb from '../../../../server/src/knowledgeBase.json';

const FAQScreen: React.FC = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-background text-white p-6 pb-24 font-body">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition-opacity uppercase font-black tracking-widest text-xs"
            >
                <ChevronLeft className="w-4 h-4" />
                Back
            </button>

            <div className="max-w-2xl mx-auto space-y-8">
                <header className="flex items-center gap-4 mb-12">
                    <div className="bg-primary/20 p-3 rounded-xl">
                        <HelpCircle className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter font-league">COMMON <span className="text-primary">QUESTIONS</span></h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Everything you need to know about OlyBars</p>
                    </div>
                </header>

                <div className="space-y-4">
                    {kb.faq.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-surface border border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                            >
                                <span className="text-sm font-black uppercase tracking-tight font-league">{item.question}</span>
                                {openIndex === idx ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                            </button>

                            {openIndex === idx && (
                                <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-sm text-slate-400 leading-relaxed font-body">
                                        {item.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-primary/10 border-2 border-primary/20 p-6 rounded-3xl text-center">
                    <MessageCircle className="w-10 h-10 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-black uppercase tracking-tight font-league mb-2">Still Thirsty for Answers?</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-6">Artie is our 24/7 AI Concierge.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-primary text-black font-black px-8 py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        Ask Artie Now
                    </button>
                </div>

                <footer className="pt-12 text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                        Powered by Well 80 Artesian Water
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default FAQScreen;
