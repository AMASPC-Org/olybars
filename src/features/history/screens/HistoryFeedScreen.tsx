import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HISTORY_ARTICLES } from '../data/historyData';
import { Scroll, Clock, ChevronRight } from 'lucide-react';

export const HistoryFeedScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-full bg-background pb-32">
            {/* Hero Header */}
            <div className="relative h-64 bg-surface-900 overflow-hidden">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1463991219662-acb918f0a0d0?auto=format&fit=crop&q=80&w=2000"
                    alt="Olympia History"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                        <Scroll className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-4xl font-heading text-white mb-2 uppercase tracking-wide">
                        The Archive
                    </h1>
                    <p className="text-slate-300 font-body max-w-md">
                        Unearthing the legends, rumors, and lost history of Olympia's drinking culture.
                    </p>
                </div>
            </div>

            {/* Article Grid */}
            <div className="p-4 space-y-4 max-w-2xl mx-auto -mt-6 relative z-30">
                {HISTORY_ARTICLES.map((article) => (
                    <div
                        key={article.id}
                        onClick={() => navigate(`/history/${article.slug}`)}
                        className="bg-surface border border-white/10 rounded-xl overflow-hidden shadow-lg hover:border-accent/50 transition-all cursor-pointer group"
                    >
                        <div className="h-48 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                            <img
                                src={article.coverImage}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-3 left-3 z-20">
                                <span className="text-xs font-bold text-accent bg-black/50 px-2 py-1 rounded backdrop-blur-sm uppercase tracking-wider">
                                    Lore
                                </span>
                            </div>
                        </div>

                        <div className="p-5">
                            <h2 className="text-2xl font-heading text-white mb-2 group-hover:text-accent transition-colors">
                                {article.title}
                            </h2>
                            <p className="text-slate-400 font-body text-sm line-clamp-2 mb-4">
                                {article.subtitle}
                            </p>

                            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                <div className="flex items-center gap-4">
                                    <span>{article.author}</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {article.readingTime}
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Placeholder for 'Coming Soon' */}
                <div className="text-center py-12 opacity-50">
                    <p className="text-slate-500 font-body text-sm uppercase tracking-widest">
                        More history unearthed soon
                    </p>
                </div>
            </div>
        </div>
    );
};
