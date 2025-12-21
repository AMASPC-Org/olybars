import React, { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { Venue } from '../../venues/screens/BuzzScreen'; // Adjust path as needed

// Mock data, adding a specific venue for this screen
const INITIAL_VENUES: Venue[] = [
  { 
    id: 'hannahs', name: "Hannah's Bar", status: 'buzzing', checkIns: 42, 
    deal: "$5 Well Drinks", dealEndsIn: 45, type: 'Dive Bar', vibe: 'Chaotic Good',
    leagueEvent: 'karaoke', address: '123 5th Ave', hours: '4PM - 2AM'
  },
  { 
    id: 'reset', name: "Reset Arcade Bar", status: 'lively', checkIns: 31, 
    deal: "2-for-1 Tokens", dealEndsIn: 120, type: 'Arcade Bar', vibe: 'Retro Future',
    leagueEvent: 'arcade', address: '456 Button St', hours: '2PM - 12AM'
  },
  { 
    id: 'well80', name: "Well 80 Brewhouse", status: 'lively', checkIns: 35, 
    type: 'Brewery', vibe: 'Artesian Flow',
    leagueEvent: 'trivia', address: '514 4th Ave E', hours: '11AM - 10PM'
  },
];

export const ArcadeScreen: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);

  const arcadeVenues = venues.filter(v => v.leagueEvent === 'arcade');

  return (
    <div className="bg-background text-white min-h-screen p-4 font-sans space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-primary tracking-wider">ARCADE SECTOR</h1>
        <p className="text-sm font-semibold text-slate-300">HIGH SCORES & TOKENS</p>
      </div>

      {/* Main Content Area */}
      {arcadeVenues.length > 0 ? (
        arcadeVenues.map(venue => (
          <div 
            key={venue.id} 
            className="bg-surface rounded-lg border border-slate-700 shadow-md p-4 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">{venue.name}</h3>
                <p className="text-slate-400 text-sm mt-1">{venue.type}</p>
              </div>
              <Gamepad2 className="w-6 h-6 text-primary" strokeWidth={2.5} />
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-primary font-bold text-sm">{venue.deal || "Open Play Available"}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center p-8 border-2 border-dashed border-slate-700 rounded-lg">
            <p className="text-slate-500 font-bold uppercase">No Active Arcades</p>
        </div>
      )}
    </div>
  );
};
