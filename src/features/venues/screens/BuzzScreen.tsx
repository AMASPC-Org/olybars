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

type FilterKind = 'status' | 'scene' | 'play' | 'features' | 'events' | 'all';

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
  const [sceneFilter, setSceneFilter] = useState<string | 'all'>('all');
  const [playFilter, setPlayFilter] = useState<string | 'all'>('all');
  const [featureFilter, setFeatureFilter] = useState<string | 'all'>('all');
  const [eventFilter, setEventFilter] = useState<string | 'all'>('all');

  const searchQuery = initialQuery; // Sync with URL
  const [showPulseMenu, setShowPulseMenu] = useState(false);
  const [showSceneMenu, setShowSceneMenu] = useState(false);
  const [showPlayMenu, setShowPlayMenu] = useState(false);
  const [showFeatureMenu, setShowFeatureMenu] = useState(false);
  const [showEventMenu, setShowEventMenu] = useState(false);

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
      const vibeMatch = (v.vibe?.toLowerCase().includes(q) ?? false) || (v.sceneTags?.some(tag => tag.replace('_', ' ').toLowerCase().includes(q)) ?? false);
      const addressMatch = v.address?.toLowerCase().includes(q) ?? false;
      const dealMatch = (v.deal?.toLowerCase().includes(q) ?? false) || (v.activeFlashBounty?.title?.toLowerCase().includes(q) ?? false);
      // New: Search Game Features
      const gameMatch = v.gameFeatures?.some(f => (f.name?.toLowerCase() || '').includes(q) || (f.type?.toLowerCase() || '').includes(q)) ?? false;

      // Upgrade: Search Amenities & Rituals
      const amenityMatch = v.amenities?.some(a => a.toLowerCase().includes(q)) ?? false;
      const vibeTagMatch = v.sceneTags?.some(t => t.toLowerCase().includes(q)) ?? false;
      const scheduleMatch = v.weekly_schedule
        ? Object.values(v.weekly_schedule).flat().some(event => event.toString().toLowerCase().includes(q))
        : false;

      // [NEW] Description & Nicknames (Universal Search Expansion)
      const descriptionMatch = (v.description?.toLowerCase().includes(q) ?? false) || (v.eventDescription?.toLowerCase().includes(q) ?? false) || (v.historySnippet?.toLowerCase().includes(q) ?? false);
      const nicknameMatch = v.nicknames?.some(n => n.toLowerCase().includes(q)) ?? false;
      const happyHourMatch = (v.happyHourSimple?.toLowerCase().includes(q) ?? false) || (v.happyHourSpecials?.toLowerCase().includes(q) ?? false) || (v.happyHour?.description?.toLowerCase().includes(q) ?? false);

      const specialEventMatch = v.special_events?.some(e =>
        e.title.toLowerCase().includes(q) ||
        (e.description?.toLowerCase() || '').includes(q) ||
        e.type.toLowerCase().includes(q)
      ) ?? false;

      const isMatch = nameMatch || typeMatch || vibeMatch || addressMatch || dealMatch || gameMatch || amenityMatch || scheduleMatch || descriptionMatch || nicknameMatch || happyHourMatch || specialEventMatch;

      if (!isMatch) return false;

      // If we have a specific search, we generally ignore other filters unless searching within a specific category (pillar)
      return true;
    }

    if (filterKind === 'all') return true;

    if (filterKind === 'status') {
      if (statusFilter === 'all') return true;
      return v.status === statusFilter;
    }

    if (filterKind === 'scene' && sceneFilter !== 'all') {
      const q = sceneFilter.toLowerCase();
      return (v.venueType || '').toLowerCase().includes(q) ||
        (v.sceneTags?.some(tag => tag.toLowerCase().includes(q)) ?? false) ||
        (v.vibe?.toLowerCase().includes(q) ?? false);
    }

    if (filterKind === 'play' && playFilter !== 'all') {
      const q = playFilter.toLowerCase();
      return (v.gameFeatures?.some(f => f.type.toLowerCase().includes(q) || (f.name || '').toLowerCase().includes(q)) ?? false) ||
        (v.amenities?.some(a => a.toLowerCase().includes(q)) ?? false);
    }

    if (filterKind === 'features' && featureFilter !== 'all') {
      const q = featureFilter.toLowerCase();
      if (q === 'all_ages') return v.isAllAges === true || v.attributes?.minors_allowed === true;
      if (q === 'dog_friendly') return v.isDogFriendly === true;
      if (q === 'patio') return v.hasOutdoorSeating === true || (v.amenities?.some(a => a.toLowerCase().includes('patio')) ?? false);
      return v.amenities?.some(a => a.toLowerCase().includes(q)) ?? false;
    }

    if (filterKind === 'events' && eventFilter !== 'all') {
      const q = eventFilter.toLowerCase();
      const eventMatch = v.special_events?.some(e => e.type.toLowerCase().includes(q) || e.title.toLowerCase().includes(q)) ?? false;
      const leagueMatch = v.leagueEvent?.toLowerCase().includes(q) ?? false;
      const scheduleMatch = v.weekly_schedule && Object.values(v.weekly_schedule).flat().some(ev => (ev as string).toLowerCase().includes(q));
      return !!(eventMatch || leagueMatch || scheduleMatch);
    }

    // Global Visibility Check
    if (v.tier_config?.is_directory_listed === false || v.isActive === false) return false;

    // Home Pulse Specific: Hide closed bars unless part of the league or has flash bounty
    const open = isVenueOpen(v);
    const hasActiveBounty = !!(v.activeFlashBounty?.isActive && (v.activeFlashBounty.endTime || 0) > Date.now());
    if (!open && !v.isPaidLeagueMember && !hasActiveBounty) return false;

    return true;
  }, [searchQuery, filterKind, statusFilter, sceneFilter, playFilter, featureFilter, eventFilter]);

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
      const isAPartner = a.isPaidLeagueMember;
      const isBPartner = b.isPaidLeagueMember;

      if (isAPartner !== isBPartner) return isAPartner ? -1 : 1;

      if (isAPartner && isBPartner) {
        const aHash = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const bHash = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return ((aHash + rotationOffset) % 100) - ((bHash + rotationOffset) % 100);
      }

      // 2. Open Status (Open > Last Call > Closed)
      if (a.hourStatus === 'open' && b.hourStatus !== 'open') return -1;
      if (a.hourStatus !== 'open' && b.hourStatus === 'open') return 1;
      if (a.hourStatus === 'last_call' && b.hourStatus === 'closed') return -1;
      if (a.hourStatus === 'closed' && b.hourStatus === 'last_call') return 1;

      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    }), [venuesWithDistance, filterKind, statusFilter, applyFilter, rotationOffset]);

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
        if (a.isPaidLeagueMember && !b.isPaidLeagueMember) return -1;
        if (!a.isPaidLeagueMember && b.isPaidLeagueMember) return 1;
        return 0;
      }).map((v, i, arr) => {
        const shiftedIndex = (i + (rotationOffset % (arr.length || 1))) % (arr.length || 1);
        return arr[shiftedIndex];
      })
    : filteredVenues;

  const statusActive = filterKind === 'status' || filterKind === 'all';
  const sceneActive = filterKind === 'scene';
  const playActive = filterKind === 'play';
  const featuresActive = filterKind === 'features';
  const eventsActive = filterKind === 'events';

  const baseChipClasses = 'px-3 py-1.5 text-xs font-bold rounded-full border transition-all whitespace-nowrap';

  const clearAllFilters = () => {
    setFilterKind('all');
    setStatusFilter('all');
    setSceneFilter('all');
    setPlayFilter('all');
    setFeatureFilter('all');
    setEventFilter('all');
    setShowPulseMenu(false);
    setShowSceneMenu(false);
    setShowPlayMenu(false);
    setShowFeatureMenu(false);
    setShowEventMenu(false);
  };

  const generateOrgSchema = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "OlyBars",
      "url": "https://olybars.com",
      "logo": "https://olybars.com/og-image.png",
      "description": "The Nightlife Operating System for Olympia, WA.",
      "sameAs": ["https://instagram.com/olybars"]
    };
    return (
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    );
  };

  return (
    <div className="bg-background min-h-screen pb-24 font-sans text-slate-100">
      {generateOrgSchema()}
      <div className="p-4 space-y-6">
        <div className="space-y-3">
          {!searchQuery && (
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
          )}

          <div className="mb-6">
            <GlobalSearch
              placeholder="SEARCH BARS, VIBES, OR DEALS..."
              variant="hero"
            />
          </div>

          {!searchQuery && (
            <div className="flex justify-center items-center gap-2 pb-2 flex-wrap">
              {/* ALL RESET */}
              <button
                onClick={clearAllFilters}
                className={`${baseChipClasses} ${filterKind === 'all' ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'}`}
              >
                All
              </button>

              {/* PULSE (Status) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowPulseMenu(!showPulseMenu);
                    setShowSceneMenu(false); setShowPlayMenu(false); setShowFeatureMenu(false); setShowEventMenu(false);
                  }}
                  className={`${baseChipClasses} ${statusActive && filterKind !== 'all' ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'} flex items-center gap-1.5`}
                >
                  Pulse <ChevronRight className={`w-3 h-3 transition-transform ${showPulseMenu ? 'rotate-90' : ''}`} />
                </button>
                {showPulseMenu && (
                  <div className="absolute mt-2 left-0 z-20 bg-surface border border-slate-700 rounded-md shadow-2xl overflow-hidden text-xs font-bold min-w-[140px]">
                    {[
                      { id: 'packed', label: '⚡ Packed', icon: Zap },
                      { id: 'buzzing', label: '🔥 Buzzing', icon: Flame },
                      { id: 'chill', label: '🍺 Chill', icon: Beer },
                      { id: 'dead', label: '💀 Dead', icon: Clock }
                    ].map(option => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setStatusFilter(option.id as VenueStatus);
                          setFilterKind('status');
                          setShowPulseMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-3 transition-colors text-slate-200 border-b border-slate-800 last:border-0"
                      >
                        <option.icon className="w-3.5 h-3.5" /> {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SCENE (Previously Vibe) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSceneMenu(!showSceneMenu);
                    setShowPulseMenu(false); setShowPlayMenu(false); setShowFeatureMenu(false); setShowEventMenu(false);
                  }}
                  className={`${baseChipClasses} ${sceneActive ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'} flex items-center gap-1.5`}
                >
                  Scene <ChevronRight className={`w-3 h-3 transition-transform ${showSceneMenu ? 'rotate-90' : ''}`} />
                </button>
                {showSceneMenu && (
                  <div className="absolute mt-2 left-0 z-20 bg-surface border border-slate-700 rounded-md shadow-2xl overflow-hidden text-xs font-bold min-w-[140px]">
                    {[
                      { id: 'dive', label: '🍺 Dive Bar' },
                      { id: 'sports', label: '🏆 Sports Bar' },
                      { id: 'speakeasy', label: '🗝️ Speakeasy' },
                      { id: 'cocktail', label: '🍸 Cocktails' },
                      { id: 'wine', label: '🍷 Wine & Tapas' },
                      { id: 'brewery', label: '🍻 Brewery' }
                    ].map(option => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSceneFilter(option.id);
                          setFilterKind('scene');
                          setShowSceneMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors text-slate-200 border-b border-slate-800 last:border-0"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PLAY */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowPlayMenu(!showPlayMenu);
                    setShowPulseMenu(false); setShowSceneMenu(false); setShowFeatureMenu(false); setShowEventMenu(false);
                  }}
                  className={`${baseChipClasses} ${playActive ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'} flex items-center gap-1.5`}
                >
                  Play <ChevronRight className={`w-3 h-3 transition-transform ${showPlayMenu ? 'rotate-90' : ''}`} />
                </button>
                {showPlayMenu && (
                  <div className="absolute mt-2 left-0 z-20 bg-surface border border-slate-700 rounded-md shadow-2xl overflow-hidden text-xs font-bold min-w-[160px]">
                    {TAXONOMY_PLAY.slice(0, 8).map(game => (
                      <button
                        key={game}
                        onClick={() => {
                          setPlayFilter(game);
                          setFilterKind('play');
                          setShowPlayMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors text-slate-200 border-b border-slate-800 last:border-0"
                      >
                        {game}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* FEATURES */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowFeatureMenu(!showFeatureMenu);
                    setShowPulseMenu(false); setShowSceneMenu(false); setShowPlayMenu(false); setShowEventMenu(false);
                  }}
                  className={`${baseChipClasses} ${featuresActive ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'} flex items-center gap-1.5`}
                >
                  Features <ChevronRight className={`w-3 h-3 transition-transform ${showFeatureMenu ? 'rotate-90' : ''}`} />
                </button>
                {showFeatureMenu && (
                  <div className="absolute mt-2 left-0 z-20 bg-surface border border-slate-700 rounded-md shadow-2xl overflow-hidden text-xs font-bold min-w-[160px]">
                    {[
                      { id: 'patio', label: '🌳 Patio' },
                      { id: 'dog_friendly', label: '🐕 Dog Friendly' },
                      { id: 'all_ages', label: '👶 All Ages' },
                      { id: 'fireplace', label: '🔥 Fireplace' },
                      { id: 'dance_floor', label: '💃 Dance Floor' },
                      { id: 'stage', label: '🎭 Stage' }
                    ].map(option => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setFeatureFilter(option.id);
                          setFilterKind('features');
                          setShowFeatureMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors text-slate-200 border-b border-slate-800 last:border-0"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* EVENTS */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowEventMenu(!showEventMenu);
                    setShowPulseMenu(false); setShowSceneMenu(false); setShowPlayMenu(false); setShowFeatureMenu(false);
                  }}
                  className={`${baseChipClasses} ${eventsActive ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'} flex items-center gap-1.5`}
                >
                  Events <ChevronRight className={`w-3 h-3 transition-transform ${showEventMenu ? 'rotate-90' : ''}`} />
                </button>
                {showEventMenu && (
                  <div className="absolute mt-2 left-0 z-20 bg-surface border border-slate-700 rounded-md shadow-2xl overflow-hidden text-xs font-bold min-w-[140px]">
                    {TAXONOMY_EVENTS.slice(0, 6).map(event => (
                      <button
                        key={event}
                        onClick={() => {
                          setEventFilter(event);
                          setFilterKind('events');
                          setShowEventMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors text-slate-200 border-b border-slate-800 last:border-0"
                      >
                        {event}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!searchQuery && flashBountyVenues.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="bg-red-500 rounded-full p-1 animate-pulse">
                  <Zap className="w-3 h-3 text-white fill-current" />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest font-league">Live Flash Bounties</h4>
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
                    className="min-w-[85vw] md:min-w-[400px] snap-center bg-gradient-to-br from-red-600 to-red-900 rounded-2xl p-0.5 shadow-[0_0_40px_rgba(220,38,38,0.2)] relative overflow-hidden group active:scale-[0.97] transition-all"
                  >
                    <div className="bg-[#0b1222] rounded-[14px] p-5 h-full relative overflow-hidden flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <h5 className="font-black text-white text-lg uppercase font-league leading-none group-hover:text-primary transition-colors">{fd.name}</h5>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{fd.venueType.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="bg-red-600 text-white px-3 py-1 rounded-lg flex flex-col items-center">
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
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
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

          <div className="space-y-4 pb-12 transition-all">
            {isLoading && (
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}

            {!isLoading && displayVenues.map((venue) => (
              <div
                key={venue.id}
                className={`bg-surface/50 backdrop-blur-sm rounded-2xl border-2 p-5 shadow-xl transition-all duration-300 relative group/card active:scale-[0.98] ${isFallbackActive ? 'border-slate-800/10 opacity-70 scale-95' :
                  venue.status === 'packed' ? 'border-pink-500/30' :
                    venue.status === 'buzzing' ? 'border-primary/30' :
                      'border-slate-800/60 hover:border-slate-700'
                  }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/venues/${venue.id}`} className="hover:text-primary transition-colors flex-shrink-0">
                        <h4 className="font-bold text-xl text-white font-league uppercase tracking-tight truncate max-w-[200px]">{venue.name}</h4>
                      </Link>
                      {venue.isHQ && <Crown className="w-4 h-4 text-primary fill-current" />}
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
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {venue.manualStatusExpiresAt && venue.manualStatusExpiresAt > Date.now() && (
                    <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest font-league">
                      <ShieldCheck className="w-3 h-3" /> STAFF VERIFIED
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
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleVibeCheck && handleVibeCheck(venue)}
                    className="flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all border-2 font-league bg-surface border-white/5 text-slate-300 hover:bg-slate-800 hover:border-slate-500 active:scale-95"
                  >
                    <Users size={14} strokeWidth={3} className="text-primary" /> VIBE CHECK
                  </button>
                  <button
                    onClick={() => handleClockIn?.(venue)}
                    disabled={clockedInVenue === venue.id}
                    className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all shadow-xl font-league ${clockedInVenue === venue.id
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-primary text-black hover:bg-white hover:scale-[1.02] active:scale-95'
                      }`}
                  >
                    {clockedInVenue === venue.id ? 'JOINED' : <><MapPin className="w-4 h-4" strokeWidth={3} /> CLOCK IN</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-br from-[#0f172a] to-black border-2 border-primary/20 rounded-3xl p-8 relative overflow-hidden group/artie shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                <Bot className="w-6 h-6 text-black" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight font-league">Artie's Recommendations</h3>
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Next-Gen Intelligence</p>
              </div>
            </div>
          </div>
          <div className="relative z-10 space-y-4">
            <p className="text-slate-400 text-sm italic">Artie is currently analyzing local vibes to find your perfect match...</p>
            <button
              onClick={() => onToggleWeeklyBuzz?.()}
              className="w-full py-4 bg-primary/10 border border-primary/20 text-primary font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all"
            >
              Tune in to Weekly Buzz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
