import React, { useState, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { GlobalSearch } from '../../../components/features/search/GlobalSearch';
import {
  Flame, Beer, Star, Users, MapPin,
  Trophy, ChevronRight, Crown, Search, Filter,
  Bot, Clock, Zap, Gamepad2, ShieldCheck
} from 'lucide-react';
import { Venue, VenueStatus, UserProfile } from '../../../types';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { calculateDistance, metersToMiles } from '../../../utils/geoUtils';
import { isVenueOpen, getVenueStatus } from '../../../utils/venueUtils';
import { PULSE_CONFIG } from '../../../config/pulse';
import { barGames } from '../../../data/barGames';
import { TAXONOMY_PLAY, TAXONOMY_FEATURES, TAXONOMY_EVENTS } from '../../../data/taxonomy';

const SkeletonCard = () => (
  <div className="bg-surface rounded-xl border border-slate-800 p-4 shadow-lg animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="space-y-2">
        <div className="h-6 w-48 bg-slate-800 rounded"></div>
        <div className="h-3 w-32 bg-slate-800 rounded"></div>
      </div>
      <div className="h-6 w-20 bg-slate-800 rounded-full"></div>
    </div>
    <div className="h-10 w-full bg-slate-800 rounded mb-4"></div>
    <div className="flex gap-2">
      <div className="h-10 flex-1 bg-slate-800 rounded"></div>
      <div className="h-10 flex-1 bg-slate-800 rounded"></div>
    </div>
  </div>
);

const PulseMeter = ({ status }: { status: VenueStatus }) => {
  if (status === 'dead') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">
        <Clock className="w-3 h-3" /> Dead
      </span>
    );
  }

  if (status === 'chill') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/30 text-blue-200 text-xs font-bold border border-blue-800">
        <Beer className="w-3 h-3" /> Chill
      </span>
    );
  }


  if (status === 'buzzing') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/30 text-red-200 text-xs font-bold border border-red-800 animate-pulse">
        <Flame className="w-3 h-3" /> Buzzing
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-900/30 text-pink-200 text-xs font-bold border border-pink-800 animate-pulse">
      <Zap className="w-3 h-3" /> Packed
    </span>
  );
};

type FilterKind = 'status' | 'deals' | 'league' | 'tonight' | 'near' | 'games' | 'play' | 'features' | 'events' | 'all';

