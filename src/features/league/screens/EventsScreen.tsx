import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Venue } from '../../venues/screens/BuzzScreen'; // Adjust path as needed

// Mock data, adding a specific venue for this screen
const INITIAL_VENUES: Venue[] = [
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
];

export const EventsScreen: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);

  const eventVenues = venues.filter(v => 
    v.leagueEvent && !['arcade', 'karaoke', 'trivia'].includes(v.leagueEvent)
  );

  return (
    <div className="bg-background text-white min-h-screen p-4 font-sans space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-primary tracking-wider">EVENT WIRE</h1>
        <p className="text-sm font-semibold text-slate-300">CITYWIDE FEEDS</p>
      </div>

      {/* Main Content Area */}
      {eventVenues.length > 0 ? (
        eventVenues.map(venue => (
          <div 
            key={venue.id} 
            className="bg-surface rounded-lg border border-slate-700 shadow-md p-4 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">{venue.name}</h3>
                <p className="text-slate-400 text-sm mt-1">{venue.type}</p>
              </div>
              <Calendar className="w-6 h-6 text-primary" strokeWidth={2.5} />
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700">
                <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full border border-primary/20 uppercase">
                    {venue.leagueEvent}
                </span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center p-8 border-2 border-dashed border-slate-700 rounded-lg">
            <p className="text-slate-500 font-bold uppercase">No Other Events Scheduled</p>
        </div>
      )}
    </div>
  );
};
