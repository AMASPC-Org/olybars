import React from 'react';
import { Layers, MapPin, Calendar, Trophy, Terminal } from 'lucide-react';

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
                                    <h3 className="text-xl font-bold font-league text-white uppercase">Tier 2: Events</h3>
                                    <p className="text-slate-300 text-sm">
                                        Temporal activities taking place at a Venue. Includes Happy Hours,
                                        Guest Taps, and Live Gigs.
                                    </p>
                                    <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-amber-500/80 border border-white/5">
                                        {`"event": { "title": "Guest Tap Night", "venueId": "well-80", "start": "2025-12-25T19:00:00Z" }`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tier 3: League Play */}
                        <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-6 ml-8 md:ml-24 border-l-2 border-l-amber-500">
                            <div className="flex items-start gap-4">
                                <Trophy className="w-8 h-8 text-amber-500 mt-1" />
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold font-league text-white uppercase">Tier 3: League Play</h3>
                                    <p className="text-slate-300 text-sm italic">
                                        "All League Play activities are events, but not all events are league play."
                                    </p>
                                    <p className="text-slate-400 text-xs">
                                        These are formal events that contribute to user rankings and global standings.
                                    </p>
                                    <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-amber-500 border border-amber-500/20">
                                        {`"leaguePlay": { "type": "Trivia", "venueId": "well-80", "isLeagueSanctioned": true }`}
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
