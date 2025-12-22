import React from 'react';
import { Calendar, MapPin, Share2, Plus } from 'lucide-react';
import { Venue } from '../../../types';

interface EventsScreenProps {
  venues: Venue[];
}

export const EventsScreen: React.FC<EventsScreenProps> = ({ venues }) => {
  const featuredEventVenue = venues.find(v => v.leagueEvent === 'events');
  const otherEventVenues = venues.filter(v => v.leagueEvent && v.leagueEvent !== 'events');

  return (
    <div className="bg-background text-white min-h-screen p-4 font-body">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1" />
        <div className="text-center flex-1">
          <h1 className="text-3xl font-black text-primary tracking-wider font-league uppercase">EVENTS</h1>
          <p className="text-sm font-bold text-slate-300 uppercase italic">Citywide Feeds</p>
        </div>
        <div className="flex-1 flex justify-end">
          <button
            onClick={() => alert("Post to the Wire is coming soon!")}
            className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary hover:bg-primary/20 transition-all"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Featured Event Card */}
      {featuredEventVenue ? (
        <div className="bg-surface rounded-lg border border-slate-700 shadow-[4px_4px_0px_0px_#000] p-0 mb-6 overflow-hidden">
          <div className="bg-primary p-3 flex justify-between items-center border-b-2 border-black">
            <span className="text-black font-black text-xs uppercase tracking-widest font-league">FEATURED EVENT</span>
            <Calendar className="w-5 h-5 text-black" strokeWidth={3} />
          </div>

          <div className="p-5">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-black text-white font-league uppercase leading-none">{featuredEventVenue.name} EVENT</h2>
              <div className="bg-black text-primary text-[10px] font-black px-2 py-1 transform -skew-x-12">
                BIG PRIZES
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400 mb-4">
              <MapPin size={14} className="text-primary" />
              <span className="text-xs font-bold uppercase">{featuredEventVenue.name} • {featuredEventVenue.hours as string || 'TONIGHT'}</span>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {featuredEventVenue.deal || "Join us for a special league event! Earn double points and compete for glory."}
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-primary hover:bg-yellow-400 text-black font-black py-4 rounded-md transition-all flex items-center justify-center gap-2 font-league uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <Plus size={18} strokeWidth={3} /> JOIN LIST
              </button>
              <button className="bg-slate-700 hover:bg-slate-600 text-white font-black py-4 rounded-md transition-all flex items-center justify-center gap-2 font-league uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <Share2 size={18} strokeWidth={3} /> SHARE
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-slate-700 p-8 text-center mb-6">
          <p className="text-slate-500 font-bold uppercase">No Featured Events Today</p>
        </div>
      )}

      {/* Upcoming Feed */}
      {otherEventVenues.length > 0 && (
        <>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 font-league">CITYWIDE FEED</h3>
          <div className="space-y-3">
            {otherEventVenues.map((v, i) => (
              <div key={i} className="bg-surface/50 border border-white/5 p-4 flex justify-between items-center rounded-lg group hover:border-primary transition-colors cursor-pointer">
                <div className="flex gap-4 items-center">
                  <div className="bg-slate-900 border border-white/10 px-2 py-1 rounded text-center min-w-[50px]">
                    <span className="block text-primary font-black text-xs font-league">{v.leagueEvent?.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="block text-white font-black text-sm font-league uppercase group-hover:text-primary transition-colors">{v.name}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{v.vibe} • {v.checkIns} Checked In</span>
                  </div>
                </div>
                <Plus className="w-5 h-5 text-slate-700 group-hover:text-primary" strokeWidth={3} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
