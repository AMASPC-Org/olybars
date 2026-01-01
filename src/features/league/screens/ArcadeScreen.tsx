import React, { useState } from 'react';
import { ArenaLayout } from '../../../components/layout/ArenaLayout';
import { UniversalEventCard } from '../../../components/ui/UniversalEventCard';
import { Venue } from '../../../types';
import { Gamepad2 } from 'lucide-react';

interface ArcadeScreenProps {
  venues: Venue[];
}

export const ArcadeScreen: React.FC<ArcadeScreenProps> = ({ venues }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const arcadeVenues = venues.filter(v =>
    v.leagueEvent === 'arcade' &&
    (v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.deal && v.deal.toLowerCase().includes(searchQuery.toLowerCase())))
  ).slice(0, 10);

  return (
    <ArenaLayout
      title="Arcade Sector"
      subtitle="High Scores & Tokens"
      activeCategory="play"
      artieTip="The ghosts are restless. Stack your tokens, aim for the high score, and keep the spirits happy. Top scores this week at Well 80 get a secret badge."
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search arcades..."
    >
      <div className="space-y-4">
        {arcadeVenues.length > 0 ? (
          arcadeVenues.map(venue => (
            <UniversalEventCard
              key={venue.id}
              venue={venue}
              title="High Score Challenge"
              time="Always Active"
              category="play"
              points={10}
              onCheckIn={() => console.log('Clock-in', venue.id)}
              onShare={() => console.log('Share', venue.id)}
              onVibeChange={(v) => console.log('Vibe', venue.id, v)}
              contextSlot={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gamepad2 size={14} className="text-primary" />
                    <span className="text-[10px] text-white font-black uppercase font-league">Leader: USER_42</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">12,400 PTS</span>
                </div>
              }
            />
          ))
        ) : (
          <div className="text-center p-12 bg-[#1e293b]/30 rounded-[2rem] border border-dashed border-white/5">
            <p className="text-slate-500 font-black uppercase tracking-widest font-league">Sector Empty</p>
            <p className="text-[10px] text-slate-600 font-bold uppercase mt-2">Try searching for something else</p>
          </div>
        )}
      </div>
    </ArenaLayout>
  );
};


