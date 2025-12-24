import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Flame, Beer, Star, Users, MapPin,
  Trophy, ChevronRight, Crown, Search, Filter,
  Bot, Clock, Zap
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

type FilterKind = 'status' | 'deals' | 'league' | 'tonight' | 'near' | 'all';

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
  const navigate = useNavigate();
  const [filterKind, setFilterKind] = useState<FilterKind>('all');
  const [statusFilter, setStatusFilter] = useState<VenueStatus | 'all'>('all');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const { coords } = useGeolocation();

  // Rotation Logic (shifts every 5 minutes)
  const rotationOffset = React.useMemo(() => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    return Math.floor(totalMinutes / 5) % Math.max(1, venues.length);
  }, [venues.length]);

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
    if (filterKind === 'tonight') {
      return !!v.leagueEvent;
    }

    // Global Visibility Check
    if (v.isVisible === false || v.isActive === false) return false;

    // Home Pulse Specific: Hide closed bars unless featured
    const open = isVenueOpen(v);
    if (!open && !v.isFeatured) return false;

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
        if (isShortA !== isShortB) return isShortA ? -1 : 1;
        return timeA - timeB;
      }

      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    });

  const isFallbackActive = filteredVenues.length === 0 && venuesWithDistance.length > 0;

  const displayVenues = isFallbackActive
    ? [...venuesWithDistance].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    }).map((v, i, arr) => {
      const shiftedIndex = (i + rotationOffset) % arr.length;
      return arr[shiftedIndex];
    })
    : filteredVenues;

  const onClockIn = (venue: Venue) => {
    if (handleClockIn) handleClockIn(venue);
    else console.log('Clocking in to', venue.name);
  };

  const statusLabel = (() => {
    if (statusFilter === 'buzzing') return '🔥 Buzzing';
    if (statusFilter === 'lively') return '👥 Lively';
    if (statusFilter === 'chill') return '🍺 Chill';
    if (filterKind === 'tonight') return '🌙 Tonight';
    return 'All Activity';
  })();

  const statusActive = filterKind === 'status' || filterKind === 'all';
  const dealsActive = filterKind === 'deals';
  const leagueActive = filterKind === 'league';
  const tonightActive = filterKind === 'tonight';

  const baseChipClasses = 'px-3 py-1.5 text-xs font-bold rounded-full border transition-all whitespace-nowrap';

  return (
    <div className="bg-background min-h-screen pb-24 font-sans text-slate-100">
      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-white text-xl font-bold tracking-tight text-center font-league uppercase">
              The Oly Pulse
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              {filteredVenues.length} Spots Active
            </span>
          </div>

          <div className="flex justify-center items-center gap-2 pb-2 flex-wrap">
            <div className="relative">
              <button
                onClick={() => {
                  setFilterKind((prev) => (prev === 'deals' || prev === 'league' || prev === 'tonight' ? 'status' : prev));
                  setShowStatusMenu((prev) => !prev);
                }}
                className={`${baseChipClasses} ${statusActive ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'} flex items-center gap-1.5`}
              >
                {statusLabel}
                <ChevronRight className={`w-3 h-3 transition-transform ${showStatusMenu ? 'rotate-90' : ''}`} />
              </button>

              {showStatusMenu && (
                <div className="absolute mt-1 left-0 z-20 bg-surface border border-slate-700 rounded-md shadow-lg overflow-hidden text-xs font-bold">
                  {[
                    { id: 'buzzing', label: '🔥 Buzzing', icon: Flame },
                    { id: 'lively', label: '👥 Lively', icon: Users },
                    { id: 'chill', label: '🍺 Chill', icon: Beer },
                    { id: 'all', label: 'All Activity', icon: Clock }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (option.id === 'all') {
                          setStatusFilter('all');
                          setFilterKind('all');
                        } else {
                          setStatusFilter(option.id as VenueStatus);
                          setFilterKind('status');
                        }
                        setShowStatusMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <option.icon className="w-3 h-3" /> {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => { setShowStatusMenu(false); setFilterKind((prev) => (prev === 'deals' ? 'all' : 'deals')); }}
              className={`${baseChipClasses} ${dealsActive ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'}`}
            >
              💰 Deals
            </button>
            <button
              onClick={() => { setShowStatusMenu(false); setFilterKind((prev) => (prev === 'league' ? 'all' : 'league')); }}
              className={`${baseChipClasses} ${leagueActive ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'}`}
            >
              🏆 League
            </button>
            <button
              onClick={() => { setShowStatusMenu(false); setFilterKind((prev) => (prev === 'tonight' ? 'all' : 'tonight')); }}
              className={`${baseChipClasses} ${tonightActive ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'}`}
            >
              🌙 Tonight
            </button>
          </div>
        </div>

        <div className="relative group/list">
          {/* JOIN THE LEAGUE CONVERSION BANNER (FOR GUESTS) */}
          {isGuest && (
            <div className="mb-6 px-1">
              <button
                onClick={() => navigate('/league')}
                className="w-full bg-primary border-4 border-black p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between group active:scale-[0.98] transition-all"
              >
                <div className="text-left">
                  <h3 className="text-black font-league font-black text-xl uppercase leading-none mb-1">Join the League</h3>
                  <p className="text-black text-[10px] font-bold uppercase opacity-70">Standings • Prizes • Local Pride</p>
                </div>
                <div className="bg-black text-white p-2 rounded-lg">
                  <Trophy size={20} />
                </div>
              </button>
            </div>
          )}

          <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar pb-12 transition-all">
            {/* 1. Paid Position: League Spotlight (Featured) */}
            {!isFallbackActive && venuesWithDistance.filter(v => v.isFeatured && v.isOpen).slice(0, 1).map(spotlight => (
              <div key={`spotlight-${spotlight.id}`} className="bg-gradient-to-br from-slate-900 to-black rounded-2xl border-2 border-primary/40 p-1 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-bl-xl z-10 shadow-lg">
                  Spotlight
                </div>
                <div className="bg-surface rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/venues/${spotlight.id}`} className="hover:text-primary transition-colors">
                          <h4 className="font-bold text-lg text-white">{spotlight.name}</h4>
                        </Link>
                        <Crown className="w-4 h-4 text-primary fill-current" />
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {spotlight.type} <span className="text-slate-500 italic">"{spotlight.vibe}"</span>
                      </p>
                    </div>
                    <PulseMeter status={spotlight.status} />
                  </div>
                  <p className="text-xs text-slate-300 font-medium mb-4 line-clamp-1 italic">
                    {spotlight.deal || spotlight.description || "The heart of Oly's bar scene."}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/venues/${spotlight.id}`)}
                      className="flex-1 py-3 bg-primary text-black rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-primary/90 transition-all"
                    >
                      Visit Spot
                    </button>
                    <button
                      onClick={() => onClockIn(spotlight)}
                      disabled={clockedInVenue === spotlight.id}
                      className="px-4 py-3 bg-slate-800 text-white rounded-lg font-black text-[10px] uppercase tracking-wider border border-slate-700 disabled:opacity-50"
                    >
                      {clockedInVenue === spotlight.id ? 'Joined' : 'Clock In'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {isFallbackActive && (
              <div className="flex flex-col items-center justify-center p-6 bg-primary/5 border border-primary/20 rounded-2xl mb-6 text-center">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h4 className="text-sm font-black text-primary uppercase tracking-widest font-league">League Spotlight</h4>
                </div>
                {/* Spotlight Placeholder: Hannah's */}
                <div className="w-full bg-slate-900/50 border border-primary/20 rounded-xl p-4 flex justify-between items-center group/hannah hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      <Star className="w-5 h-5 text-primary fill-primary" />
                    </div>
                    <div className="text-left">
                      <h5 className="text-sm font-black text-white uppercase italic tracking-wide">Hannah's Bar & Grill</h5>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Featured 98501 Original</p>
                    </div>
                  </div>
                  {(() => {
                    const hannahs = venues.find(v => v.name.toLowerCase().includes("hannah"));
                    return (
                      <Link
                        to={`/venues/${hannahs?.id || 'hannahs'}`}
                        className="text-[10px] font-black text-primary uppercase border-b-2 border-primary/50 hover:border-primary transition-all pb-0.5"
                      >
                        Explore
                      </Link>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* 2. Main Pulse List */}
            {displayVenues
              .filter(v => !(!isFallbackActive && v.isFeatured && v.isOpen)) // Don't repeat the spotlighted venue if it's already at top
              .map((venue) => (
                <div key={venue.id} className={`bg-surface rounded-xl border p-4 shadow-lg transition-transform duration-100 ${isFallbackActive ? 'border-primary/10 bg-slate-900/40 opacity-80' : 'border-slate-800'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/venues/${venue.id}`} className="hover:text-primary transition-colors">
                          <h4 className="font-bold text-lg text-white">{venue.name}</h4>
                        </Link>
                        {venue.isHQ && <Crown className="w-4 h-4 text-primary fill-current" />}
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {venue.type} <span className="text-slate-500 italic">"{venue.vibe}"</span>
                        {venue.distance !== null && <span className="ml-2 text-primary font-bold">• {venue.distance.toFixed(1)} mi</span>}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <PulseMeter status={venue.status} />
                      {venue.hourStatus === 'last_call' && <span className="text-[10px] text-white font-black bg-red-600 px-2 py-0.5 rounded transform -skew-x-12 animate-pulse mt-1">LAST CALL 🕒</span>}
                      <span className="text-[10px] text-slate-500 font-bold mt-1">{venue.checkIns} Checked In</span>
                    </div>
                  </div>

                  {venue.leagueEvent && (
                    <div onClick={() => navigate(`/venues/${venue.id}`)} className="mb-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-3 border border-slate-700/50 flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-primary/20 p-1.5 rounded-md text-primary"><Trophy className="w-4 h-4" /></div>
                        <div>
                          <p className="text-xs text-primary font-bold uppercase tracking-wide">League Night</p>
                          <p className="text-sm font-bold text-white capitalize">{venue.leagueEvent}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVibeCheck && handleVibeCheck(venue)}
                      className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-2 shadow-sm ${(() => {
                        const now = Date.now();
                        const lastCheck = lastVibeChecks?.[venue.id];
                        const isVenueCooldown = lastCheck && (now - lastCheck) < 60 * 60 * 1000;
                        const lastGlobal = lastGlobalVibeCheck;
                        const isGlobalCooldown = lastGlobal && (now - lastGlobal) < 30 * 60 * 1000;
                        return (isVenueCooldown || isGlobalCooldown) ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed' : 'bg-primary/5 border-primary/30 text-primary hover:bg-primary/10';
                      })()}`}
                    >
                      <Users size={14} strokeWidth={3} /> Vibe Check (+5)
                    </button>
                    <button
                      onClick={() => onClockIn(venue)}
                      disabled={clockedInVenue === venue.id}
                      className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${clockedInVenue === venue.id ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : 'bg-primary text-black hover:bg-primary/90 shadow-primary/20'}`}
                    >
                      {clockedInVenue === venue.id ? 'Joined' : <><MapPin className="w-3.5 h-3.5" /> Clock In</>}
                    </button>
                  </div>
                </div>
              ))}
          </div>
          {/* Bottom Fade indicating more content */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
        </div>

        {/* Artie's Weekly Recommendations - Moved to Bottom */}
        <div className="mt-12 bg-gradient-to-br from-primary/10 to-surface border-2 border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
              <Bot className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight font-league">Artie's Weekly Buzz</h3>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Personalized Highlights</p>
            </div>
          </div>

          {!userProfile.weeklyBuzz ? (
            <div className="relative z-10 space-y-6">
              <div className="space-y-4">
                {[
                  { icon: Star, text: 'Custom bar picks based on your favorite drinks and vibes.' },
                  { icon: Zap, text: 'Early access to exclusive "Artie-Only" drink promos.' },
                  { icon: Trophy, text: 'Score an extra 50 points just for joining the weekly report.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/20 p-1 rounded-full"><item.icon className="w-3 h-3 text-primary" /></div>
                    <p className="text-[11px] font-bold text-slate-300 uppercase leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-primary text-black font-league font-black text-sm uppercase tracking-widest rounded-xl shadow-xl hover:scale-[1.02] transition-transform active:scale-95">
                SIGN UP FOR WEEKLY BUZZ
              </button>
              <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-tighter italic">Your data stays in the 98501. No spam, just vibe.</p>
            </div>
          ) : (
            <div className="space-y-3 relative z-10">
              {[
                { title: 'Trivia Champ night', venue: 'Legions Arcade Trivia', text: '🔥 Starts 7PM', chips: ['Double Points', 'No Cover'] },
                { title: 'Karaoke Legends', venue: 'China Clipper Karaoke', text: '🎤 Starts 9PM', chips: ['+25 Pts Bonus', 'Happy Hour extended'] }
              ].map((rec, idx) => (
                <div key={idx} className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:border-primary/50 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-black text-primary uppercase">{rec.title}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{rec.text}</span>
                  </div>
                  <p className="text-sm font-bold text-white mb-2 font-league uppercase">{rec.venue}</p>
                  <div className="flex items-center gap-2">
                    {rec.chips.map(chip => (
                      <span key={chip} className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full font-bold uppercase">{chip}</span>
                    ))}
                  </div>
                </div>
              ))}
              <button className="w-full mt-4 py-3 border-2 border-primary/40 rounded-xl text-primary font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
                View All Weekly Recommendations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};