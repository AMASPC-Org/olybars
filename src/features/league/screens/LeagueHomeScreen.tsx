import React from 'react';
import { Crown, Trophy, Users, Star, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeagueHomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-white p-6 pb-32 font-body">
      <header className="mb-10 text-center relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <Crown className="w-48 h-48 text-primary" />
        </div>
        <h1 className="text-5xl font-black uppercase tracking-tighter font-league mb-2 italic">
          LEAGUE <span className="text-primary">HQ</span>
        </h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Olympia's Elite Social Network</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface border border-white/5 p-4 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="w-12 h-12" />
          </div>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Season Rank</p>
          <p className="text-3xl font-black italic font-league">#42</p>
        </div>
        <div className="bg-surface border border-white/10 p-4 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-12 h-12" />
          </div>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Total Points</p>
          <p className="text-3xl font-black italic font-league">1,250</p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="space-y-4">
        <button
          onClick={() => navigate('/league')}
          className="w-full bg-gradient-to-br from-primary to-yellow-600 p-6 rounded-[2rem] flex items-center justify-between group shadow-xl shadow-primary/10 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-black/20 p-3 rounded-2xl">
              <Crown className="w-8 h-8 text-black" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-black text-black uppercase tracking-tight font-league leading-none mb-1">Leaderboards</h3>
              <p className="text-[10px] text-black/60 font-bold uppercase tracking-widest">See who owns the city</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-black/40 group-hover:text-black transition-colors" />
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/trivia')}
            className="bg-surface border border-white/5 p-6 rounded-3xl text-center group hover:border-primary transition-all active:scale-[0.95]"
          >
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <span className="text-xs font-black uppercase tracking-widest font-league">Local Trivia</span>
          </button>
          <button
            onClick={() => navigate('/karaoke')}
            className="bg-surface border border-white/5 p-6 rounded-3xl text-center group hover:border-primary transition-all active:scale-[0.95]"
          >
            <Star className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <span className="text-xs font-black uppercase tracking-widest font-league">Karaoke Hub</span>
          </button>
        </div>
      </div>

      <div className="mt-12 p-6 bg-slate-900/50 border border-white/5 rounded-[2.5rem] text-center">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Active in the League</p>
        <div className="flex justify-center -space-x-4 mb-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`w-12 h-12 rounded-full border-4 border-background bg-slate-800 flex items-center justify-center text-xs font-black text-primary`}>
              {String.fromCharCode(64 + i)}
            </div>
          ))}
          <div className="w-12 h-12 rounded-full border-4 border-background bg-primary text-black flex items-center justify-center text-xs font-black">
            +82
          </div>
        </div>
        <p className="text-sm text-slate-300 font-medium leading-relaxed font-body">
          There are <span className="text-primary font-black">82 members</span> active tonight in Downtown Olympia.
        </p>
      </div>
    </div>
  );
};

export default LeagueHomeScreen;
