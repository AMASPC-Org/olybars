import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Beer, Trophy, AlertTriangle, Save, Plane, Sparkles, ChevronRight } from 'lucide-react';
import { SEO } from '../../../components/common/SEO';

export const FlightSchoolScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <SEO
                title="Flight School | OlyBars"
                description="Learn how to build the perfect beer flight with OlyBars' Flight Builder."
            />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-black uppercase tracking-widest font-league">Flight School</h1>
            </div>

            <div className="p-6 space-y-12">
                {/* Hero */}
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
                        <Plane className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black uppercase font-league tracking-tighter leading-none">
                        Master Your<br />
                        <span className="text-primary">Tasting Experience</span>
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                        The OlyBars Flight Builder helps you curate, calculate, and track your perfect tasting journey.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-8">
                    {/* Step 1 */}
                    <div className="relative pl-8 border-l-2 border-slate-800">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-black flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Beer className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-black uppercase font-league tracking-wide">1. Build Your Tray</h3>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                When viewing a venue's <span className="text-white font-bold">Live Menu</span>, tap the <span className="inline-block p-1 bg-slate-800 rounded border border-slate-700"><Beer size={10} /></span> icon next to any draft item to add it to your flight dock.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative pl-8 border-l-2 border-slate-800">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-black flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-black uppercase font-league tracking-wide">2. Check the Stats</h3>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Open your Flight Dock to see the <strong>Average ABV</strong> and estimated cost. We'll warn you if your flight is getting too heavy.
                            </p>
                            <div className="mt-3 bg-red-900/20 border border-red-500/30 p-3 rounded-lg flex items-center gap-3">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-[10px] font-bold text-red-300 uppercase">High Gravity Warnings (&gt;8% ABV)</span>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative pl-8 border-l-2 border-slate-800">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-black flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Save className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-black uppercase font-league tracking-wide">3. Save & Track</h3>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Logged-in members can save flights to their profile to remember what they tasted (and what they liked).
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 p-6 rounded-3xl text-center space-y-4">
                    <Sparkles className="w-8 h-8 text-primary mx-auto animate-pulse" />
                    <h3 className="text-xl font-black uppercase font-league text-white">Ready for Takeoff?</h3>
                    <p className="text-xs text-slate-300 mb-4">
                        Visit a participating taproom and start building.
                    </p>
                    <button
                        onClick={() => navigate('/map')}
                        className="w-full bg-primary text-black font-black py-4 rounded-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        Find a Venue <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
