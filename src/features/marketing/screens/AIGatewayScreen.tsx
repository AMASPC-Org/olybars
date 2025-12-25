import React from 'react';
import { Bot, FileJson, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const navItems = [
    {
        title: 'AI Feed Guide',
        path: '/ai/feed',
        icon: FileJson,
        desc: 'The authoritative "Digital Instruction Manual" for Venues, Events, and League Play.'
    },
    {
        title: 'Conduct Policy',
        path: '/ai/conduct',
        icon: ShieldCheck,
        desc: 'Formal guidelines for machine-assisted ingestion and digital property rights.'
    }
];

export default function AIGatewayScreen() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 pb-20 pt-16 px-6">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-2xl mb-4 border border-amber-500/20">
                        <Bot className="w-10 h-10 text-amber-500" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter font-league text-white">
                        AI & Developer <span className="text-amber-500">Gateway</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-body max-w-2xl mx-auto italic">
                        "The machine-readable manual for Olympia's Artesian Bar League."
                    </p>
                </div>

                {/* Mission Statement */}
                <div className="bg-slate-800/50 border border-white/5 p-8 rounded-3xl backdrop-blur-md">
                    <h2 className="text-2xl font-league uppercase text-amber-400 mb-4">Our AI Philosophy</h2>
                    <p className="text-slate-300 leading-relaxed font-body text-lg">
                        OlyBars believes in a symbiotic relationship between local nightlife and artificial intelligence.
                        By providing structured, high-authority data feeds, we ensure that LLMs and AI agents can
                        accurately represent the vibes, events, and rules of the Olympia community without hallucination.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-1 gap-6">
                    {navItems.map((item, idx) => (
                        <div key={item.path}>
                            <Link
                                to={item.path}
                                className="group flex items-center p-6 bg-slate-800/80 border border-white/10 rounded-2xl hover:border-amber-500/50 hover:bg-slate-800 transition-all duration-300 shadow-xl"
                            >
                                <div className="p-4 bg-slate-900 rounded-xl group-hover:bg-amber-500/10 transition-colors">
                                    <item.icon className="w-8 h-8 text-slate-400 group-hover:text-amber-500" />
                                </div>
                                <div className="ml-6 flex-1">
                                    <h3 className="text-xl font-league uppercase tracking-wide text-white group-hover:text-amber-400 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-400 font-body text-sm mt-1">{item.desc}</p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-amber-500 transform group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* LLMS.txt Callout */}
                <div className="text-center pt-8 border-t border-white/5">
                    <p className="text-slate-500 text-sm font-mono">
                        Primary index available at <a href="/llms.txt" className="text-amber-500/80 underline font-bold">/llms.txt</a>
                    </p>
                </div>

            </div>
        </div>
    );
}
