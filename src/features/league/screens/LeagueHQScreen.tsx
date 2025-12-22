import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Crown, Trophy, Star, Gift, Zap, Users, ArrowRight, ShieldCheck, Clock, Ticket } from 'lucide-react';
import { Venue } from '../../../types';

type LeagueTab = 'overview' | 'schedule' | 'standings' | 'bars' | 'rules' | 'prizes';

// Mock data for the standings with tie-breaker info
const leaderboardData = [
  { id: '1', name: "BarFly_99", points: 4520, lifetimeCheckins: 150, currentStreak: 12, badge: "👑" },
  { id: '2', name: "IPA_Lover", points: 3890, lifetimeCheckins: 120, currentStreak: 8, badge: "🥈" },
  { id: '3', name: "TriviaKing", points: 3890, lifetimeCheckins: 110, currentStreak: 5, badge: "🥉" }, // Tied in points with IPA_Lover
  { id: '4', name: "OlyGirl", points: 3100, lifetimeCheckins: 90, currentStreak: 10, badge: "" },
  { id: '5', name: "Zack_Attack", points: 2950, lifetimeCheckins: 85, currentStreak: 3, badge: "" },
];

const totalMembers = 1242; // Example total

// Standard Competition Ranking (1224)
const calculateRanks = (data: typeof leaderboardData) => {
  const sorted = [...data].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.lifetimeCheckins !== a.lifetimeCheckins) return b.lifetimeCheckins - a.lifetimeCheckins;
    if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
    return a.name.localeCompare(b.name);
  });

  return sorted.map((p, i, arr) => {
    let rank = i + 1;
    if (i > 0 && p.points === arr[i - 1].points) {
      // Find the first occurrence of this points value to get the rank
      let firstIndex = arr.findIndex(item => item.points === p.points);
      rank = firstIndex + 1;
    }
    return { ...p, rank };
  });
};

interface LeagueHQScreenProps {
  venues: Venue[];
  isLeagueMember?: boolean;
}

