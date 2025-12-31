import React, { useState } from 'react';
import { Crown, Trophy, Calendar, List, Info, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type LeagueTab = 'overview' | 'schedule' | 'standings' | 'rules';

export const LeagueHomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LeagueTab>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="bg-surface/50 border border-white/5 p-4 rounded-xl">
              <h3 className="text-primary font-black text-sm uppercase mb-2 font-league">The Pulse of the City</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-body">The OlyBars League is where local nightlife meets competition. Earn points by being where the vibe is. Support local bars, hit the stage, and climb the ranks.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface/50 border border-white/5 p-4 rounded-xl">
                <span className="text-primary font-black text-[10px] uppercase block mb-1 font-league">CLOCK IN</span>
                <span className="text-white text-xs font-bold font-body">+10 PTS</span>
              </div>
              <div className="bg-surface/50 border border-white/5 p-4 rounded-xl">
                <span className="text-primary font-black text-[10px] uppercase block mb-1 font-league">MARKETING BONUS</span>
                <span className="text-white text-xs font-bold font-body">+15 PTS</span>
              </div>
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-3">
            {[
              { event: "KARAOKE CHAMPS", venue: "HANNAH'S", time: "TONIGHT 9PM", pts: "+50" },
              { event: "TRIVIA BLOCK", venue: "WELL 80", time: "SUN 7PM", pts: "+100" },
              { event: "POOL TOURNEY", venue: "EASTSIDE", time: "FRI 7PM", pts: "+20" }
            ].map((item, i) => (
              <div key={i} className="bg-surface/50 border border-white/5 p-4 flex justify-between items-center rounded-xl group hover:border-primary transition-colors cursor-pointer">
                <div>
                  <span className="block text-white font-black text-sm font-league uppercase group-hover:text-primary transition-colors">{item.event}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{item.venue} • {item.time}</span>
                </div>
                <span className="text-primary font-black text-xs font-league">{item.pts}</span>
              </div>
            ))}
          </div>
        );
      case 'standings':
        return (
          <div className="bg-surface/50 border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
            {[
              { name: "BARFLY_99", pts: "4,520", rank: 1 },
              { name: "IPA_LOVER", pts: "3,890", rank: 2 },
              { name: "TRIVIAKING", pts: "3,650", rank: 3 },
              { name: "YOU", pts: "1,250", rank: 42, isUser: true }
            ].map((player, i) => (
              <div key={i} className={`p-4 flex justify-between items-center ${player.isUser ? 'bg-primary/10' : ''}`}>
                <div className="flex items-center gap-4">
                  <span className={`font-black text-lg w-6 ${player.rank <= 3 ? 'text-primary' : 'text-slate-500'} font-league`}>{player.rank}</span>
                  <span className={`font-black text-sm uppercase font-league ${player.isUser ? 'text-primary' : 'text-white'}`}>{player.name}</span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-400">{player.pts}</span>
              </div>
            ))}
          </div>
        );
      case 'rules':
        return (
          <div className="space-y-3">
            <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-xl">
              <h3 className="text-red-500 font-black text-xs uppercase mb-1 font-league">BE COOL</h3>
              <p className="text-xs text-red-200/70 font-bold font-body">Harassment or disrespecting staff is an immediate lifetime ban from the League. We keep it chill.</p>
            </div>
            <div className="bg-surface/50 border border-white/5 p-4 rounded-xl">
              <h3 className="text-primary font-black text-xs uppercase mb-1 font-league">CLOCK-IN LIMIT</h3>
              <p className="text-xs text-slate-400 font-bold font-body">Max 2 clock-ins per 12-hour window. This is for vibes, not over-consumption.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-background text-white min-h-screen p-4 pb-32 font-body">
      {/* Header */}
      <div className="text-center mb-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-5">
          <Crown size={120} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-widest font-league uppercase italic leading-none">
          LEAGUE <span className="text-primary">HQ</span>
        </h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 italic shadow-sm">Olympia's Elite Social Network</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface rounded-2xl border border-white/5 p-5 shadow-[4px_4px_0px_0px_#000] relative group overflow-hidden">
          <Trophy className="absolute -right-2 -bottom-2 w-16 h-16 text-primary opacity-5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] text-primary font-black uppercase tracking-wider block mb-1 font-league">SEASON RANK</span>
          <span className="text-3xl font-black text-white italic font-league">#42</span>
        </div>
        <div className="bg-surface rounded-2xl border border-white/5 p-5 shadow-[4px_4px_0px_0px_#000] relative group overflow-hidden">
          <Star className="absolute -right-2 -bottom-2 w-16 h-16 text-primary opacity-5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] text-primary font-black uppercase tracking-wider block mb-1 font-league">TOTAL POINTS</span>
          <span className="text-3xl font-black text-white italic font-league">1,250</span>
        </div>
      </div>

      {/* Main Content Hub */}
      <div className="bg-surface rounded-[2rem] border border-slate-700 shadow-2xl p-6 relative overflow-hidden">
        {/* Hub Tabs */}
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          {[
            { id: 'overview', icon: Info, label: 'INFO' },
            { id: 'schedule', icon: Calendar, label: 'BEAT' },
            { id: 'standings', icon: Trophy, label: 'RANK' },
            { id: 'rules', icon: List, label: 'LAW' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as LeagueTab)}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'text-primary scale-110' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <tab.icon size={18} strokeWidth={activeTab === tab.id ? 3 : 2} />
              <span className="text-[9px] font-black uppercase tracking-widest font-league">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="min-h-[220px]">
          {renderContent()}
        </div>
      </div>

      {/* Promotion Link */}
      <button
        onClick={() => navigate('/trivia')}
        className="w-full mt-6 bg-primary text-black p-5 rounded-2xl flex items-center justify-between group shadow-xl active:scale-[0.98] transition-all border-2 border-black"
      >
        <div className="flex items-center gap-4">
          <div className="bg-black/10 p-2 rounded-lg">
            <Trophy size={20} className="text-black" />
          </div>
          <div className="text-left">
            <span className="block text-sm font-black uppercase font-league leading-none">TRIVIA NIGHT TONIGHT</span>
            <span className="text-[10px] font-bold uppercase opacity-60">Well 80 Brewhouse @ 7:00 PM</span>
          </div>
        </div>
        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default LeagueHomeScreen;
