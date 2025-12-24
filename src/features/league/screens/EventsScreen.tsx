import React, { useState } from 'react';
import { ArenaLayout } from '../../../components/layout/ArenaLayout';
import { UniversalEventCard } from '../../../components/ui/UniversalEventCard';
import { Venue } from '../../../types';
import { Ticket } from 'lucide-react';

interface EventsScreenProps {
  venues: Venue[];
}

export const EventsScreen: React.FC<EventsScreenProps> = ({ venues }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const eventVenues = venues.filter(v =>
    (v.leagueEvent === 'events' ||
      v.leagueEvent === 'openmic' ||
      v.leagueEvent === 'bingo') &&
    (v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.deal && v.deal.toLowerCase().includes(searchQuery.toLowerCase())))
  ).slice(0, 10);

  return (
    <ArenaLayout
      title="The Citywire"
      subtitle="Chronological Citywide Feed"
      activeCategory="events"
      artieTip="The 98501 is always on. Find your rhythm, claim your spot, and make your mark. Check 'The Wire' for pop-up deals and last-minute gigs."
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search the wire..."
    >
      <div className="space-y-2">
        {eventVenues.length > 0 ? (
          eventVenues.map(venue => (
            <UniversalEventCard
              key={venue.id}
              venue={venue}
              title={venue.deal || "Citywire Event"}
              time="Tonight @ 8:00 PM"
              category="event"
              points={10}
              onCheckIn={() => console.log('Check-in', venue.id)}
              onShare={() => console.log('Share', venue.id)}
              onVibeChange={(v) => console.log('Vibe', venue.id, v)}
              contextSlot={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket size={14} className="text-primary" />
                    <span className="text-[10px] text-white font-black uppercase font-league">Official Bar League Event</span>
                  </div>
                </div>
              }
            />
          ))
        ) : (
          <div className="text-center p-12 bg-[#1e293b]/30 rounded-[2rem] border border-dashed border-white/5">
            <p className="text-slate-500 font-black uppercase tracking-widest font-league">Wire is Silent</p>
            <p className="text-[10px] text-slate-600 font-bold uppercase mt-2">Try searching for something else</p>
          </div>
        )}
      </div>
    </ArenaLayout>
  );
};
