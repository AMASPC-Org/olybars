import React, { useState, useEffect, useMemo } from 'react';
import {
    ShieldCheck, Users, Trophy, ChevronRight, Mail, ExternalLink,
    Star, Loader2, Gamepad2, MapPin, Award, Zap, Clock,
    Sparkles, Anchor, Map, Info, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Venue } from '../types';
import { fetchVenues } from '../services/venueService';
import { isVenueOpen } from '../utils/venueUtils';

// Assets
import heroArena from '../assets/hero-arena.png';
import leagueBadge from '../assets/league-badge.png';
import artieCoachBg from '../assets/artie-coach-bg.png';
import venuePartnerBg from '../assets/venue-partner-bg.png';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AboutPage = () => {
    const navigate = useNavigate();
    const [showContact, setShowContact] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [hpValue, setHpValue] = useState(''); // Honeypot
    const [loading, setLoading] = useState(false);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [fetchingVenues, setFetchingVenues] = useState(true);

    useEffect(() => {
        const loadVenues = async () => {
            try {
                const data = await fetchVenues();
                setVenues(data);
            } catch (err) {
                console.error("Failed to load venues for handbook", err);
            } finally {
                setFetchingVenues(false);
            }
        };
        loadVenues();
    }, []);

    const buzzingVenues = useMemo(() =>
        venues.filter(v => v.status === 'buzzing' && v.isVisible !== false).slice(0, 2),
        [venues]);

    const activeHappyHours = useMemo(() =>
        venues.filter(v => (v.deal || (v.deals && v.deals.length > 0)) && isVenueOpen(v)).slice(0, 3),
        [venues]);

    const handleSend = async () => {
        if (!email || !message) {
            alert("Please fill in both fields");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'CONTACT',
                    contactEmail: email,
                    payload: { message },
                    _hp_id: hpValue // [SECURITY] Honeypot
                })
            });
            if (response.ok) {
                alert("Message Sent! Artie will get back to you soon.");
                setShowContact(false);
                setEmail('');
                setMessage('');
            } else {
                alert("Error sending message.");
            }
        } catch (e) {
            console.error(e);
            alert("Network error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-background text-white p-6 pb-24 font-body animate-in fade-in duration-500">
            {/* Contact Modal */}
            {showContact && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setShowContact(false)}>
                    <div className="bg-surface border-2 border-primary/20 p-8 rounded-3xl shadow-2xl max-w-sm w-full relative group" onClick={e => e.stopPropagation()}>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />

                        <h2 className="text-2xl font-black text-primary uppercase tracking-tight mb-6 font-league italic">Drop a Line</h2>

                        <div className="space-y-4 relative z-10">
                            <p className="text-sm text-slate-300 font-medium leading-relaxed mb-2">
                                Artie is usually at the tap or checking the lines, but he'll get back to you within 24 hours.
                            </p>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500">Your Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="ryan@amaspc.com"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-primary/50"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500">Message</label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="What's on your mind?"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-primary/50 min-h-[100px]"
                                />
                            </div>

                            {/* Honeypot Field (Invisible to humans) */}
                            <div style={{ display: 'none' }} aria-hidden="true">
                                <input
                                    type="text"
                                    name="_hp_id"
                                    value={hpValue}
                                    onChange={(e) => setHpValue(e.target.value)}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={loading}
                                className="block w-full bg-primary text-black font-black uppercase text-center py-4 rounded-xl text-sm tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50 flex justify-center gap-2 font-league"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'SENDING...' : 'SEND MESSAGE'}
                            </button>

                            <button
                                onClick={() => setShowContact(false)}
                                className="w-full text-slate-500 font-black uppercase text-[10px] tracking-widest mt-2 hover:text-white transition-colors"
                            >
                                NEVERMIND
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Nav Back */}
            <div className="relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-primary/80 hover:text-primary transition-all uppercase font-black tracking-widest text-[10px]"
                >
                    <span className="text-xl">←</span>
                    <span>EXIT THE FIELD</span>
                </button>
            </div>

            {/* HERO SECTION */}
            <header className="relative mb-12 -mx-6 -mt-6">
                <div className="relative h-[35vh] md:h-[45vh] overflow-hidden">
                    <img
                        src={heroArena}
                        alt="The Arena - Downtown Olympia"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                    <div className="absolute bottom-6 left-6 right-6">
                        <button onClick={() => navigate('/glossary')} className="inline-block bg-primary text-black px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] mb-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <Trophy size={12} /> PLAYER'S HANDBOOK
                        </button>
                        <h1 className="text-5xl font-black uppercase tracking-tighter font-league leading-[0.9]">
                            NIGHTLIFE IS A <span className="text-white block">TEAM SPORT.</span>
                        </h1>
                        <p className="text-sm text-primary font-bold uppercase tracking-widest mt-2 drop-shadow-lg flex items-center gap-2">
                            <Sparkles size={14} /> Join the League. Explore the City. Win the Night.
                        </p>
                    </div>
                </div>
            </header>

            <div className="space-y-16 max-w-2xl mx-auto">
                {/* Artie's Field Report - Dynamic Betterment */}
                <section className="relative">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-[2px] w-8 bg-primary/30" />
                        <h2 className="text-primary font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2">
                            <Activity size={12} /> ARTIE'S FIELD REPORT
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Buzzing Right Now */}
                        <div className="bg-surface/60 backdrop-blur-md border-2 border-primary/20 p-5 rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap size={48} className="text-primary fill-primary" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 font-league italic">🔥 Buzzing Right Now</h3>
                            {fetchingVenues ? (
                                <div className="flex items-center gap-2 text-slate-500 animate-pulse">
                                    <Loader2 size={12} className="animate-spin" />
                                    <span className="text-[10px] uppercase font-black">Scanning the field...</span>
                                </div>
                            ) : buzzingVenues.length > 0 ? (
                                <div className="space-y-3">
                                    {buzzingVenues.map(v => (
                                        <div key={v.id} className="flex justify-between items-center group/item cursor-pointer" onClick={() => navigate(`/venues/${v.id}`)}>
                                            <span className="text-sm font-bold text-white font-league uppercase group-hover/item:text-primary transition-colors">{v.name}</span>
                                            <div className="flex items-center gap-1.5 bg-primary/20 px-2 py-0.5 rounded text-[8px] font-black text-primary border border-primary/30">
                                                <Users size={8} /> {v.currentBuzz?.score.toFixed(0)} PTS
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] text-slate-500 font-bold uppercase italic">Olympia is keeping it chill today.</p>
                            )}
                        </div>

                        {/* Scouts Pick: Happy Hours */}
                        <div className="bg-surface/60 backdrop-blur-md border-2 border-white/5 p-5 rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock size={48} className="text-white" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 font-league italic">🍺 Scout's Pick: Active Deals</h3>
                            {fetchingVenues ? (
                                <div className="flex items-center gap-2 text-slate-500 animate-pulse">
                                    <Loader2 size={12} className="animate-spin" />
                                    <span className="text-[10px] uppercase font-black">Checking the board...</span>
                                </div>
                            ) : activeHappyHours.length > 0 ? (
                                <div className="space-y-3">
                                    {activeHappyHours.map(v => (
                                        <div key={v.id} className="flex flex-col group/item cursor-pointer" onClick={() => navigate(`/venues/${v.id}`)}>
                                            <span className="text-sm font-bold text-white font-league uppercase group-hover/item:text-primary transition-colors">{v.name}</span>
                                            <span className="text-[9px] text-slate-500 font-bold uppercase truncate">{v.deal || "Flash Deal Active"}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] text-slate-500 font-bold uppercase italic">No active scouts in the field right now.</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* The League Mission Section */}
                <section className="relative">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-[2px] w-8 bg-primary/30" />
                        <h2 className="text-primary font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2">
                            <Anchor size={12} /> THE LEAGUE MISSION
                        </h2>
                    </div>
                    <div className="bg-surface/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />

                        <h3 className="text-white font-black text-2xl uppercase tracking-tight mb-4 font-league italic">REVITALIZING DOWNTOWN OLYMPIA</h3>

                        <div className="space-y-4 text-slate-300 leading-relaxed text-sm font-body">
                            <p>
                                We all know the struggle: it’s 7:00 PM, you want to go out, but you don't know where the energy is. So you stay home.
                            </p>
                            <p className="font-bold text-white italic bg-primary/10 border-l-2 border-primary px-3 py-2">
                                OlyBars is here to break that cycle.
                            </p>
                            <p>
                                We are a hyper-local community platform dedicated to one thing: getting you off the couch and into the best spots in Olympia. This handbook is your guide to the 98501.
                            </p>
                            <p>
                                We believe that when our bars, venues, and makers thrive, the whole city comes alive. Whether it's a slow Tuesday or a packed Friday, the League is here to find the vibe.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How The League Works */}
                <section className="space-y-8">
                    <div className="flex items-center gap-2">
                        <div className="h-[2px] w-8 bg-primary/30" />
                        <h2 className="text-primary font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2">
                            <Zap size={12} /> HOW TO PLAY
                        </h2>
                    </div>

                    <div className="relative bg-slate-900 border-2 border-primary/20 p-8 rounded-[3rem] overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-48 h-48 -mr-12 -mt-12 opacity-20 group-hover:opacity-40 transition-opacity">
                            <img src={leagueBadge} alt="" className="w-full h-full object-contain rotate-12" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-start gap-6">
                                <div className="bg-primary text-black w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 shadow-xl font-league italic italic text-xl">1</div>
                                <div>
                                    <h4 className="text-white font-black text-xl uppercase font-league mb-2 flex items-center gap-2 italic">Check In <ChevronRight size={18} className="text-primary" /></h4>
                                    <p className="text-sm text-slate-400 font-body leading-relaxed">
                                        Don't just go out—put it on the board. When you arrive at a partner venue, check in to confirm your presence at the physical location.
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <div className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-inner">
                                            <MapPin size={14} className="text-primary" />
                                            <span className="text-[10px] font-black uppercase text-slate-300">GPS VERIFIED</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-6">
                                <div className="bg-primary text-black w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 shadow-xl font-league italic text-xl">2</div>
                                <div>
                                    <h4 className="text-white font-black text-xl uppercase font-league mb-2 flex items-center gap-2 italic">Report the Vibe <ChevronRight size={18} className="text-primary" /></h4>
                                    <p className="text-sm text-slate-400 font-body leading-relaxed">
                                        Tell the League what the energy is (Chill? Buzzing? Loud?). Your qualitative input feeds the real-time "Pulse" that helps everyone else decide where to go.
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <div className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-inner">
                                            <Activity size={14} className="text-primary" />
                                            <span className="text-[10px] font-black uppercase text-slate-300">REAL-TIME INTEL</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-6">
                                <div className="bg-primary text-black w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 shadow-xl font-league italic text-xl">3</div>
                                <div>
                                    <h4 className="text-white font-black text-xl uppercase font-league mb-2 flex items-center gap-2 italic">Earn League Points <ChevronRight size={18} className="text-primary" /></h4>
                                    <p className="text-sm text-slate-400 font-body leading-relaxed">
                                        Your participation is the product. Points prove you "Wear the 98501." Level up to unlock exclusive merch and "Mayor" status at your favorite local haunts.
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <div className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-inner">
                                            <Award size={14} className="text-primary" />
                                            <span className="text-[10px] font-black uppercase text-slate-300">MERCH UNLOCKS</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Meet Artie */}
                <section className="relative">
                    <div className="bg-black/60 rounded-[3rem] overflow-hidden border border-white/10 relative min-h-[400px] flex flex-col justify-end p-8 group">
                        <img
                            src={artieCoachBg}
                            alt="Artie's Office"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                        <div className="relative z-10">
                            <h2 className="text-primary font-black text-2xl uppercase tracking-tight mb-4 font-league flex items-center gap-3 italic">
                                <Gamepad2 className="w-6 h-6" /> THE COACH: ARTIE WELLS
                            </h2>
                            <div className="space-y-4 text-slate-300 leading-relaxed text-sm font-body mb-6">
                                <p>
                                    To navigate the 98501, you need a guide. Meet Artie Wells. Inspired by the "Spirit of the Artesian Well" and our deep brewing history, Artie is your AI-powered companion.
                                </p>
                                <p>
                                    Need a plan? Artie knows every happy hour and live set. Whether you're looking for pool at Hannah's or the latest craft tap at Well 80, Artie has the scout report.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/meet-artie')}
                                className="w-full bg-surface text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl border border-white/10 flex items-center justify-center gap-3 hover:border-primary/50 transition-all shadow-xl font-league italic"
                            >
                                LEARN MORE ABOUT ARTIE <ChevronRight size={18} className="text-primary" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Marketing Co-Op */}
                <section className="relative">
                    <div className="bg-primary/5 border border-primary/20 rounded-[3rem] overflow-hidden relative p-8">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <img src={venuePartnerBg} alt="" className="w-full h-full object-cover grayscale" />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-white font-black text-2xl uppercase tracking-tight mb-4 font-league italic">MARKETING CO-OP FOR VENUES</h2>
                            <p className="text-sm text-slate-400 font-body leading-relaxed mb-6">
                                For business owners, the League is your fractional marketing team. We package Downtown Olympia as a destination. By gamifying attendance, we drive "butts in seats" on slow Tuesdays and pack the house for your Friday shows.
                            </p>
                            <div className="flex flex-col gap-3">
                                <div className="text-[10px] font-black uppercase text-primary tracking-widest text-center mb-1 font-league italic">NO FRICTION. NO LOGIN FATIGUE. JUST RESULTS.</div>
                                <button
                                    onClick={() => {
                                        navigate('/bars');
                                    }}
                                    className="bg-primary text-black font-black uppercase text-xs tracking-[0.2em] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all font-league italic"
                                >
                                    JOIN THE LEAGUE
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA SECTION */}
                <section className="pt-8 border-t border-white/5 space-y-6">
                    <div className="text-center">
                        <h2 className="font-league text-3xl font-black uppercase italic tracking-tighter mb-2 italic">START YOUR SEASON</h2>
                        <button
                            onClick={() => {
                                navigate('/league');
                            }}
                            className="bg-white text-black font-black uppercase text-sm tracking-widest py-4 px-8 rounded-full hover:scale-105 transition-transform flex items-center gap-3 mx-auto shadow-2xl font-league italic"
                        >
                            ASK ARTIE &quot;WHERE TO GO?&quot; <Star className="w-5 h-5 fill-primary text-primary" />
                        </button>
                    </div>

                    <div className="flex justify-center gap-8 pt-6">
                        <button
                            onClick={() => setShowContact(true)}
                            className="text-slate-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:text-white transition-colors font-league"
                        >
                            <Mail size={14} /> CONTACT THE OPS TEAM
                        </button>
                    </div>
                </section>

                {/* Footer Attribution */}
                <footer className="pt-12 pb-8 text-center">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] font-league">
                        EST. 98501 • OLYMPIA, WA
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default AboutPage;
