import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Flame,
  Beer,
  Users,
  Trophy,
  ChevronRight,
  Crown,
} from 'lucide-react';
import { Venue, VenueStatus, UserProfile } from '../../../types';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { calculateDistance, metersToMiles } from '../../../utils/geoUtils';
import { isVenueOpen, getVenueStatus } from '../../../utils/venueUtils';

const PulseMeter = ({ status }: { status: VenueStatus }) => {
  if (status === 'chill') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/30 text-blue-200 text-xs font-bold border border-blue-800">
        <Beer className="w-3 h-3" /> Chill
      </span>
    );
  }

  if (status === 'lively') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-900/30 text-yellow-200 text-xs font-bold border border-yellow-800">
        <Users className="w-3 h-3" /> Lively
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/30 text-red-200 text-xs font-bold border border-red-800 animate-pulse">
      <Flame className="w-3 h-3" /> Buzzing
    </span>
  );
};

type FilterKind = 'status' | 'deals' | 'league' | 'near' | 'all';

const STATUS_ORDER: Record<VenueStatus, number> = {
  buzzing: 0,
  lively: 1,
  chill: 2,
};

// Main Screen
export const BuzzScreen: React.FC<{
  venues: Venue[];
  userProfile: UserProfile;
  userPoints: number;
  handleClockIn?: (v: Venue) => void;
  clockedInVenue?: string | null;
  handleVibeCheck?: (v: Venue, hasConsent?: boolean, photoUrl?: string) => void;
  lastVibeChecks?: Record<string, number>;
  lastGlobalVibeCheck?: number;
}> = ({ venues, userProfile, userPoints, handleClockIn, clockedInVenue, handleVibeCheck, lastVibeChecks, lastGlobalVibeCheck }) => {
  const isGuest = userProfile.role === 'guest';
  // Default: show ALL, but sort by Buzzing → Lively → Chill
  const [filterKind, setFilterKind] = useState<FilterKind>('all');
  const [statusFilter, setStatusFilter] = useState<VenueStatus | 'all'>('all');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const { coords } = useGeolocation();

  const applyFilter = (v: Venue): boolean => {
    if (filterKind === 'status') {
      if (statusFilter === 'all') return true;
      return v.status === statusFilter;
    }
    if (filterKind === 'deals') {
      return !!v.deal;
    }
    if (filterKind === 'league') {
      return !!v.leagueEvent || !!v.isHQ;
    }

    // Global Visibility Check
    if (v.isVisible === false) return false;

    // Home Pulse Specific: Hide closed bars unless featured
    const open = isVenueOpen(v);
    if (!open && !v.isFeatured) return false;

    // 'all' and 'near' -> no filter (just change sorting)
    return true;
  };

  const venuesWithDistance = venues.map(v => ({
    ...v,
    isOpen: isVenueOpen(v),
    hourStatus: getVenueStatus(v),
    distance: coords && v.location ? metersToMiles(calculateDistance(coords.latitude, coords.longitude, v.location.lat, v.location.lng)) : null
  }));

  const filteredVenues = [...venuesWithDistance]
    .filter(applyFilter)
    .sort((a, b) => {
      // 1. Featured Weighting (Primary Sort for Pulse)
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      if (a.isFeatured && b.isFeatured) {
        if ((a.featureWeight || 0) !== (b.featureWeight || 0)) {
          return (b.featureWeight || 0) - (a.featureWeight || 0);
        }
      }

      // 2. Open Status (Open > Last Call > Closed)
      if (a.hourStatus === 'open' && b.hourStatus !== 'open') return -1;
      if (a.hourStatus !== 'open' && b.hourStatus === 'open') return 1;
      if (a.hourStatus === 'last_call' && b.hourStatus === 'closed') return -1;
      if (a.hourStatus === 'closed' && b.hourStatus === 'last_call') return 1;

      if (filterKind === 'near' && a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }

      if (filterKind === 'deals') {
        const timeA = a.dealEndsIn !== undefined ? a.dealEndsIn : 9999;
        const timeB = b.dealEndsIn !== undefined ? b.dealEndsIn : 9999;

        const isShortA = timeA <= 240;
        const isShortB = timeB <= 240;

        if (isShortA !== isShortB) {
          return isShortA ? -1 : 1;
        }
        return timeA - timeB;
      }

      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    });

  const onClockIn = (venue: Venue) => {
    if (handleClockIn) handleClockIn(venue);
    else console.log('Clocking in to', venue.name);
  };

  const statusLabel = (() => {
    if (statusFilter === 'buzzing') return '🔥 Buzzing';
    if (statusFilter === 'lively') return '👥 Lively';
    if (statusFilter === 'chill') return '🍺 Chill';
    return 'All Activity';
  })();

  // Treat "All" as a status-mode view for styling (chip stays highlighted)
  const statusActive = filterKind === 'status' || filterKind === 'all';
  const dealsActive = filterKind === 'deals';
  const leagueActive = filterKind === 'league';

  const baseChipClasses =
    'px-3 py-1.5 text-xs font-bold rounded-full border transition-all whitespace-nowrap';

  return (
    <div className="bg-background min-h-screen pb-24 font-sans text-slate-100">
      <div className="p-4 space-y-6">
        {/* Header + filter controls */}
        <div className="space-y-3">
          {/* Centered title + spots count */}
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-white text-xl font-bold tracking-tight text-center">
              The Oly Pulse
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              {filteredVenues.length} Spots Active
            </span>
          </div>

          {!isGuest && (
            <div className="bg-slate-900/50 border-2 border-primary/20 p-4 rounded-xl flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg">
                  <Trophy className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Your Pulse Progress</h4>
                  <p className="text-xl font-black text-white font-mono">{userPoints.toLocaleString()} <span className="text-[10px] text-primary font-bold ml-1">PTS</span></p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-primary mb-1 uppercase">League Rank</div>
                <div className="bg-black border border-white/20 px-2 py-0.5 rounded text-white font-black text-xs">#42</div>
              </div>
            </div>
          )}

          {/* Filter controls: Status dropdown + Deals + League */}
          <div className="flex justify-center items-center gap-2 pb-2 flex-wrap">
            {/* Status dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  // staying in "status family" (status/all), just toggle menu
                  setFilterKind((prev) =>
                    prev === 'deals' || prev === 'league' ? 'status' : prev,
                  );
                  setShowStatusMenu((prev) => !prev);
                }}
                className={`${baseChipClasses} ${statusActive
                  ? 'bg-primary text-black border-primary'
                  : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'
                  } flex items-center gap-1.5`}
              >
                {statusLabel}
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${showStatusMenu ? 'rotate-90' : ''
                    }`}
                />
              </button>

              {showStatusMenu && (
                <div className="absolute mt-1 left-0 z-20 bg-surface border border-slate-700 rounded-md shadow-lg overflow-hidden text-xs font-bold">
                  <button
                    onClick={() => {
                      setStatusFilter('buzzing');
                      setFilterKind('status');
                      setShowStatusMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Flame className="w-3 h-3" /> 🔥 Buzzing
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('lively');
                      setFilterKind('status');
                      setShowStatusMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Users className="w-3 h-3" /> 👥 Lively
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('chill');
                      setFilterKind('status');
                      setShowStatusMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Beer className="w-3 h-3" /> 🍺 Chill
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setFilterKind('all');
                      setShowStatusMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Clock className="w-3 h-3" /> All Activity
                  </button>
                </div>
              )}
            </div>

            {/* Deals chip */}
            <button
              onClick={() => {
                setShowStatusMenu(false);
                setFilterKind((prev) =>
                  prev === 'deals' ? 'all' : 'deals',
                );
              }}
              className={`${baseChipClasses} ${dealsActive
                ? 'bg-primary text-black border-primary'
                : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
            >
              💰 Deals
            </button>

            {/* League chip */}
            <button
              onClick={() => {
                setShowStatusMenu(false);
                setFilterKind((prev) =>
                  prev === 'league' ? 'all' : 'league',
                );
              }}
              className={`${baseChipClasses} ${leagueActive
                ? 'bg-primary text-black border-primary'
                : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
            >
              🏆 League
            </button>
          </div>
        </div>

        {/* Artie's Weekly Recommendations */}
        <div className="mt-8 mb-4 bg-gradient-to-br from-primary/10 to-surface border-2 border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700" />

          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight font-league">Artie's Weekly Buzz</h3>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Recommended for you</p>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:border-primary/50 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-black text-primary uppercase">🔥 Trivia Champ night</span>
                <span className="text-[10px] text-slate-500 font-bold">Starts 7PM</span>
              </div>
              <p className="text-sm font-bold text-white mb-2 font-league uppercase">Legions Arcade Trivia</p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full font-bold uppercase">Double Points</span>
                <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full font-bold uppercase">No Cover</span>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:border-primary/50 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-black text-primary uppercase">🎤 Karaoke Legends</span>
                <span className="text-[10px] text-slate-500 font-bold">Starts 9PM</span>
              </div>
              <p className="text-sm font-bold text-white mb-2 font-league uppercase">China Clipper Karaoke</p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full font-bold uppercase">+25 Pts Bonus</span>
                <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full font-bold uppercase">Happy Hour extended</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-3 border-2 border-primary/40 rounded-xl text-primary font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
            View All Weekly Recommendations
          </button>
        </div>

        {/* List */}
        {venues.length === 0 ? (
          <div className="text-center py-12 bg-surface/30 rounded-xl border border-dashed border-slate-700">
            <p className="text-slate-500 text-sm mb-3">
              Unable to load venues. Check your connection.
            </p>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-12 bg-surface/30 rounded-xl border border-dashed border-slate-700">
            <p className="text-slate-500 text-sm mb-3">
              No venues match this vibe right now.
            </p>
            <button
              onClick={() => {
                setFilterKind('all');
                setStatusFilter('all');
                setShowStatusMenu(false);
              }}
              className="text-primary font-bold text-sm hover:underline"
            >
              Reset to All Activity
            </button>
          </div>
        ) : (
          filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="bg-surface rounded-xl border border-slate-700 p-4 shadow-lg active:scale-[0.99] transition-transform duration-100 mb-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg text-white">
                      {venue.name}
                    </h4>
                    {venue.isHQ && (
                      <Crown className="w-4 h-4 text-primary fill-current" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {venue.type}{' '}
                    <span className="text-slate-500 italic">
                      &quot;{venue.vibe}&quot;
                    </span>
                    {venue.distance !== null && (
                      <span className="ml-2 text-primary font-bold">
                        • {venue.distance.toFixed(1)} mi
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <PulseMeter status={venue.status} />
                  {venue.hourStatus === 'last_call' && (
                    <span className="text-[10px] text-white font-black bg-red-600 px-2 py-0.5 rounded transform -skew-x-12 animate-pulse mt-1">
                      LAST CALL 🕒
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-bold mt-1">
                    {venue.checkIns} Checked In
                  </span>
                </div>
              </div>

              {venue.leagueEvent && (
                <div className="mb-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-3 border border-slate-700/50 flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-primary/20 p-1.5 rounded-md text-primary">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-primary font-bold uppercase tracking-wide">
                        League Night
                      </p>
                      <p className="text-sm font-bold text-white capitalize">
                        {venue.leagueEvent}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary" />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (handleVibeCheck) handleVibeCheck(venue);
                  }}
                  className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-2 shadow-sm ${(() => {
                    const now = Date.now();
                    const lastCheck = lastVibeChecks?.[venue.id];
                    const isVenueCooldown = lastCheck && (now - lastCheck) < 60 * 60 * 1000;

                    const lastGlobal = lastGlobalVibeCheck;
                    const isGlobalCooldown = lastGlobal && (now - lastGlobal) < 30 * 60 * 1000;

                    return (isVenueCooldown || isGlobalCooldown)
                      ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-primary/5 border-primary/30 text-primary hover:bg-primary/10';
                  })()}`}
                >
                  {(() => {
                    const now = Date.now();
                    const lastCheck = lastVibeChecks?.[venue.id];
                    const isVenueCooldown = lastCheck && (now - lastCheck) < 60 * 60 * 1000;

                    const lastGlobal = lastGlobalVibeCheck;
                    const isGlobalCooldown = lastGlobal && (now - lastGlobal) < 30 * 60 * 1000;

                    if (isVenueCooldown) {
                      const minsLeft = Math.ceil((60 * 60 * 1000 - (now - lastCheck)) / 60000);
                      return `Locked (${minsLeft}m)`;
                    }
                    if (isGlobalCooldown) {
                      const minsLeft = Math.ceil((30 * 60 * 1000 - (now - lastGlobal)) / 60000);
                      return `Global (${minsLeft}m)`;
                    }
                    return (
                      <>
                        <Users className="w-3.5 h-3.5" /> Vibe Check (+5)
                      </>
                    );
                  })()}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClockIn(venue);
                  }}
                  disabled={clockedInVenue === venue.id}
                  className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${clockedInVenue === venue.id
                    ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                    : 'bg-primary text-black hover:bg-primary/90 shadow-primary/20'
                    }`}
                >
                  {clockedInVenue === venue.id ? (
                    'Joined'
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5" /> Clock In
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
``