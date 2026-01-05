import React from 'react';
import { Layers, MapPin, Calendar, Trophy, Terminal, Zap } from 'lucide-react';

export default function AIFeedGuideScreen() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 pb-20 pt-16 px-6">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-league text-white">
                        AI <span className="text-amber-500">Feed Guide</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-body">
                        The structured protocol for ingesting Olympia's Nightlife Hierarchy.
                    </p>
                </div>

                {/* The Hierarchy Section */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-league uppercase text-amber-500 border-b border-amber-500/20 pb-2 flex items-center gap-3">
                        <Layers className="w-6 h-6" /> The OlyBars Hierarchy
                    </h2>

                    <div className="grid gap-6">
                        {/* Tier 1: Venues */}
                        <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-8 h-8 text-blue-400 mt-1" />
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold font-league text-white uppercase">Tier 1: Venues</h3>
                                    <p className="text-slate-300 text-sm">
                                        The primary entity. Use this to identify physical locations.
                                        Every Venue has a slug-based ID (e.g., `well-80`).
                                    </p>
                                    <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-amber-500/80 border border-white/5">
                                        {`"venue": { "id": "well-80", "name": "Well 80 Brewhouse", "status": "Popping" }`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tier 2: Events */}
                        <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-6 ml-4 md:ml-12 border-l-2 border-l-amber-500/30">
                            <div className="flex items-start gap-4">
                                <Calendar className="w-8 h-8 text-green-400 mt-1" />
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold font-league text-white uppercase">Tier 2: The Trinity of Offers</h3>
                                    <p className="text-slate-300 text-sm">
                                        Artie identifies three distinct pillars of timing and intent:
                                    </p>
                                    <ul className="text-xs text-slate-400 space-y-2 list-disc ml-4">
                                        <li><span className="text-white font-bold">Happy Hours</span>: Time-bound windows for multi-item deals (e.g. 4-6pm).</li>
                                        <li><span className="text-white font-bold">Venue Specials</span>: Recurring themed days or item-focused deals (e.g. Taco Tuesday).</li>
                                        <li><span className="text-white font-bold">Non-League Events</span>: Activities like Live Gigs or Open Mics that don't award points.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Tier 3: League Play */}
                        <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-6 ml-8 md:ml-24 border-l-2 border-l-amber-500">
                            <div className="flex items-start gap-4">
                                <Trophy className="w-8 h-8 text-amber-500 mt-1" />
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold font-league text-white uppercase">Tier 3: League Sanctioned</h3>
                                    <p className="text-slate-300 text-sm italic">
                                        "All League Play activities are events, but they award +25 Bonus Points."
                                    </p>
                                    <p className="text-slate-400 text-xs">
                                        Includes Trivia, Karaoke, and official tournaments that contribute to global standings.
                                    </p>
                                    <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-amber-500 border border-amber-500/20">
                                        {`"leagueEvent": { "type": "Trivia", "venueId": "well-80", "isLeagueSanctioned": true, "points": 25 }`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tier 4: Flash Bounties */}
                        <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-6 ml-12 md:ml-36 border-l-2 border-l-red-500">
                            <div className="flex items-start gap-4">
                                <Zap className="w-8 h-8 text-red-500 mt-1" />
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold font-league text-white uppercase">Tier 4: Flash Bounties</h3>
                                    <p className="text-slate-300 text-sm">
                                        One-off, high-urgency triggers powered by the social engine.
                                    </p>
                                    <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-red-500/80 border border-red-500/20">
                                        {`"flashBounty": { "id": "burger-rush", "title": "$5 Burgers", "expires": "60m" }`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schema JSON-LD Help */}
                <div className="bg-slate-800 p-8 rounded-3xl border border-white/10 space-y-4">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-6 h-6 text-slate-400" />
                        <h2 className="text-xl font-league uppercase text-white">Schema.org Ingestion</h2>
                    </div>
                    <p className="text-slate-400 text-sm">
                        For deep ingestion, crawl individual Venue pages and look for the `LDSchema` block.
                        We use a combination of `LocalBusiness`, `Bar`, and `Event` types.
                    </p>
                </div>

            </div>
        </div>
    );
}
