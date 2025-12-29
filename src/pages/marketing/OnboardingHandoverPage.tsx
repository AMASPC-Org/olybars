import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { Lock, Zap, ShieldCheck, Check, AppWindow, X } from 'lucide-react';

export const OnboardingHandoverPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0A1E2D] font-sans text-cream-50 selection:bg-gold-500 selection:text-black">
            <SEO title="Claim Your Venue - Rapid Handover" description="The 60-second venue handover. No new passwords, just instant access." />

            {/* Vintage/Texture Overlay */}
            <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">

                {/* HEAD SECTION */}
                <header className="text-center mb-16 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-black uppercase tracking-widest mb-4">
                        <Zap className="w-3 h-3" />
                        <span>The 60-Second Handover</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase font-league leading-none tracking-tight">
                        We built your profile for you.<br />
                        <span className="text-gold-400">You just need to unlock it.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
                        Stop typing. We know you run a venue, not a data entry department.
                        Most apps ask you to be an architect. OlyBars is different.
                        Artie has already done the heavy lifting.
                    </p>
                </header>

                {/* THE PROCESS: 3 CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {/* Card 1 */}
                    <div className="bg-[#132338] border border-white/5 rounded-2xl p-8 hover:border-gold-500/30 transition-all group">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Lock className="w-6 h-6 text-gold-400" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase font-league mb-3 tracking-wide">
                            No New Passwords
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Don't create another username to forget. Use the secure Google account you already have on your phone. One tap verification.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#132338] border border-white/5 rounded-2xl p-8 hover:border-gold-500/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Zap className="w-24 h-24 rotate-12" />
                        </div>
                        <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                            <Zap className="w-6 h-6 text-gold-400" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase font-league mb-3 tracking-wide relative z-10">
                            The "Magic" Import
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed relative z-10">
                            Artie has already pulled your address, logo, hours, and photos directly from Google Maps. 90% of the work is done before you login.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#132338] border border-white/5 rounded-2xl p-8 hover:border-gold-500/30 transition-all group">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-6 h-6 text-gold-400" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase font-league mb-3 tracking-wide">
                            The Vibe Check
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Just look at the screen. Hours correct? Check. Description cool? Check. Hit "Go Live." You are instantly inducted.
                        </p>
                    </div>
                </div>

                {/* COMPARISON SECTION */}
                <div className="bg-[#0f1729] rounded-3xl border border-white/5 p-8 md:p-12 mb-20 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                        {/* LEFT: THE HARD WAY */}
                        <div className="space-y-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-red-500 font-bold text-lg"><X className="w-6 h-6" /></span>
                                <h3 className="text-xl font-black uppercase font-league tracking-widest text-slate-400">The Hard Way</h3>
                            </div>

                            <ul className="space-y-4 font-medium text-slate-500">
                                <li className="flex items-center gap-3">
                                    <X className="w-5 h-5 text-red-900/50" /> Typing Street Addresses
                                </li>
                                <li className="flex items-center gap-3">
                                    <X className="w-5 h-5 text-red-900/50" /> Uploading Logo Files
                                </li>
                                <li className="flex items-center gap-3">
                                    <X className="w-5 h-5 text-red-900/50" /> Creating New Passwords
                                </li>
                                <li className="flex items-center gap-3">
                                    <X className="w-5 h-5 text-red-900/50" /> Waiting for Approval
                                </li>
                            </ul>

                            <div className="pt-4 border-t border-white/5 mt-4">
                                <p className="text-lg font-bold text-slate-600">Time: 30 Minutes</p>
                            </div>
                        </div>

                        {/* RIGHT: THE OLYBARS WAY */}
                        <div className="bg-[#1a2c3d] rounded-2xl p-8 border border-gold-500/20 shadow-2xl shadow-black/50 relative transform md:scale-105">
                            <div className="absolute -top-3 -right-3 bg-gold-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                                Recommended
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <span className="p-1 rounded-full bg-green-500/20 text-green-400"><Check className="w-5 h-5" /></span>
                                <h3 className="text-xl font-black uppercase font-league tracking-widest text-white">The OlyBars Way</h3>
                            </div>

                            <ul className="space-y-4 font-medium text-slate-200">
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-gold-500" /> One-Tap Google Login
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-gold-500" /> Auto-Synced Data
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-gold-500" /> Instant Verification
                                </li>
                            </ul>

                            <div className="pt-4 border-t border-white/10 mt-6 md:mt-8">
                                <p className="text-2xl font-black text-gold-400 font-league tracking-wide">Time: 60 Seconds</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* CLOSING / CTA */}
                <div className="text-center space-y-12 relative py-12">
                    {/* High-Intensity Spotlight */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />

                    <div className="relative z-10 space-y-8">
                        <p className="text-2xl md:text-4xl font-league font-bold text-white italic opacity-90 tracking-tight">
                            &quot;Easier than pouring a pint.&quot;
                        </p>

                        <div className="flex flex-col items-center gap-6">
                            <button
                                onClick={() => navigate('/partners/claim')}
                                className="group relative inline-flex items-center justify-center px-14 py-6 bg-[#fbbf24] text-black font-black uppercase text-xl tracking-[0.15em] rounded-2xl transition-all hover:scale-110 shadow-[0_0_50px_-10px_rgba(251,191,36,0.8)] hover:shadow-[0_0_80px_0px_rgba(251,191,36,1)] border-b-4 border-yellow-700 active:translate-y-1 active:border-b-0 font-league italic"
                            >
                                <Zap className="w-6 h-6 mr-3 fill-black animate-bounce" />
                                Claim Your Venue Now
                                <AppWindow className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                            </button>

                            <p className="text-[10px] text-gold-400 uppercase tracking-[0.4em] font-black opacity-80 animate-pulse">
                                Zero cost to claim • Instant setup • 98501 Official
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingHandoverPage;
