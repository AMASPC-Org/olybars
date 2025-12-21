import React, { useState } from 'react';
import { Crown } from 'lucide-react';
import { Venue } from '../../venues/screens/BuzzScreen'; // Adjust path as needed

// Using a consistent set of mock data
const INITIAL_VENUES: Venue[] = [
  { 
    id: 'broho', name: "The Brotherhood", status: 'lively', checkIns: 28, 
    isHQ: true, type: 'Lounge', vibe: 'Classic Cool'
  },
  { 
    id: 'hannahs', name: "Hannah's Bar", status: 'buzzing', checkIns: 42, 
    leagueEvent: 'karaoke', type: 'Dive Bar', vibe: 'Chaotic Good'
  },
  { 
    id: 'eastside', name: "Eastside Club Tavern", status: 'lively', checkIns: 25, 
    leagueEvent: 'pool-tournament', type: 'Tavern', vibe: 'Local Classic'
  },
  { 
    id: 'well80', name: "Well 80 Brewhouse", status: 'lively', checkIns: 35, 
    leagueEvent: 'trivia', type: 'Brewery', vibe: 'Artesian Flow'
  },
  { 
    id: 'crypt', name: "Cryptatropa", status: 'chill', checkIns: 12, 
    type: 'Goth Bar', vibe: 'Spooky Quiet'
  },
];

type LeagueTab = 'overview' | 'schedule' | 'standings' | 'bars' | 'rules';

// Mock data for the tabs
const leaderboardData = [
  { rank: 1, name: "BarFly_99", points: 4520, badge: "👑" },
  { rank: 2, name: "IPA_Lover", points: 3890, badge: "🥈" },
  { rank: 3, name: "TriviaKing", points: 3650, badge: "🥉" },
  { rank: 4, name: "OlyGirl", points: 3100, badge: "" },
];

const scheduleData = [
    { title: "Karaoke Championship", venue: "Hannah's Bar", time: "TONIGHT 9PM", details: "Double points for all singers.", color: "pink" },
    { title: "Pool Tournament", venue: "Eastside Club Tavern", time: "FRI 7PM", details: "Single elimination. $5 buy-in.", color: "blue" }
]

export const LeagueHQScreen: React.FC = () => {
  const [leagueTab, setLeagueTab] = useState<LeagueTab>('overview');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [venues] = useState<Venue[]>(INITIAL_VENUES);

  const renderContent = () => {
    switch (leagueTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-['Bangers'] text-white border-b-2 border-slate-700 pb-2">HOW IT WORKS</h2>
            <div className="space-y-3">
              {[
                { t: 'Who', d: 'Open to anyone 21+. Just create a handle and check in.' },
                { t: 'What', d: 'Earn points for checking in, attending events, and more.' },
                { t: 'How', d: 'Clock in (max 2/12hrs), snap vibe photos, & play league events.' }
              ].map(i => (
                <div key={i.t} className="bg-background/50 p-4 rounded-lg border border-slate-700">
                  <h3 className="text-primary font-bold text-sm uppercase mb-1">{i.t}</h3>
                  <p className="text-sm text-slate-300">{i.d}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-['Bangers'] text-white">UPCOMING NIGHTS</h2>
            {scheduleData.map(item => (
                <div key={item.title} className="bg-surface p-4 rounded-lg border border-slate-700 shadow-md">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-['Bangers'] text-white text-xl">{item.title}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase">{item.venue}</p>
                        </div>
                        <span className={`text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 border border-primary/20 rounded`}>{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{item.details}</p>
                </div>
            ))}
          </div>
        );
      case 'standings':
        return (
          <div>
            <h2 className="text-3xl font-['Bangers'] text-white mb-4">LEADERBOARD</h2>
            <div className="bg-surface rounded-lg border border-slate-700">
              <div className="divide-y divide-slate-700">
                {leaderboardData.map((player) => (
                  <div key={player.rank} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-4">
                      <span className="font-['Bangers'] text-2xl w-8 text-center text-primary">#{player.rank}</span>
                      <p className="font-bold text-sm uppercase text-white">{player.name} {player.badge}</p>
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-300">{player.points.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'bars':
        return (
          <div className="space-y-2">
            <h2 className="text-3xl font-['Bangers'] text-white mb-4">PARTICIPATING VENUES</h2>
            {venues.map(v => (
              <div key={v.id} className="bg-background/50 p-3 rounded-md flex justify-between items-center border border-slate-800 hover:border-slate-600 cursor-pointer">
                <span className="font-['Bangers'] text-white text-lg tracking-wide">{v.name}</span>
                {v.isHQ && <Crown className="w-5 h-5 text-primary" />}
              </div>
            ))}
          </div>
        );
      case 'rules':
          return (
            <div className="space-y-4">
               <h2 className="text-3xl font-['Bangers'] text-white mb-4">LEAGUE RULES</h2>
               <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg shadow-md">
                   <h3 className="font-['Bangers'] text-red-400 text-xl uppercase">Respect the Staff</h3>
                   <p className="font-bold text-red-200 text-sm">Bartenders & staff are the referees. Their decisions are final. Be cool.</p>
               </div>
               <div className="bg-surface/50 border border-slate-700 p-4 rounded-lg">
                   <h3 className="font-['Bangers'] text-primary text-xl uppercase">Points & Check-ins</h3>
                   <p className="font-bold text-slate-300 text-sm">Max two (2) check-ins per 12-hour period. No purchase necessary to earn points.</p>
               </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background text-white min-h-screen p-4 font-sans">
      
      {/* Sponsor Hero Section (REPLACES GENERIC HERO) */}
      <div className="mb-6 mx-auto max-w-sm">
        <div className="border-2 border-amber-500/30 bg-black/40 rounded-lg p-4 shadow-[4px_4px_0_#000] relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="text-amber-500 font-['Bangers'] text-sm uppercase tracking-widest mb-2">Official League HQ</span>
            
            {/* Sponsor Logo Container */}
            <div className="bg-white px-4 py-2 rounded shadow-sm transform -rotate-1 mb-3">
               {/* Placeholder for when real image is missing, style as text for now */}
               <h2 className="text-black font-['Bangers'] text-2xl leading-none">HANNAH'S</h2>
               <p className="text-black text-[10px] font-bold uppercase leading-none tracking-widest">Bar & Grill</p>
            </div>

            <p className="text-slate-300 text-xs font-bold mb-4">Your playbook for league nights in Olympia.</p>
            
            <div className="flex gap-2">
              <button onClick={() => setLeagueTab('schedule')} className="bg-primary text-black font-['Bangers'] text-lg px-4 py-1 rounded shadow-md hover:scale-105 transition-transform">
                TONIGHT
              </button>
              <button onClick={() => setLeagueTab('overview')} className="bg-slate-700 text-white font-['Bangers'] text-lg px-4 py-1 rounded shadow-md border border-slate-600 hover:bg-slate-600 transition-colors">
                THE RULES
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Nav */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide border-b-2 border-slate-800">
        {(['overview', 'schedule', 'standings', 'bars', 'rules'] as LeagueTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setLeagueTab(tab)}
            className={`px-4 py-2 text-sm font-['Bangers'] uppercase tracking-wider whitespace-nowrap transition-all rounded-t-md
            ${leagueTab === tab
                ? 'bg-surface text-primary border-b-2 border-primary'
                : 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Conditional Content */}
      <div className="min-h-[400px] bg-surface/50 p-4 rounded-b-lg border border-slate-800">
        {renderContent()}
      </div>
    </div>
  );
};
