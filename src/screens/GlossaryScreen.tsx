import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Search, Zap } from 'lucide-react';
import { SEO } from '../components/common/SEO';

const glossaryTerms = [
    {
        category: 'The Game',
        terms: [
            { term: 'Bar League', def: 'The overarching season-based competition where users compete for points by visiting venues.' },
            { term: 'Buzz', def: 'The real-time energy level of a venue (Chill, Lively, or Buzzing).' },
            { term: 'Check-In', def: 'The primary scoring action. Users verify their location at an Anchor Venue. Limited to 2 per 12-hour window.' },
            { term: 'Vibe Check', def: 'A user-submitted report confirming or updating a venue\'s current Buzz. Pays a small point bonus.' },
            { term: 'Streak', def: 'Consecutive days/weeks of active participation.' },
            { term: 'Badge', def: 'A digital trophy earned by completing specific sets of visits (e.g., "Dive Bar Hero").' },
        ]
    },
    {
        category: 'Roles & People',
        terms: [
            { term: 'Player / Guest', def: 'A standard user participating in the league.' },
            { term: 'Venue Owner', def: 'A verified business owner with access to the Owner Dashboard.' },
            { term: 'Staff', def: 'Venue employees who can update the Vibe and active specials but cannot change business details.' },
            { term: 'Maker', def: 'A local artisan or producer (Brewer, Distiller) featured in the Maker\'s Trail.' },
        ]
    },
    {
        category: 'Features',
        terms: [
            { term: 'Flash Deal', def: 'A time-limited special offer created by a Venue Owner to drive immediate traffic.' },
            { term: 'Maker\'s Trail', def: 'A discovery feature guiding users to venues that serve local products.' },
            { term: 'Amenity', def: 'A physical feature of a venue (Pool Table, Dart Board, Arcade Cabinet).' },
            { term: 'Safe Ride', def: 'Partnerships with Red Cab and Uber/Lyft to ensure safe transport home.' },
            { term: 'The Manual', def: 'The colloquial name for the OlyBars app/website ("The Artesian Bar League Manual").' },
        ]
    },
    {
        category: 'Legal',
        terms: [
            { term: 'Stool Test', def: 'The requirement that a venue must have a manned bar to be listed (No table-service-only restaurants).' },
            { term: 'Anti-Volume', def: 'The principle that the League rewards attendance and discovery, not the quantity of alcohol consumed.' },
        ]
    }
];

const GlossaryScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            <SEO title="League Glossary" description="Decode the lingo of the OlyBars League." />

            {/* Header */}
            <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-black uppercase tracking-tighter font-league">
                    League <span className="text-primary">Glossary</span>
                </h1>
            </div>

            <div className="p-6 max-w-2xl mx-auto space-y-8">

                {/* Intro Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BookOpen className="w-24 h-24 text-white" />
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-body relative z-10">
                        Welcome to the Manual. Here you'll find the official definitions for everything from
                        <span className="text-primary font-bold"> Buzz</span> to
                        <span className="text-primary font-bold"> Badges</span>.
                        Detailed knowledge of these terms is key to maximizing your season score.
                    </p>
                </div>

                {/* Terms List */}
                <div className="space-y-10">
                    {glossaryTerms.map((section) => (
                        <div key={section.category}>
                            <h2 className="text-lg font-black uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-800 pb-2">
                                {section.category}
                            </h2>
                            <div className="grid gap-4">
                                {section.terms.map((item) => (
                                    <div key={item.term} className="bg-surface border border-white/5 p-4 rounded-xl hover:border-primary/30 transition-colors group">
                                        <h3 className="text-base font-black uppercase tracking-tight font-league text-primary mb-1 group-hover:text-amber-400 transition-colors">
                                            {item.term}
                                        </h3>
                                        <p className="text-sm text-slate-400 font-medium leading-normal">
                                            {item.def}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center pt-8 opacity-50">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                    <p className="text-[10px] uppercase tracking-widest text-slate-600">
                        Official League Rules & Definitions<br />v2025.1
                    </p>
                </div>

            </div>
        </div>
    );
};

export default GlossaryScreen;