const STATUS_ORDER: Record<VenueStatus, number> = {
  packed: 0,
  buzzing: 1,
  chill: 2,
  dead: 3,
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
  isLoading?: boolean;
  onToggleWeeklyBuzz?: () => void;
}> = ({ venues, userProfile, userPoints, handleClockIn, clockedInVenue, handleVibeCheck, lastVibeChecks, lastGlobalVibeCheck, isLoading = false, onToggleWeeklyBuzz }) => {
  const isGuest = userProfile.role === 'guest';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [filterKind, setFilterKind] = useState<FilterKind>('all');
  const [statusFilter, setStatusFilter] = useState<VenueStatus | 'all'>('all');
  const searchQuery = initialQuery; // Sync with URL
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const { coords } = useGeolocation();

  // Rotation Logic (shifts every 5 minutes) ensures global fairness
  const rotationOffset = React.useMemo(() => {
    const rotationInterval = 5 * 60 * 1000;
    return Math.floor(Date.now() / rotationInterval);
  }, []);

  const applyFilter = useCallback((v: Venue): boolean => {
    // Search Filter (Applies globally)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = v.name.toLowerCase().includes(q);
      const typeMatch = (v.venueType || '').replace('_', ' ').toLowerCase().includes(q);
      const vibeMatch = v.vibe?.toLowerCase().includes(q) || v.vibeTags?.some(tag => tag.replace('_', ' ').toLowerCase().includes(q));
      const addressMatch = v.address?.toLowerCase().includes(q);
      const dealMatch = v.deal?.toLowerCase().includes(q) || v.activeFlashBounty?.title?.toLowerCase().includes(q);
      // New: Search Game Features
      const gameMatch = v.gameFeatures?.some(f => f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q));

      // Upgrade: Search Amenities & Rituals
      const amenityMatch = v.amenities?.some(a => a.toLowerCase().includes(q));
      const scheduleMatch = v.weekly_schedule
        ? Object.values(v.weekly_schedule).flat().some(event => event.toLowerCase().includes(q))
        : false;

      // [NEW] Description & Nicknames (Universal Search Expansion)
      const descriptionMatch = v.description?.toLowerCase().includes(q) || v.eventDescription?.toLowerCase().includes(q) || v.historySnippet?.toLowerCase().includes(q);
      const nicknameMatch = v.nicknames?.some(n => n.toLowerCase().includes(q));
      const happyHourMatch = v.happyHourSimple?.toLowerCase().includes(q) || v.happyHourSpecials?.toLowerCase().includes(q) || v.happyHour?.description?.toLowerCase().includes(q);

      const isMatch = nameMatch || typeMatch || vibeMatch || addressMatch || dealMatch || gameMatch || amenityMatch || scheduleMatch || descriptionMatch || nicknameMatch || happyHourMatch;

      if (!isMatch) return false;

      // If we have a specific search, we generally ignore the 'Status' filter unless the user explicitly set it.
      // But for now, ifsearching, let's SHOW EVERYTHING matching the search, ignoring the "Buzzing/Chill" View.
      return true;
    }

    if (filterKind === 'status') {
      if (statusFilter === 'all') return true;
      return v.status === statusFilter;
    }
    const hasDeal = !!v.deal || !!(v.activeFlashBounty?.isActive && (v.activeFlashBounty.endTime || 0) > Date.now());
    if (filterKind === 'deals') {
      return hasDeal;
    }
    if (filterKind === 'league') {
      return !!v.leagueEvent || !!v.isHQ;
    }
    if (filterKind === 'tonight') {
      return !!v.leagueEvent;
    }

    if (filterKind === 'games' && selectedGame) {
      const g = selectedGame.toLowerCase();
      const hasFeature = v.gameFeatures?.some(f => f.name.toLowerCase().includes(g) || f.type.toLowerCase().includes(g));
      const hasEvent = v.leagueEvent?.toLowerCase().includes(g) || v.venueType.replace(/_/g, ' ').toLowerCase().includes(g);
      return !!(hasFeature || hasEvent);
    }

    // [NEW] Taxonomy Filters
    if (filterKind === 'play') {
      return v.gameFeatures?.some(gf =>
        TAXONOMY_PLAY.some(t =>
          gf.name.toLowerCase().includes(t.toLowerCase()) ||
          gf.type.toLowerCase().includes(t.toLowerCase())
        )
      ) ?? false;
    }

    if (filterKind === 'features') {
      const hasAmenity = v.amenities?.some(a =>
        TAXONOMY_FEATURES.some(t => a.toLowerCase().includes(t.toLowerCase()))
      );
      // Also check gameFeatures in case some "features" are stored there
      const hasFeature = v.gameFeatures?.some(gf =>
        TAXONOMY_FEATURES.some(t => gf.name.toLowerCase().includes(t.toLowerCase()))
      );
      return !!(hasAmenity || hasFeature);
    }

    if (filterKind === 'events') {
      const hasLeagueEvent = v.leagueEvent && TAXONOMY_EVENTS.some(t => v.leagueEvent?.toLowerCase().includes(t.toLowerCase()));
      const hasScheduleMatch = v.weekly_schedule && Object.values(v.weekly_schedule).flat().some(event =>
        TAXONOMY_EVENTS.some(t => event.toLowerCase().includes(t.toLowerCase()))
      );
      return !!(hasLeagueEvent || hasScheduleMatch);
    }

    // Global Visibility Check
    if (v.tier_config?.is_directory_listed === false || v.isActive === false) return false;

    // Home Pulse Specific: Hide closed bars unless part of the league
    const open = isVenueOpen(v);
    if (!open && !v.isPaidLeagueMember) return false;

    return true;
  }, [searchQuery, filterKind, statusFilter, selectedGame]);

  const venuesWithDistance = React.useMemo(() => venues.map(v => ({
    ...v,
    isOpen: isVenueOpen(v),
    hourStatus: getVenueStatus(v),
    distance: coords && v.location ? metersToMiles(calculateDistance(coords.latitude, coords.longitude, v.location.lat, v.location.lng)) : null
  })), [venues, coords]);

  const filteredVenues = React.useMemo(() => [...venuesWithDistance]
    .filter(applyFilter)
    .sort((a, b) => {
      // 1. Partner Priority (League Members) with Rotating Order
      // This allows partners to be at the top but prevents fixed ordering ("anti-drowning")
      const isAPartner = a.isPaidLeagueMember;
      const isBPartner = b.isPaidLeagueMember;

      if (isAPartner !== isBPartner) return isAPartner ? -1 : 1;

      // If both are partners OR both are non-partners, we could optionally rotate them
      // but the main requirement is that they don't drown each other out.
      // We'll use the rotationOffset to shuffle the order of partners among themselves.
      if (isAPartner && isBPartner) {
        // We use a pseudo-random but consistent shift for sorting
        const aHash = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const bHash = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return ((aHash + rotationOffset) % 100) - ((bHash + rotationOffset) % 100);
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
        const isShortA = timeA <= PULSE_CONFIG.THRESHOLDS.BUZZ_CLOCK_PRIORITY;
        const isShortB = timeB <= PULSE_CONFIG.THRESHOLDS.BUZZ_CLOCK_PRIORITY;
        if (isShortA !== isShortB) return isShortA ? -1 : 1;
        return timeA - timeB;
      }

      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    }), [venuesWithDistance, filterKind, statusFilter, applyFilter]);

  // --- NEW LOGIC: Buzz Clock (Happy Hours) & Flash Bounties ---
  const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const now = new Date();
  const currentHm = now.getHours() * 100 + now.getMinutes();

  const getHHTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 100 + m;
  };

  // 1. Check Active Happy Hours
  let buzzClockVenues = venues.filter(v => {
    // Check new unified field first
    if (v.happyHourSimple) {
      // For simple field, we don't have start/end times in a standard format easily parsable for "currently active"
      // unless we assume it's "all day" or "currently valid if present". 
      // But let's stick to the structured happyHour if it exists, otherwise use happyHourSimple as a fallback display.
    }
    if (!v.happyHour) return v.happyHourSimple ? true : false;
    if (v.happyHour.days && !v.happyHour.days.includes(currentDay)) return false;
    const startVal = getHHTime(v.happyHour.startTime);
    const endVal = getHHTime(v.happyHour.endTime);
    return currentHm >= startVal && currentHm < endVal;
  });

  let isUpcomingBuzz = false;

  // 2. Fallback to Upcoming Happy Hours (Today)
  if (buzzClockVenues.length === 0) {
    buzzClockVenues = venues.filter(v => {
      if (v.happyHourSimple) return false; // Simple ones show as "Live"
      if (!v.happyHour) return false;
      if (v.happyHour.days && !v.happyHour.days.includes(currentDay)) return false;
      const startVal = getHHTime(v.happyHour.startTime);
      return startVal > currentHm;
    }).sort((a, b) => {
      return getHHTime(a.happyHour!.startTime) - getHHTime(b.happyHour!.startTime);
    });
    if (buzzClockVenues.length > 0) isUpcomingBuzz = true;
  }

  const flashBountyVenues = venues.filter(v => {
    const hasFlatDeal = !!v.deal && (v.dealEndsIn || 0) > 0;
    const hasStructuredDeal = v.activeFlashBounty?.isActive && (v.activeFlashBounty.endTime || 0) > Date.now();
    return hasFlatDeal || hasStructuredDeal;
  });

  const isFallbackActive = filteredVenues.length === 0 && venuesWithDistance.length > 0;

  const displayVenues = isFallbackActive
    ? [...venuesWithDistance]
      .filter(v => v.tier_config?.is_directory_listed !== false && v.isActive !== false)
      .sort((a, b) => {
        // Priority 1: Partners (League Members)
        if (a.isPaidLeagueMember && !b.isPaidLeagueMember) return -1;
        if (!a.isPaidLeagueMember && b.isPaidLeagueMember) return 1;
        return 0;
      }).map((v, i, arr) => {
        const shiftedIndex = (i + (rotationOffset % (arr.length || 1))) % (arr.length || 1);
        return arr[shiftedIndex];
      })
    : filteredVenues;

  const onClockIn = (venue: Venue) => {
    if (handleClockIn) handleClockIn(venue);
    else console.log('Clocking in to', venue.name);
  };

  const statusLabel = (() => {
    if (statusFilter === 'packed') return '⚡ Packed';
    if (statusFilter === 'buzzing') return '🔥 Buzzing';
    if (statusFilter === 'chill') return '🍺 Chill';
    if (statusFilter === 'dead') return '💀 Dead';
    if (filterKind === 'tonight') return '🌙 Tonight';
    return 'All Activity';
  })();

  const statusActive = filterKind === 'status' || filterKind === 'all';
  const dealsActive = filterKind === 'deals';
  const leagueActive = filterKind === 'league';
  const tonightActive = filterKind === 'tonight';

  const baseChipClasses = 'px-3 py-1.5 text-xs font-bold rounded-full border transition-all whitespace-nowrap';

  const generateOrgSchema = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "OlyBars",
      "url": "https://olybars.com",
      "logo": "https://olybars.com/og-image.png",
      "description": "The Nightlife Operating System for Olympia, WA.",
      "sameAs": [
        "https://instagram.com/olybars"
      ]
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": "https://olybars.com",
      "name": "OlyBars",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://olybars.com/bars?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    return (
      <>
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      </>
    );
  };

  return (
    <div className="bg-background min-h-screen pb-24 font-sans text-slate-100">
      {generateOrgSchema()}
      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-white text-xl font-bold tracking-tight text-center font-league uppercase">
              The Oly Pulse
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                {filteredVenues.length} Spots Active
              </span>
              <span className="text-slate-700 font-black text-[10px]">•</span>
              <button
                onClick={() => navigate('/pulse-playbook')}
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-0.5"
              >
                How it Works <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* SEARCH BAR (Prominent Placement) - Unified Global Search */}
          <div className="mb-6">
            <GlobalSearch
              placeholder="SEARCH BARS, VIBES, OR DEALS..."
              variant="hero"
            />
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
                <div className="absolute mt-1 left-0 z-20 bg-surface border border-slate-700 rounded-md shadow-lg overflow-hidden text-xs font-bold min-w-[140px]">
                  {[
                    { id: 'packed', label: '⚡ Packed', icon: Zap },
                    { id: 'buzzing', label: '🔥 Buzzing', icon: Flame },
                    { id: 'chill', label: '🍺 Chill', icon: Beer },
                    { id: 'dead', label: '💀 Dead', icon: Clock },
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
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-3 transition-colors text-slate-200"
                    >
                      <option.icon className="w-3.5 h-3.5" /> {option.label}
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
            <button
              onClick={() => { setShowStatusMenu(false); setFilterKind((prev) => (prev === 'play' ? 'all' : 'play')); }}
              className={`${baseChipClasses} ${filterKind === 'play' ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'}`}
            >
              🎮 Play
            </button>
            <button
              onClick={() => { setShowStatusMenu(false); setFilterKind((prev) => (prev === 'features' ? 'all' : 'features')); }}
              className={`${baseChipClasses} ${filterKind === 'features' ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'}`}
            >
              🎱 Features
            </button>
            <button
              onClick={() => { setShowStatusMenu(false); setFilterKind((prev) => (prev === 'events' ? 'all' : 'events')); }}
              className={`${baseChipClasses} ${filterKind === 'events' ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'}`}
            >
              📅 Events
            </button>
          </div>
        </div>
        {/* FLASH BOUNTIES (Premium Carousel) */}
        {/* FLASH BOUNTIES (Premium Carousel) - Hidden when searching to show results immediately */}
        {!searchQuery && flashBountyVenues.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="bg-red-500 rounded-full p-1 animate-pulse">
                  <Zap className="w-3 h-3 text-white fill-current" />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest font-league">Live Flash Bounties</h4>
              </div>
              <div className="flex gap-1">
                {flashBountyVenues.map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                ))}
              </div>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {flashBountyVenues.slice(0, 3).map(fd => {
                const endTime = fd.activeFlashBounty?.endTime || (Date.now() + (fd.dealEndsIn || 0) * 60000);
                const minutesLeft = Math.max(0, Math.ceil((endTime - Date.now()) / 60000));

                return (
                  <div
                    key={fd.id}
                    onClick={() => navigate(`/venues/${fd.id}`)}
                    className="min-w-[85vw] md:min-w-[400px] snap-center bg-gradient-to-br from-red-600 to-red-900 rounded-2xl p-0.5 shadow-[0_0_40px_rgba(220,38,38,0.2)] relative overflow-hidden group active:scale-[0.97] transition-all shimmer-sweep"
                  >
                    <div className="bg-[#0b1222] rounded-[14px] p-5 h-full relative overflow-hidden flex flex-col justify-between">
                      {/* Decorative Background Elements */}
                      <div className="absolute -right-4 -top-4 w-32 h-32 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/15 transition-all duration-700" />
                      <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl transition-all" />

                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <h5 className="font-black text-white text-lg uppercase font-league leading-none group-hover:text-primary transition-colors">{fd.name}</h5>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{fd.venueType.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="bg-red-600 text-white px-3 py-1 rounded-lg flex flex-col items-center shadow-lg shadow-red-900/40">
                          <span className="text-[14px] font-black font-league leading-none">{minutesLeft}</span>
                          <span className="text-[8px] font-black uppercase tracking-tighter">MINS</span>
                        </div>
                      </div>

                      <div className="space-y-1 relative z-10">
                        <p className="text-2xl font-black text-primary uppercase font-league leading-tight tracking-tight">
                          {fd.activeFlashBounty?.title || fd.deal}
                        </p>
                        <p className="text-xs text-slate-400 font-medium line-clamp-1 italic">
                          {fd.activeFlashBounty?.description || 'Limited time offer! Get it while it lasts.'}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-5 h-5 rounded-full border border-[#0f172a] bg-slate-800" />
                            ))}
                          </div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {fd.checkIns > 0 ? `${fd.checkIns} Players Here` : 'Deal is Fresh'}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        <div className="relative group/list">
          {/* JOIN THE LEAGUE CONVERSION BANNER (FOR GUESTS) - Hidden when searching */}
          {!isLoading && isGuest && !searchQuery && (
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

            {isLoading && (
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}

            {/* 1. Partner Priority in Pulse List is handled via sorting logic */}

            {!isLoading && isFallbackActive && (
              <div className="flex flex-col items-center justify-center p-6 bg-primary/5 border border-primary/20 rounded-2xl mb-6 text-center">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h4 className="text-sm font-black text-primary uppercase tracking-widest font-league">League Partners</h4>
                </div>

                <div className="w-full space-y-3">
                  {displayVenues.slice(0, 3).map(v => (
                    <div key={`fallback-${v.id}`} className="w-full bg-slate-900/50 border border-primary/10 rounded-xl p-4 flex justify-between items-center group/item hover:bg-slate-900 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-lg group-hover/item:scale-110 transition-transform">
                          <Star className="w-4 h-4 text-primary fill-primary" />
                        </div>
                        <div className="text-left">
                          <h5 className="text-sm font-black text-white uppercase italic tracking-wide">{v.name}</h5>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{v.vibe}</p>
                        </div>
                      </div>
                      <Link
                        to={`/venues/${v.id}`}
                        className="text-[10px] font-black text-primary uppercase border-b-2 border-primary/50 hover:border-primary transition-all pb-0.5"
                      >
                        Explore
                      </Link>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">
                  Showing rotating partners to keep the vibe fresh
                </p>
              </div>
            )}

            {/* 2. Main Pulse List */}
            {!isLoading && displayVenues
              .filter(v => !(!isFallbackActive && v.isPaidLeagueMember && v.isOpen))
              .map((venue) => (
                <div
                  key={venue.id}
                  className={`bg-surface/50 backdrop-blur-sm rounded-2xl border-2 p-5 shadow-xl transition-all duration-300 relative group/card active:scale-[0.98] ${isFallbackActive ? 'border-slate-800/10 opacity-70 scale-95' :
                    venue.status === 'packed' ? 'border-red-500/30' :
                      venue.status === 'buzzing' ? 'border-primary/30 shadow-[0_4px_25px_-10px_rgba(251,191,36,0.15)]' :
                        'border-slate-800/60 hover:border-slate-700'
                    }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/venues/${venue.id}`} className="hover:text-primary transition-colors flex-shrink-0">
                          <h4 className="font-bold text-xl text-white font-league uppercase tracking-tight truncate max-w-[200px]">{venue.name}</h4>
                        </Link>
                        {venue.isHQ && <div className="text-primary animate-in zoom-in duration-500"><Crown className="w-4 h-4 fill-current" /></div>}
                        {venue.googleRating && (
                          <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded backdrop-blur-sm">
                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-[10px] font-black text-white">{venue.googleRating}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {(venue.venueType || 'venue').replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-700">•</span>
                        <span className="text-[10px] text-slate-400 font-medium italic truncate max-w-[120px]">
                          "{venue.vibe}"
                        </span>
                        {venue.distance !== null && (
                          <>
                            <span className="text-slate-700">•</span>
                            <span className="text-[10px] text-primary font-black tracking-tighter">{venue.distance.toFixed(1)} MI</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <PulseMeter status={venue.status} />
                      {venue.hourStatus === 'last_call' && (
                        <div className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse shadow-lg shadow-red-900/40">
                          LAST CALL
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operational Instrument Panel */}
                  <div className="flex items-center gap-2 mb-4">
                    {venue.manualStatusExpiresAt && venue.manualStatusExpiresAt > Date.now() && (
                      <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest font-league">
                        <ShieldCheck className="w-3 h-3" />
                        STAFF VERIFIED
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-slate-900/40 border border-white/5 px-2 py-1 rounded-lg">
                      <div className={`w-1.5 h-1.5 rounded-full ${venue.checkIns > 0 ? 'bg-primary animate-pulse' : 'bg-slate-700'}`} />
                      <span className="text-[10px] text-slate-400 font-black tracking-widest font-league">{venue.checkIns} CLOCKED IN</span>
                    </div>
                  </div>

                  {venue.leagueEvent && (
                    <div
                      onClick={() => navigate(`/venues/${venue.id}`)}
                      className="mb-5 bg-gradient-to-r from-slate-900 to-black rounded-xl p-4 border border-white/5 flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-all shadow-inner"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary border border-primary/20 shadow-lg">
                          <Trophy className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mb-0.5">TONIGHT'S EVENT</p>
                          <p className="text-sm font-black text-white uppercase font-league tracking-wide group-hover:text-primary transition-colors">
                            {venue.leagueEvent}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/5 p-2 rounded-full group-hover:bg-primary group-hover:text-black transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVibeCheck && handleVibeCheck(venue)}
                      className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all border-2 font-league ${(() => {
                        const now = Date.now();
                        const lastCheck = lastVibeChecks?.[venue.id];
                        const isVenueCooldown = lastCheck && (now - lastCheck) < 60 * 60 * 1000;
                        const lastGlobal = lastGlobalVibeCheck;
                        const isGlobalCooldown = lastGlobal && (now - lastGlobal) < 30 * 60 * 1000;
                        return (isVenueCooldown || isGlobalCooldown) ? 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-surface border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 active:scale-95';
                      })()}`}
                    >
                      <Users size={14} strokeWidth={3} className="text-primary" /> VIBE CHECK
                    </button>
                    <button
                      onClick={() => onClockIn(venue)}
                      disabled={clockedInVenue === venue.id}
                      className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all shadow-xl font-league ${clockedInVenue === venue.id
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : 'bg-primary text-black hover:bg-white hover:scale-[1.02] shadow-primary/20 active:scale-95'
                        }`}
                    >
                      {clockedInVenue === venue.id ? 'JOINED' : <><MapPin className="w-4 h-4" strokeWidth={3} /> CLOCK IN</>}
                    </button>
                  </div>
                </div>
              ))}
          </div>
          {/* Bottom Fade indicating more content */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
        </div>

        {/* Artie's Weekly Recommendations - Premium AI Section */}
        <div className="mt-12 bg-gradient-to-br from-[#0f172a] to-black border-2 border-primary/20 rounded-3xl p-8 relative overflow-hidden group/artie shadow-2xl">
          {/* AI Neural Background Effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] group-hover/artie:bg-primary/10 transition-all duration-1000" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px]" />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.2)] group-hover/artie:rotate-12 transition-transform duration-500">
                <Bot className="w-6 h-6 text-black" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight font-league">Artie's Intelligence</h3>
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Next-Gen Recommendations</p>
              </div>
            </div>
            {!userProfile.weeklyBuzz && (
              <div className="hidden sm:block">
                <span className="text-[9px] bg-white/5 text-slate-500 border border-white/10 px-3 py-1 rounded-full font-black uppercase tracking-widest">v1.2 Stable</span>
              </div>
            )}
          </div>

          {!userProfile.weeklyBuzz ? (
            <div className="relative z-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Star, title: 'CURATED PICKS', text: 'Tailored to your favorite vibes.' },
                  { icon: Zap, title: 'SECRET DEALS', text: 'Inside access for Artie users.' },
                  { icon: Trophy, title: 'POINT BOOSTS', text: '+50 pts just for checking in.' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl group/item hover:border-primary/20 transition-all">
                    <div className="bg-primary/10 w-8 h-8 rounded-lg flex items-center justify-center mb-3 group-hover/item:scale-110 transition-transform">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{item.title}</h5>
                    <p className="text-[11px] font-medium text-slate-400 italic leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => onToggleWeeklyBuzz?.()}
                  className="w-full py-5 bg-primary text-black font-league font-black text-lg uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-white hover:scale-[1.01] transition-all active:scale-95"
                >
                  JOIN THE WEEKLY BUZZ
                </button>
                <div className="flex items-center justify-center gap-2 opacity-50">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Your data is secured within the Artesian Network</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 relative z-10">
              {[
                { title: 'Trivia Champ night', venue: 'Legions Arcade Trivia', text: '🔥 Starts 7PM', score: '98%', chips: ['Double Points', 'No Cover'] },
                { title: 'Karaoke Legends', venue: 'China Clipper Karaoke', text: '🎤 Starts 9AM', score: '94%', chips: ['+25 Pts Bonus', 'HH Extended'] }
              ].map((rec, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:border-primary/50 transition-all cursor-pointer group/rec shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{rec.title}</span>
                      <span className="bg-primary/20 text-primary text-[8px] px-2 py-0.5 rounded-full font-black">{rec.score} MATCH</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">{rec.text}</span>
                  </div>
                  <p className="text-xl font-black text-white mb-3 font-league uppercase tracking-tight group-hover/rec:text-primary transition-colors">{rec.venue}</p>
                  <div className="flex items-center gap-2">
                    {rec.chips.map(chip => (
                      <span key={chip} className="text-[9px] px-2.5 py-1 bg-slate-900/60 text-slate-400 border border-white/5 rounded-lg font-black uppercase tracking-widest group-hover/rec:border-primary/20">{chip}</span>
                    ))}
                  </div>
                </div>
              ))}
              <button className="w-full mt-4 py-4 border-2 border-primary/20 rounded-2xl text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/10 hover:border-primary transition-all font-league">
                VIEW ALL PERSONALIZED RECOMMENDATIONS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
