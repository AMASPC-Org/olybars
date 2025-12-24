import React, { useState, useMemo } from 'react';
import { Clock, Beer, AlertCircle } from 'lucide-react';
import { PULSE_CONFIG } from '../../../config/pulse';

interface Deal {
  id: string;
  name: string;
  timeRemaining: number; // in hours
}

/**
 * LcbCompliantCheckin
 * 
 * COMPLIANCE METRICS:
 * 1. Rule 3: Max 2 check-ins per 12-hour window.
 * 2. Happy Hour Sorting: Prioritize by TimeRemaining, push >4h to bottom.
 */
export const LcbCompliantCheckin: React.FC = () => {
  const [checkInTimestamps, setCheckInTimestamps] = useState<number[]>([]);

  // Rule 3: Enforcement Logic
  const canCheckIn = useMemo(() => {
    const lcbWindowAgo = Date.now() - PULSE_CONFIG.WINDOWS.LCB_WINDOW;
    const recentCheckIns = checkInTimestamps.filter(ts => ts > lcbWindowAgo);
    return recentCheckIns.length < 2;
  }, [checkInTimestamps]);

  const handleCheckIn = () => {
    if (canCheckIn) {
      setCheckInTimestamps([...checkInTimestamps, Date.now()]);
      console.log('Check-in successful and logged within LCB limits.');
    } else {
      console.warn('LCB RESTRICTION: Maximum check-in frequency reached (2 per 12h).');
    }
  };

  // Happy Hour Sorting Logic
  const deals: Deal[] = [
    { id: '1', name: 'Craft Pitcher Special', timeRemaining: 1.5 },
    { id: '2', name: 'Late Night Wells', timeRemaining: 5.0 },
    { id: '3', name: 'Happy Hour Sliders', timeRemaining: 0.5 },
    { id: '4', name: 'Game Day Bucket', timeRemaining: 4.5 },
  ];

  const sortedDeals = useMemo(() => {
    return [...deals].sort((a, b) => {
      const priorityThreshold = PULSE_CONFIG.THRESHOLDS.BUZZ_CLOCK_PRIORITY / 60; // Convert mins to hours
      const aIsLong = a.timeRemaining > priorityThreshold;
      const bIsLong = b.timeRemaining > priorityThreshold;

      // Primary Sort: Push long-running deals to bottom
      if (aIsLong && !bIsLong) return 1;
      if (!aIsLong && bIsLong) return -1;

      // Secondary Sort: Ascending by TimeRemaining
      return a.timeRemaining - b.timeRemaining;
    });
  }, [deals]);

  return (
    <div className="p-6 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-2xl max-w-md mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-amber-500 font-oswald tracking-wide flex items-center gap-2">
          <Clock className="w-6 h-6" /> LEAGUE PASSPORT
        </h2>
        <p className="text-slate-400 text-sm font-roboto-condensed italic">Powered by Well 80</p>
      </header>

      <section className="mb-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium">Check-in Status</span>
          {canCheckIn ? (
            <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">AVAILABLE</span>
          ) : (
            <span className="text-xs px-2 py-1 bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30">LOCKED (Rule 3)</span>
          )}
        </div>

        <button
          onClick={handleCheckIn}
          disabled={!canCheckIn}
          className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 ${canCheckIn
            ? 'bg-amber-500 text-slate-900 hover:bg-amber-400 active:scale-95 shadow-lg shadow-amber-500/20'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed grayscale'
            }`}
        >
          Check In Now
        </button>

        {!canCheckIn && (
          <p className="mt-3 text-[10px] text-rose-400/80 leading-tight flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5" />
            WA LCB mandates a limit of 2 passport check-ins per 12-hour period.
          </p>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold text-amber-500/90 font-oswald mb-4 flex items-center gap-2">
          <Beer className="w-5 h-5" /> CURRENT DEALS
        </h3>
        <div className="space-y-3">
          {sortedDeals.map(deal => (
            <div
              key={deal.id}
              className={`p-3 rounded border flex justify-between items-center ${deal.timeRemaining > (PULSE_CONFIG.THRESHOLDS.BUZZ_CLOCK_PRIORITY / 60)
                ? 'bg-slate-800/30 border-slate-700/50 opacity-60'
                : 'bg-slate-800 border-slate-700'
                }`}
            >
              <span className="font-roboto-condensed font-medium">{deal.name}</span>
              <span className={`text-xs font-mono ${deal.timeRemaining <= 1 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                {deal.timeRemaining}h
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
