import React, { useState, useMemo } from 'react';
import {
    Search,
    MapPin,
    ChevronRight,
    Navigation,
    ArrowLeft,
    Filter,
    Flame,
    Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Venue, UserProfile } from '../../../types';
import { calculateDistance } from '../../../utils/geoUtils';
import { useGeolocation } from '../../../hooks/useGeolocation';

interface TheSpotsScreenProps {
    venues: Venue[];
    userProfile: UserProfile;
    handleToggleFavorite: (venueId: string) => void;
}

const TheSpotsScreen: React.FC<TheSpotsScreenProps> = ({ venues, userProfile, handleToggleFavorite }) => {
    const navigate = useNavigate();
    const { coords } = useGeolocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'buzzing' | 'favorites'>('all');

    // Logic for sorting and filtering
    const filteredVenues = useMemo(() => {
        let result = [...venues];

        // 1. Search filter
        if (searchQuery) {
            result = result.filter(v =>
                v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.type.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Category filter
        if (activeFilter === 'buzzing') {
            result = result.filter(v => (v.currentBuzz?.score || 0) > 70);
        } else if (activeFilter === 'favorites') {
            result = result.filter(v => userProfile.favorites?.includes(v.id));
        }

        // 3. Sort by Distance (Proximity Rule)
        if (coords) {
            result.sort((a, b) => {
                if (!a.location || !b.location) return 0;
                const distA = calculateDistance(coords.latitude, coords.longitude, a.location.lat, a.location.lng);
                const distB = calculateDistance(coords.latitude, coords.longitude, b.location.lat, b.location.lng);
                return distA - distB;
            });
        }

        return result;
    }, [venues, searchQuery, activeFilter, coords]);

    return (
        <div className="min-h-screen bg-background text-white p-6 pb-24 font-body animate-in fade-in duration-500">
            {/* Header */}
            <header className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-primary mb-6 hover:opacity-80 transition-opacity uppercase font-black tracking-widest text-[10px]"
                >
                    <ArrowLeft className="w-4 h-4" /> BACK
                </button>
                <h1 className="text-4xl font-black uppercase tracking-tighter font-league">
                    LEAGUE <span className="text-primary">BARS</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">THE OLYBARS 98501 DIRECTORY</p>
            </header>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                    type="text"
                    placeholder="SEARCH BARS OR VIBES..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-600 focus:border-primary/50 outline-none transition-all shadow-inner"
                />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'all', label: 'ALL BARS', icon: Filter },
                    { id: 'buzzing', label: 'BUZZING', icon: Flame },
                    { id: 'favorites', label: 'FAVORITES', icon: Star },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveFilter(item.id as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === item.id
                            ? 'bg-primary border-primary text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                            : 'bg-surface border-slate-800 text-slate-400 hover:border-slate-600'
                            }`}
                    >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Venue List */}
            <div className="space-y-3">
                {filteredVenues.length > 0 ? (
                    filteredVenues.map((venue) => {
                        const distance = coords && venue.location
                            ? calculateDistance(coords.latitude, coords.longitude, venue.location.lat, venue.location.lng)
                            : null;

                        return (
                            <div key={venue.id} className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate(`/venue/${venue.id}`)}
                                    className="flex-1 bg-slate-900/50 border border-slate-800 hover:border-primary/30 p-4 rounded-2xl flex items-center justify-between group transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center border border-white/5 group-hover:bg-primary group-hover:scale-105 transition-all">
                                            <Navigation className="w-5 h-5 text-primary group-hover:text-black" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-sm font-black uppercase tracking-tight font-league group-hover:text-primary transition-colors">
                                                {venue.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase">{venue.type}</span>
                                                {distance !== null && (
                                                    <>
                                                        <span className="text-[8px] text-slate-700">•</span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                                                            <MapPin className="w-2.5 h-2.5" />
                                                            {Math.round(distance)}m AWAY
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-800 group-hover:text-primary" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleFavorite(venue.id);
                                    }}
                                    className={`p-4 rounded-2xl border transition-all active:scale-95 shadow-lg ${userProfile.favorites?.includes(venue.id)
                                        ? 'bg-primary/20 border-primary text-primary'
                                        : 'bg-white/5 border-white/10 text-slate-700 hover:border-primary/30 hover:text-primary/50'
                                        }`}
                                >
                                    <Star className={`w-6 h-6 ${userProfile.favorites?.includes(venue.id) ? 'fill-primary' : ''}`} />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 text-center">
                        <Search className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No spots found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Business Listing Promo */}
            <footer className="mt-12 p-6 border-2 border-dashed border-slate-800 rounded-3xl text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 italic">Owned a bar in Olympia?</p>
                <button
                    onClick={() => navigate('/owner')}
                    className="text-primary font-black uppercase text-xs tracking-widest hover:underline"
                >
                    Claim Your Listing & Manage The Vibe →
                </button>
            </footer>
        </div >
    );
};

export default TheSpotsScreen;
