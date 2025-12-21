import React from 'react';
import { Calendar, MapPin, Share2, Plus } from 'lucide-react';

export const EventsScreen: React.FC = () => {
  return (
    <div className="bg-background text-white min-h-screen p-4 font-body">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-primary tracking-wider font-league uppercase">EVENT WIRE</h1>
        <p className="text-sm font-bold text-slate-300 uppercase italic">Citywide Feeds</p>
      </div>

      {/* Featured Event Card */}
      <div className="bg-surface rounded-lg border border-slate-700 shadow-[4px_4px_0px_0px_#000] p-0 mb-6 overflow-hidden">
        <div className="bg-primary p-3 flex justify-between items-center border-b-2 border-black">
          <span className="text-black font-black text-xs uppercase tracking-widest font-league">FEATURED EVENT</span>
          <Calendar className="w-5 h-5 text-black" strokeWidth={3} />
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-black text-white font-league uppercase leading-none">ANNUAL POOL TOURNAMENT</h2>
            <div className="bg-black text-primary text-[10px] font-black px-2 py-1 transform -skew-x-12">
              BIG PRIZES
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <MapPin size={14} className="text-primary" />
            <span className="text-xs font-bold uppercase">EASTSIDE CLUB TAVERN • 7:00 PM</span>
          </div>

          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            The valley's best stick-smiths gather at the Eastside. Double elimination. $20 Entry.
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

      {/* Upcoming Feed */}
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 font-league">CITYWIDE FEED</h3>
      <div className="space-y-3">
        {[
          { event: "UPSTAIRS COMEDY NIGHT", venue: "THE CRYPT", date: "MON 12/30", time: "8PM" },
          { event: "PUNK ROCK FLEA MARKET", venue: "BROHO LOT", date: "TUE 12/31", time: "2PM" }
        ].map((item, i) => (
          <div key={i} className="bg-surface/50 border border-white/5 p-4 flex justify-between items-center rounded-lg group hover:border-primary transition-colors cursor-pointer">
            <div className="flex gap-4 items-center">
              <div className="bg-slate-900 border border-white/10 px-2 py-1 rounded text-center min-w-[50px]">
                <span className="block text-primary font-black text-xs font-league">{item.date.split(' ')[1]}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">{item.date.split(' ')[0]}</span>
              </div>
              <div>
                <span className="block text-white font-black text-sm font-league uppercase group-hover:text-primary transition-colors">{item.event}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">{item.venue} • {item.time}</span>
              </div>
            </div>
            <Plus className="w-5 h-5 text-slate-700 group-hover:text-primary" strokeWidth={3} />
          </div>
        ))}
      </div>
    </div>
  );
};
