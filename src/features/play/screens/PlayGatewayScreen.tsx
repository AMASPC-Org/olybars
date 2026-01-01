import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Sparkles, ChevronRight, Music, Mic, Grid, Gamepad, Crown, Search } from 'lucide-react';
import { barGames } from '../../../data/barGames';
import { Venue } from '../../../types';
import { ArenaLayout } from '../../../components/layout/ArenaLayout';

interface PlayGatewayScreenProps {
    venues: Venue[];
}

export const PlayGatewayScreen: React.FC<PlayGatewayScreenProps> = ({ venues }) => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = React.useState('');

    // Helper to get iconography for categories
    const getCategoryIcon = (category: string) => {
        if (category.includes('Social')) return <Music className="w-5 h-5 text-primary" />;
        if (category.includes('Table')) return <Grid className="w-5 h-5 text-primary" />;
        if (category.includes('Arcade')) return <Gamepad className="w-5 h-5 text-primary" />;
        if (category.includes('Special')) return <Trophy className="w-5 h-5 text-primary" />;
        return <Sparkles className="w-5 h-5 text-primary" />;
    };

    // Filter Logic
    const filteredGames = barGames.map(category => {
        const matchingGames = category.games.filter(game =>
            game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        const categoryMatches = category.category.toLowerCase().includes(searchTerm.toLowerCase());

        // If category matches, show all games. If not, show only matching games.
        const gamesToShow = categoryMatches ? category.games : matchingGames;

        return {
            ...category,
            games: gamesToShow
        };
    }).filter(cat => cat.games.length > 0);

    return (
        <ArenaLayout
            title="The Arcade & Arena"
            subtitle="Olympia's Activity Engine"
            activeCategory="play"
            artieTip="Welcome to the playground. From pinball wizards to karaoke kings, this is where the 98501 comes to play."
        >
            <div className="space-y-8 pb-12">
                {/* 1. Primary Action: The Wire (Events) */}
                <div
                    onClick={() => navigate('/events')}
                    className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-white/10 cursor-pointer shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-6 relative z-10 flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Feed</span>
                            </div>
                            <h2 className="text-3xl font-black uppercase font-league text-white leading-none italic group-hover:text-primary transition-colors">
                                The Citywire
                            </h2>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider max-w-[200px]">
                                The pulse of tonight. Live music, events, and community beats.
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center border border-white/10 group-hover:border-primary group-hover:scale-110 transition-all">
                            <ChevronRight className="w-6 h-6 text-white group-hover:text-primary" />
                        </div>
                    </div>
                </div>

                {/* 2. League CTA Banner */}
                <div className="relative rounded-2xl bg-gradient-to-r from-yellow-700/20 to-yellow-900/20 border border-yellow-500/30 p-1 flex items-center gap-4 cursor-pointer hover:border-yellow-500 transition-colors" onClick={() => navigate('/league')}>
                    <div className="bg-yellow-500/20 p-3 rounded-xl ml-2">
                        <Crown className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="flex-1 py-2">
                        <h3 className="text-sm font-black text-yellow-500 uppercase tracking-wider font-league">Sanctioned League Play</h3>
                        <p className="text-[9px] text-yellow-200/60 font-bold uppercase tracking-wide">Earn points. Climb ranks. Win glory.</p>
                    </div>
                    <button className="bg-yellow-500 text-black text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg mr-2 hover:bg-yellow-400">
                        Join HQ
                    </button>
                </div>


                {/* 3. Activity Directory */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Gamepad className="w-4 h-4 text-slate-500" />
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] font-league">Activity Directory</h3>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find a game (e.g. Pinball, Poker, Karaoke)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-body"
                        />
                    </div>

                    <div className="grid gap-4">
                        {filteredGames.length > 0 ? (
                            filteredGames.map((category, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                                        {getCategoryIcon(category.category)}
                                        <h4 className="text-sm font-black text-gray-200 uppercase tracking-wider font-league">{category.category}</h4>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {category.games.map((game, gIdx) => (
                                            <span
                                                key={gIdx}
                                                onClick={() => navigate(`/?q=${encodeURIComponent(game.name)}`)}
                                                className="text-[10px] font-bold text-slate-400 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-wide hover:text-white hover:border-primary/50 hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
                                            >
                                                {game.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-50">
                                <Gamepad className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No games found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ArenaLayout>
    );
};
