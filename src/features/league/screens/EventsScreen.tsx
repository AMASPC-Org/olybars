import React, { useState, useEffect } from 'react';
import { ArenaLayout } from '../../../components/layout/ArenaLayout';
import { UniversalEventCard } from '../../../components/ui/UniversalEventCard';
import { Venue, AppEvent } from '../../../types';
import { Ticket, Plus, Sparkles, Loader2 } from 'lucide-react';
import { EventService } from '../../../services/eventService';
import { EventSubmissionModal } from '../components/EventSubmissionModal';

interface EventsScreenProps {
  venues: Venue[];
}

export const EventsScreen: React.FC<EventsScreenProps> = ({ venues }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      const fetchedEvents = await EventService.fetchEvents();
      setEvents(fetchedEvents);
      setIsLoading(false);
    };
    loadEvents();
  }, []);

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.venueName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ArenaLayout
      title="The Citywire"
      subtitle="Chronological Citywide Feed"
      activeCategory="events"
      artieTip="The 98501 is always on. Find your rhythm, claim your spot, and make your mark. Check 'The Wire' for community-submitted gems."
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search the wire..."
    >
      <div className="space-y-6">
        {/* Submit Event Trigger */}
        <button
          onClick={() => setShowSubmitModal(true)}
          className="w-full bg-primary/10 border border-primary/30 text-primary font-black px-6 py-4 rounded-3xl uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/20 transition-all font-league text-sm shadow-[0_4px_20px_-5px_rgba(251,191,36,0.1)] group mb-4"
        >
          <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" /> Submit New Event
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="font-black uppercase tracking-widest text-xs animate-pulse">Refreshing the Wire...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-2">
            {filteredEvents.map(event => (
              <UniversalEventCard
                key={event.id}
                event={event}
                venue={venues.find(v => v.id === event.venueId)}
                contextSlot={
                  <div className="flex items-center gap-2">
                    <Ticket size={14} className="text-primary" />
                    <span className="text-[10px] text-white font-black uppercase font-league">Community Submission</span>
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-[#1e293b]/30 rounded-[2rem] border border-dashed border-white/5 space-y-4">
            <Sparkles className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-slate-500 font-black uppercase tracking-widest font-league">Wire is Silent</p>
            <p className="text-[10px] text-slate-600 font-bold uppercase">Be the first to share what's happening</p>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="text-primary font-black uppercase tracking-widest text-[9px] hover:underline"
            >
              + Submit Event
            </button>
          </div>
        )}

        {/* Legacy/Sanctioned Fallback Section */}
        {!isLoading && venues.filter(v => v.leagueEvent).length > 0 && (
          <div className="pt-8 border-t border-white/5 space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] font-league ml-4">Sanctioned League Hubs</h3>
            <div className="space-y-2">
              {venues
                .filter(v => v.leagueEvent && !events.some(e => e.venueId === v.id))
                .map(venue => (
                  <UniversalEventCard
                    key={`legacy-${venue.id}`}
                    venue={venue}
                    title={venue.deal || "Daily Ritual"}
                    time={venue.triviaTime || "Tonight"}
                    category="event"
                    contextSlot={
                      <div className="flex items-center gap-2">
                        <Ticket size={14} className="text-primary" />
                        <span className="text-[10px] text-white font-black uppercase font-league">Official Bar League Partner</span>
                      </div>
                    }
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      <EventSubmissionModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        venues={venues}
      />
    </ArenaLayout>
  );
};
