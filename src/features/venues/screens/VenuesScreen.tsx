import React, { useState, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
    Beer, Bot, ChevronRight, Clock, Crown, Filter, Flame, MapPin, Music, Navigation, Search, Sparkles, Star, Trophy, Users
} from 'lucide-react';
import { Venue } from '../../../types';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { calculateDistance, metersToMiles } from '../../../utils/geoUtils';
import { isVenueOpen, getVenueStatus } from '../../../utils/venueUtils';
import { VenueGallery } from '../components/VenueGallery';
import { useToast } from '../../../components/ui/BrandedToast';

interface VenuesScreenProps {
    venues: Venue[];
    handleVibeCheck?: (v: Venue) => void;
    lastVibeChecks?: Record<string, number>;
    lastGlobalVibeCheck?: number;
}

type SortOption = 'alpha' | 'distance' | 'energy' | 'buzz';

export const VenuesScreen: React.FC<VenuesScreenProps> = ({ venues, handleVibeCheck, lastVibeChecks, lastGlobalVibeCheck }) => {
    const navigate = useNavigate();
    const { coords } = useGeolocation();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSort, setActiveSort] = useState<SortOption>('buzz');
    const [showOpenOnly, setShowOpenOnly] = useState(false);
    const [activeTag, setActiveTag] = useState<string | null>(searchParams.get('filter') === 'makers' ? 'Makers' : null);

    // Filter and Sort Logic
    const processedVenues = useMemo(() => {
        let result = venues.map(v => ({
            ...v,
            isOpen: isVenueOpen(v),
            hourStatus: getVenueStatus(v),
            distance: coords && v.location ? metersToMiles(calculateDistance(coords.latitude, coords.longitude, v.location.lat, v.location.lng)) : null
        })).filter(v => v.isActive !== false); // Filter out Soft Deleted / Archived venues

        // 1. Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(v =>
                v.name.toLowerCase().includes(q) ||
                v.address?.toLowerCase().includes(q) ||
                v.type.toLowerCase().includes(q)
            );
        }

        // 2. Open Only Filter
        if (showOpenOnly) {
            result = result.filter(v => v.isOpen);
        }

        // 3. Tag Filter (Karaoke, Trivia, Deals)
        if (activeTag) {
            if (activeTag === 'Deals') result = result.filter(v => !!v.deal || (v.deals && v.deals.length > 0));
            else if (activeTag === 'Makers') {
                result = result.filter(v =>
                    v.isHQ ||
                    v.type.toLowerCase().includes('brewery') ||
                    v.type.toLowerCase().includes('distillery')
                );
            }
            else if (activeTag === 'Trivia') result = result.filter(v => v.leagueEvent === 'trivia');
        }

        // 4. Global Visibility
        result = result.filter(v => v.isVisible !== false);

        // 5. Sorting
        result.sort((a, b) => {
            if (activeSort === 'alpha') {
                return a.name.localeCompare(b.name);
            }
            if (activeSort === 'distance') {
                const distA = a.distance ?? 999;
                const distB = b.distance ?? 999;
                return distA - distB;
            }
            if (activeSort === 'energy') {
                const order = { buzzing: 0, lively: 1, chill: 2 };
                return order[a.status] - order[b.status];
            }
            if (activeSort === 'buzz') {
                // Priority 1: Has Deal?
                const aHasDeal = !!(a.deal || (a.deals && a.deals.length > 0));
                const bHasDeal = !!(b.deal || (b.deals && b.deals.length > 0));

                if (aHasDeal && !bHasDeal) return -1;
                if (!aHasDeal && bHasDeal) return 1;

                // Priority 2: Time Remaining (Urgency)
                // If both have deals, sort by dealEndsIn (shortest first)
                if (aHasDeal && bHasDeal) {
                    const aTime = a.dealEndsIn ?? Infinity;
                    const bTime = b.dealEndsIn ?? Infinity;

                    // "Buzz Clock Priority": Deals > 4 hours (240 mins) go to bottom of deal list
                    const aIsLong = aTime > 240;
                    const bIsLong = bTime > 240;

                    if (aIsLong && !bIsLong) return 1;
                    if (!aIsLong && bIsLong) return -1;

                    return aTime - bTime;
                }

                // If neither has deal, fallback to energy/buzz score logic (implied by status) or just alpha
                const order = { buzzing: 0, lively: 1, chill: 2 };
                return order[a.status] - order[b.status];
            }
            return 0;
        });

        return result;
    }, [venues, searchQuery, showOpenOnly, activeTag, activeSort, coords]);

    return (
        <div className="bg-background min-h-screen pb-32 font-body text-slate-100">
            {/* Header & Search */}
            <div className="p-6 space-y-4">
                <div className="flex flex-col items-center gap-1 mb-2">
                    <h1 className="text-4xl font-black text-white tracking-widest font-league uppercase italic leading-none">
                        BAR <span className="text-primary">DIRECTORY</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 italic">The OlyBars Index</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, vibe, or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface border-2 border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-600 focus:border-primary outline-none transition-all shadow-xl font-body"
                    />
                </div>

                {/* Sorting & Quick Filters */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setActiveSort('buzz')}
                            className={`flex items-center gap-1 px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap font-league ${activeSort === 'buzz' ? 'bg-primary text-black border-black shadow-[2px_2px_0px_0px_#fff]' : 'bg-surface text-slate-400 border-slate-800'}`}
                        >
                            <Flame size={12} fill="currentColor" /> Buzz Clock
                        </button>
                        <button
                            onClick={() => setActiveSort('alpha')}
                            className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap font-league ${activeSort === 'alpha' ? 'bg-primary text-black border-black shadow-[2px_2px_0px_0px_#fff]' : 'bg-surface text-slate-400 border-slate-800'}`}
                        >
                            Alphabetical
                        </button>
                        <button
                            onClick={() => setActiveSort('distance')}
                            className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap font-league ${activeSort === 'distance' ? 'bg-primary text-black border-black shadow-[2px_2px_0px_0px_#fff]' : 'bg-surface text-slate-400 border-slate-800'}`}
                        >
                            Nearest
                        </button>
                        <button
                            onClick={() => setActiveSort('energy')}
                            className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap font-league ${activeSort === 'energy' ? 'bg-primary text-black border-black shadow-[2px_2px_0px_0px_#fff]' : 'bg-surface text-slate-400 border-slate-800'}`}
                        >
                            Vibe Check
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {['Makers', 'Trivia', 'Deals'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${activeTag === tag ? 'bg-primary/20 text-primary border-primary' : 'bg-transparent text-slate-500 border-slate-800'}`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowOpenOnly(!showOpenOnly)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${showOpenOnly ? 'bg-green-500/20 text-green-400 border-green-500' : 'bg-transparent text-slate-500 border-slate-800'}`}
                        >
                            <Clock size={12} />
                            Open Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="px-6 space-y-4">
                {processedVenues.length === 0 ? (
                    <div className="text-center py-20 bg-surface/30 rounded-3xl border-2 border-dashed border-slate-800">
                        <Sparkles className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest font-league italic">No spots found in this vibe</p>
                    </div>
                ) : (
                    processedVenues.map(venue => (
                        <div
                            key={venue.id}
                            className="bg-surface border-2 border-slate-700 rounded-3xl overflow-hidden hover:border-primary transition-all group shadow-2xl relative"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link to={`/venues/${venue.id}`} className="hover:text-primary transition-colors">
                                                <h3 className="text-2xl font-black text-white font-league uppercase italic leading-none group-hover:text-primary transition-colors">
                                                    {venue.name}
                                                </h3>
                                            </Link>
                                            {venue.isFeatured && (
                                                <div className="bg-primary px-2 py-0.5 rounded transform -skew-x-12">
                                                    <span className="text-black text-[8px] font-black uppercase italic">FEATURED</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-body">
                                            <span>{venue.type}</span>
                                            <span>•</span>
                                            <span className="italic">"{venue.vibe}"</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={`text-[10px] font-black px-3 py-1 rounded-full border mb-2 inline-block font-league uppercase tracking-widest ${venue.hourStatus === 'open' ? 'bg-green-500/10 text-green-400 border-green-400/30' : venue.hourStatus === 'last_call' ? 'bg-red-600/20 text-red-400 border-red-500 animate-pulse' : 'bg-red-500/10 text-red-400 border-red-400/30'}`}>
                                            {venue.hourStatus === 'open' ? 'Open Now' : venue.hourStatus === 'last_call' ? 'LAST CALL 🕒' : 'Closed'}
                                        </div>
                                        {venue.distance !== null && (
                                            <div className="flex items-center justify-end gap-1 text-[10px] font-black text-primary font-league uppercase">
                                                <Navigation size={10} strokeWidth={3} />
                                                {venue.distance.toFixed(1)} mi
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {venue.deal && (
                                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                                            <Beer size={16} className="text-primary" />
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase leading-none mb-1 font-league">Featured Deal</p>
                                                <p className="text-xs font-bold text-white font-body">{venue.deal}</p>
                                            </div>
                                        </div>
                                    )}

                                    {venue.leagueEvent && (
                                        <Link to={`/venues/${venue.id}`} className="block bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between group/event cursor-pointer hover:bg-slate-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Trophy size={16} className="text-primary" />
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1 font-league">Tonight's Play</p>
                                                    <p className="text-xs font-bold text-white uppercase font-body">{venue.leagueEvent}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-600 group-hover/event:text-primary transition-colors" />
                                        </Link>
                                    )}

                                    <div className="mt-4">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 font-league italic">Venue Gallery</p>
                                        <VenueGallery photos={venue.photos} />
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                                    <div className="flex-1 flex items-center justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase font-league">
                                                <Music size={12} strokeWidth={3} />
                                                {venue.leagueEvent === 'karaoke' ? 'Karaoke High' : 'Vibe Varies'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase font-league">
                                                <MapPin size={12} strokeWidth={3} />
                                                {venue.address ? venue.address.split(',')[0] : 'Downtown Oly'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    showToast('Find the physical Vibe Spot QR code inside ' + venue.name + ' to report a vibe.', 'info');
                                                }}
                                                className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all border outline-none bg-primary/5 border-primary/20 text-primary hover:bg-primary/20`}
                                            >
                                                <span className="flex flex-col items-center">
                                                    <span className="flex items-center gap-1">
                                                        <Users size={10} strokeWidth={3} /> Vibe Check (+5)
                                                    </span>
                                                    <span className="text-[6px] opacity-60">SCAN QR REQUIRED</span>
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
