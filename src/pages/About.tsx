import React from 'react';
import { ShieldCheck, Users, Trophy, ChevronRight, Mail, ExternalLink, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
    const navigate = useNavigate();
    const [showContact, setShowContact] = React.useState(false);

    return (
        <div className="min-h-full bg-background text-white p-6 pb-24 font-body animate-in fade-in duration-500">
            {/* Contact Modal */}
            {showContact && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setShowContact(false)}>
                    <div className="bg-surface border-2 border-primary/20 p-8 rounded-3xl shadow-2xl max-w-sm w-full relative group" onClick={e => e.stopPropagation()}>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />

                        <h2 className="text-2xl font-black text-primary uppercase tracking-tight mb-6 font-league">Drop a Line</h2>

                        <div className="space-y-6 relative z-10">
                            <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                Artie is usually at the tap or checking the lines, but he'll get back to you within 24 hours.
                            </p>

                            <a
                                href="mailto:hello@olybars.com"
                                className="block w-full bg-primary text-black font-black uppercase text-center py-4 rounded-xl text-sm tracking-widest hover:scale-[1.02] transition-transform"
                            >
                                EMAIL ARTIE DIRECTLY
                            </a>

                            <button
                                onClick={() => setShowContact(false)}
                                className="w-full text-slate-500 font-black uppercase text-[10px] tracking-widest mt-4 hover:text-white transition-colors"
                            >
                                NEVERMIND
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Nav Back */}
            <button
                onClick={() => navigate(-1)}
                className="mb-8 flex items-center gap-2 text-primary hover:opacity-80 transition-opacity uppercase font-black tracking-widest text-[10px]"
            >
                <span className="text-xl">←</span>
                <span>BACK</span>
            </button>

            <header className="mb-12">
                <h1 className="text-4xl font-black uppercase tracking-tighter font-league mb-2">
                    THE ARTESIAN <span className="text-primary">MANUAL</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">The 98501 Nightlife Operating System</p>
            </header>

            <div className="space-y-12">
                {/* The Mission Section */}
                <section className="bg-surface/50 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group font-league">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />

                    <h2 className="text-primary font-black text-2xl uppercase tracking-tight mb-6 flex items-center gap-3">
                        <Star className="w-6 h-6" /> OUR MISSION
                    </h2>

                    <div className="space-y-4 text-slate-300 leading-relaxed text-sm font-sans">
                        <p>
                            OlyBars.com isn't just a directory; it's the heartbeat of Olympia. We believe that the real city isn't found in the capitol buildings, but in the taprooms, the dive bars, and the local music venues where the community actually lives.
                        </p>
                        <p>
                            Our goal is to keep the "Artesian Vibe" alive by providing real-time data on the city's nightlife—powered by the people who are actually out there making it happen.
                        </p>
                    </div>
                </section>

                {/* Olympia Bar League Section */}
                <section className="space-y-4 font-league">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-white font-black text-xl uppercase tracking-tight">The Olympia Bar League</h2>
                        <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest">Est. 2025</span>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
                        <div className="space-y-3">
                            <h3 className="text-white font-black text-lg uppercase leading-tight">It's About Participation</h3>
                            <p className="text-sm text-slate-400 font-medium font-sans">
                                The OBL is a gamified layer on top of your night out. Points aren't just for checking in—they're for **participation**. Your check-ins, vibe checks, and photos are what fuel the Oly Pulse.
                            </p>
                            <div className="grid grid-cols-3 gap-2 py-2 font-sans">
                                <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                    <span className="block text-primary font-black text-lg">10</span>
                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Check-In</span>
                                </div>
                                <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                    <span className="block text-primary font-black text-lg">5</span>
                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Vibe Check</span>
                                </div>
                                <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                    <span className="block text-primary font-black text-lg">15</span>
                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Photo/Vision</span>
                                </div>
                                <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                    <span className="block text-primary font-black text-lg">10</span>
                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Social Share</span>
                                </div>
                                <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center col-span-3">
                                    <span className="block text-primary font-black text-lg">25</span>
                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Participate (Karaoke/Trivia)</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium italic font-sans">
                                Points reset quarterly. Only the most active "Regulars" reach Local Legend status.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/league')}
                                className="flex-1 bg-primary text-black font-black uppercase text-xs tracking-widest py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                            >
                                <Trophy size={16} /> LEAGUE HQ
                            </button>
                            <button
                                onClick={() => navigate('/faq')}
                                className="flex-1 bg-slate-800 text-white font-black uppercase text-xs tracking-widest py-3 px-4 rounded-xl border border-white/10 flex items-center justify-center gap-2 hover:bg-slate-700 transition-all font-league"
                            >
                                <ShieldCheck size={16} /> PLAYBOOK
                            </button>
                        </div>
                    </div>
                </section>

                {/* Meet Artie Section */}
                <section className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group font-league">
                    <h2 className="text-primary font-black text-2xl uppercase tracking-tight mb-6 flex items-center gap-3">
                        <Users className="w-6 h-6" /> THE ARCHITECT
                    </h2>
                    <div className="space-y-4 text-slate-300 leading-relaxed text-sm font-sans mb-8">
                        <p>
                            Artie Wells is a "98501 Original" who spent years in the local service industry before building the system we use today. He's the guardian of the vibe and your 24/7 concierge.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/meet-artie')}
                        className="w-full bg-slate-800 text-white font-black uppercase text-xs tracking-widest py-4 rounded-xl border border-white/10 flex items-center justify-center gap-3 hover:border-primary/50 transition-all shadow-xl"
                    >
                        LEARN MORE ABOUT ARTIE <ChevronRight size={18} className="text-primary" />
                    </button>
                </section>

                {/* Helpful Links Grid */}
                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={() => setShowContact(true)}
                        className="bg-surface/30 border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all font-league"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-2.5 rounded-xl">
                                <Mail className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <span className="block text-white font-black text-sm uppercase tracking-tight">Contact Artie</span>
                                <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-widest">Support & Inquiries</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-primary transition-colors" />
                    </button>
                </div>

                {/* Footer Attribution */}
                <footer className="pt-12 border-t border-white/5 text-center">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                        EST. 98501 • OLYMPIA, WA
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default AboutPage;
