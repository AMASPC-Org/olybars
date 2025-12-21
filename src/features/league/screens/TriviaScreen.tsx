import React, { useState } from 'react';
import { BookOpen, Zap, Users, Trophy } from 'lucide-react';
import { Venue } from '../../venues/screens/BuzzScreen'; // Adjust path as needed

// Using the same mock data structure for consistency
const INITIAL_VENUES: Venue[] = [
  {
    id: 'well80', name: "Well 80 Brewhouse", status: 'lively', checkIns: 35,
    type: 'Brewery', vibe: 'Artesian Flow',
    leagueEvent: 'trivia', address: '514 4th Ave E', hours: '11AM - 10PM'
  },
  // Other venues can be added here if needed for selection logic
];

// Find the default trivia venue from the mock data
const triviaVenue = INITIAL_VENUES.find(v => v.leagueEvent === 'trivia');

export const TriviaScreen: React.FC = () => {
  // Use the specific trivia venue from the mock data
  const [selectedVenue] = useState<Venue | undefined>(triviaVenue);

  if (!selectedVenue) {
    return <div className="p-4 text-center text-slate-500">No Trivia Venue Loaded.</div>;
  }

  // This is the extracted and modernized renderTriviaHub() logic
  return (
    <div className="bg-background text-white min-h-screen p-4 font-sans">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-primary tracking-wider">TRIVIA BLOCK</h1>
        <p className="text-sm font-semibold text-slate-300">KNOWLEDGE IS POWER</p>
      </div>

      {/* Main Content Card */}
      <div className="bg-surface rounded-lg border border-slate-700 shadow-md p-4">
        {/* Venue Info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{selectedVenue.name}</h2>
            <p className="text-xs text-slate-400">TRIVIA NIGHT: Sundays @ 7pm</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">8 TEAMS</p>
            <p className="text-xs text-slate-400">CURRENTLY PLAYING</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button className="bg-primary hover:bg-yellow-400 text-black font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 font-league uppercase">
            <BookOpen size={16} /> REGISTER
          </button>
          <button
            onClick={() => alert("League Team Scout activated! We'll notify you when a team at Well 80 needs a ringer. Drink some water while you wait!")}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 font-league uppercase"
          >
            <Users size={16} /> FIND A TEAM
          </button>
        </div>

        {/* Trivia Details */}
        <div className="space-y-3">
          <div className="bg-background/50 p-3 rounded-md">
            <h3 className="font-semibold text-primary mb-1">Weekly Challenge</h3>
            <p className="text-sm text-slate-300">"80s Movie Quotes" - double points round!</p>
          </div>

          <div className="bg-background/50 p-3 rounded-md">
            <h3 className="font-semibold text-primary mb-1">Grand Prize</h3>
            <p className="text-sm text-slate-300">$100 Bar Tab & Eternal Glory</p>
          </div>

          <div className="bg-background/50 p-3 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" />
              <div>
                <h3 className="font-semibold text-primary">LEAGUE PLAY</h3>
                <p className="text-xs text-slate-400">Counts towards season standings.</p>
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">250</p>
              <p className="text-xs text-slate-500 font-bold">PTS TO WIN</p>
            </div>
          </div>
        </div>

        {/* Power-Up Footer */}
        <div className="mt-4 pt-4 border-t border-slate-700 text-center">
          <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 mb-2">POWER-UPS ACTIVE</h3>
          <div className="flex items-center justify-center gap-2 bg-slate-900/50 border border-dashed border-slate-600 py-2 px-4 rounded-md">
            <Zap size={16} className="text-primary animate-pulse" />
            <span className="text-sm font-medium text-slate-300">First Timers get a <span className="font-bold text-primary">Free Answer</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};