export const LeagueHQScreen: React.FC<LeagueHQScreenProps> = ({ venues, isLeagueMember = true }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as LeagueTab || 'overview';
  const [leagueTab, setLeagueTab] = useState<LeagueTab>(initialTab);

  const rankedPlayers = useMemo(() => calculateRanks(leaderboardData), []);

  // Events Logic: Chronological list for tonight
  const tonightHappenings = useMemo(() => {
    const events = venues
      .filter(v => v.leagueEvent)
      .map(v => ({
        ...v,
        time: v.id === 'well80' ? '19:00' : v.id === 'hannahs' ? '21:00' : '20:00', // Mock times for demo
        priority: v.isHQ ? 2 : 1
      }))
      .sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return a.time.localeCompare(b.time);
      });
    return events;
  }, [venues]);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as LeagueTab;
    if (tabParam && tabParam !== leagueTab) {
      setLeagueTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: LeagueTab) => {
    setLeagueTab(tab);
    setSearchParams({ tab });
  };

  const renderJoinCTA = () => (
    <div className="bg-primary border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 transform -rotate-1">
      <h3 className="text-black font-league font-black text-2xl uppercase leading-none mb-2">Not a Member Yet?</h3>
      <p className="text-black text-xs font-bold uppercase mb-6 leading-tight">Join {totalMembers} locals competing for glory and free beer.</p>
      <button
        onClick={() => alert("Registration screen coming soon!")}
        className="w-full bg-black text-white font-league font-black py-4 rounded-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2"
      >
        JOIN THE LEAGUE <ArrowRight size={18} />
      </button>
    </div>
  );

  const renderContent = () => {
    switch (leagueTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {!isLeagueMember && renderJoinCTA()}

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-800" />
              <div className="space-y-8 relative">
                {[
                  { t: '1. Create Handle', d: 'Stake your claim. Pick a name that will go down in Oly history.', icon: Users },
                  { t: '2. Check In', d: 'Clock in at any participating venue (max 2 per 12hrs).', icon: ShieldCheck },
                  { t: '3. Climb the Ranks', d: 'Earn points for vibing, playing, and existing in the scene.', icon: Trophy }
                ].map((i, idx) => (
                  <div key={i.t} className="flex gap-6 items-start">
                    <div className="bg-slate-900 border-2 border-slate-700 p-2 rounded-xl relative z-10">
                      <i.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-white font-league font-black text-lg uppercase leading-none mb-2">{i.t}</h3>
                      <p className="text-sm text-slate-400 font-medium">{i.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Promotions</h4>
              <div className="bg-background/50 border border-slate-800 p-4 rounded-xl">
                <p className="text-sm font-bold text-white mb-1">Double Points at Hannah's</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Valid every Tuesday during League Karaoke.</p>
              </div>
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-3xl font-league text-white uppercase tracking-tight">Tonight's Happenings</h2>
              <span className="text-[10px] font-black text-primary animate-pulse uppercase tracking-widest">LIVE UPDATES</span>
            </div>
            {tonightHappenings.map(v => (
              <div key={v.id} className={`bg-surface p-4 rounded-xl border ${v.isHQ ? 'border-primary/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'border-slate-700/50'} shadow-lg group hover:scale-[1.02] transition-all`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${v.isHQ ? 'bg-primary text-black' : 'bg-slate-800 text-slate-400'}`}>
                      {v.isHQ ? <Crown size={18} /> : <Ticket size={18} />}
                    </div>
                    <div>
                      <h3 className="font-league text-white text-xl uppercase tracking-tight group-hover:text-primary transition-colors">{v.name}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{v.leagueEvent?.toUpperCase() || 'EVENT'}</p>
                    </div>
                  </div>
                  <div className="bg-black/40 px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
                    <Clock size={12} className="text-primary" />
                    <span className="text-[10px] font-black text-white">{v.time}</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{v.deal || "Join for League Points!"}</p>
                  <button className="text-[10px] font-black text-primary uppercase border-b-2 border-primary/20 hover:border-primary transition-all">Directions</button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'standings':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-3xl font-league text-white uppercase tracking-tight">Top 5 Standings</h2>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SEASON 4</span>
            </div>
            <div className="bg-surface/50 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="divide-y divide-white/5">
                {rankedPlayers.map((player) => (
                  <div key={player.id} className={`flex items-center justify-between p-5 transition-all hover:bg-white/[0.02] ${player.rank === 1 ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 ${player.rank === 1 ? 'bg-primary text-black border-black shadow-[2px_2px_0px_0px_#000]' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                        <span className="font-league font-black text-xl leading-none">#{player.rank}</span>
                        <span className="text-[7px] font-black uppercase leading-none mt-0.5">/{totalMembers}</span>
                      </div>
                      <div>
                        <p className="font-black text-base uppercase text-white font-league flex items-center gap-2">
                          {player.name} {player.badge && <span className="text-lg">{player.badge}</span>}
                        </p>
                        {player.rank === 1 && <span className="text-[9px] text-primary font-black uppercase tracking-widest">REIGNING CHAMP</span>}
                        {player.points === rankedPlayers[rankedPlayers.indexOf(player) - 1]?.points && <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">TIED</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-lg text-primary">{player.points.toLocaleString()}</span>
                      <p className="text-[8px] text-slate-500 font-bold uppercase">PTS</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-widest">Tie-Breaker: Check-ins \u003e Streak \u003e A-Z</p>
          </div>
        );
      case 'prizes':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-league text-white uppercase tracking-tight px-2">Prize Pool</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { title: "Season Grand Prize", prize: "$500 Cash + Well 80 VIP Card", requirement: "1st Place Overall", icon: Trophy },
                { title: "The Silver Chalice", prize: "$200 Gift Pack", requirement: "2nd Place Overall", icon: Gift },
                { title: "Bronze Medallion", prize: "Limited Edition League Tee", requirement: "3rd Place Overall", icon: Star },
                { title: "Venue MVP", prize: "Free Appetizer (Nightly)", requirement: "Most Points at a specific HQ", icon: Zap },
              ].map((p, i) => (
                <div key={i} className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl flex items-center gap-5 group hover:border-primary/20 transition-all">
                  <div className="bg-slate-800 p-3 rounded-xl border-2 border-slate-700 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                    <p.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-league font-black text-white text-lg uppercase leading-none mb-1">{p.title}</h3>
                    <p className="text-primary font-bold text-sm mb-1">{p.prize}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{p.requirement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'bars':
        return (
          <div className="space-y-2">
            <h2 className="text-3xl font-league text-white mb-4 uppercase tracking-tight px-2">Participating Venues</h2>
            {venues.map(v => (
              <div key={v.id} className="bg-background/50 p-4 rounded-xl flex justify-between items-center border border-slate-800 hover:border-primary/30 hover:bg-slate-900/50 cursor-pointer transition-all mx-2">
                <span className="font-league text-white text-lg tracking-wide uppercase">{v.name}</span>
                {v.isHQ && <Crown className="w-5 h-5 text-primary" />}
              </div>
            ))}
          </div>
        );
      case 'rules':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-league text-white mb-4 uppercase tracking-tight px-2">League Rules</h2>
            <div className="space-y-4 px-2">
              <div className="bg-red-900/10 border-2 border-red-900/30 p-5 rounded-2xl">
                <h3 className="font-league text-red-500 text-xl font-black uppercase tracking-tight mb-2">Rule #1: Respect the Staff</h3>
                <p className="font-bold text-red-200/70 text-sm leading-relaxed">Bartenders \u0026 staff are the referees. Their decisions are final. Harassment of any kind results in immediate season ban.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 p-5 rounded-2xl">
                <h3 className="font-league text-primary text-xl font-black uppercase tracking-tight mb-2">Rule #2: Points \u0026 Limits</h3>
                <p className="font-bold text-slate-400 text-sm leading-relaxed">Max two (2) check-ins per 12-hour period. No purchase necessary to earn points. Ghosting (checking in without being present) is prohibited.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background text-white min-h-screen p-4 font-sans pb-24">

      {/* Sponsor Hero Section */}
      <div className="mb-8 mx-auto max-w-sm">
        <div className="border-2 border-primary/20 bg-slate-900/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-primary/40 transition-all duration-500">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="text-primary font-league text-xs font-black uppercase tracking-[0.2em] mb-4">Official League HQ</span>

            {/* Sponsor Logo Container */}
            <div className="bg-white px-6 py-3 rounded shadow-xl transform rotate-1 group-hover:-rotate-1 transition-transform mb-4">
              <h2 className="text-black font-league font-black text-3xl leading-none">HANNAH'S</h2>
              <p className="text-black text-[10px] font-black uppercase leading-none tracking-[0.3em] mt-1">Bar \u0026 Grill</p>
            </div>

            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6 px-4">Your playbook for league nights in Olympia.</p>

            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => handleTabChange('schedule')}
                className="bg-primary text-black font-league font-black text-sm px-6 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform uppercase tracking-wider"
              >
                Tonight
              </button>
              <button
                onClick={() => handleTabChange('standings')}
                className="bg-slate-800 text-white font-league font-black text-sm px-6 py-2 rounded-lg shadow-lg border border-slate-700 hover:bg-slate-700 transition-colors uppercase tracking-wider flex items-center gap-2"
              >
                <Trophy size={14} /> Standings
              </button>
              <button
                onClick={() => handleTabChange('rules')}
                className="bg-slate-800 text-white font-league font-black text-sm px-6 py-2 rounded-lg shadow-lg border border-slate-700 hover:bg-slate-700 transition-colors uppercase tracking-wider"
              >
                The Rules
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Nav */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-4 scrollbar-hide no-scrollbar px-2">
        {(['overview', 'schedule', 'standings', 'prizes', 'bars', 'rules'] as LeagueTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all rounded-full border
            ${leagueTab === tab
                ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20'
                : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-600 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Conditional Content area */}
      <div className="min-h-[400px] border-t border-white/5 pt-6">
        {renderContent()}
      </div>
    </div>
  );
};
