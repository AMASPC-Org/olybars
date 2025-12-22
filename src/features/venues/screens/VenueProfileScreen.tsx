import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Clock, Beer, Trophy, Music, Users,
    ChevronLeft, Navigation, Star, Shield, Info,
    Flame, Calendar, Share2, ChevronRight
} from 'lucide-react';
import { Venue, UserProfile } from '../../../types';
import { VenueGallery } from '../components/VenueGallery';
import { getVenueStatus, isVenueOpen } from '../../../utils/venueUtils';

interface VenueProfileScreenProps {
    venues: Venue[];
    userProfile: UserProfile;
    handleClockIn: (v: Venue) => void;
    handleVibeCheck: (v: Venue, hasConsent?: boolean, photoUrl?: string) => void;
    clockedInVenue?: string | null;
}

export const VenueProfileScreen: React.FC<VenueProfileScreenProps> = ({
    venues,
    userProfile,
    handleClockIn,
    handleVibeCheck,
    clockedInVenue
}) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const venue = venues.find(v => v.id === id);

    if (!venue) {
        return (
            <div className="p-10 text-center text-slate-500 font-bold">
                <p>Venue Not Found</p>
                <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">Return Home</button>
            </div>
        );
    }

    const status = getVenueStatus(venue);
    const isOpen = isVenueOpen(venue);

    return (
        <div className="bg-background min-h-screen pb-32 font-body text-slate-100 animate-in fade-in duration-500">
            {/* Hero Header */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={venue.photos?.[0]?.url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop'}
                    className="w-full h-full object-cover opacity-60"
                    alt={venue.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 p-2 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-black transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-4xl font-black text-white font-league uppercase italic leading-none truncate max-w-[250px]">
                                    {venue.name}
                                </h1>
                                {venue.isHQ && <Shield className="w-5 h-5 text-primary fill-primary" />}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span>{venue.type}</span>
                                <span>•</span>
                                <span className="text-primary italic">"{venue.vibe}"</span>
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${status === 'open' ? 'bg-green-500/10 text-green-400 border-green-400/30' :
                            status === 'last_call' ? 'bg-red-600/20 text-red-500 border-red-500/50 animate-pulse' :
                                'bg-red-500/10 text-red-400 border-red-400/30'
                            }`}>
                            {status === 'open' ? 'Open Now' : status === 'last_call' ? 'LAST CALL' : 'Closed'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-surface border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-1 shadow-lg">
                        {venue.status === 'buzzing' ? <Flame className="w-5 h-5 text-orange-500" /> :
                            venue.status === 'lively' ? <Users className="w-5 h-5 text-yellow-400" /> :
                                <Beer className="w-5 h-5 text-blue-400" />}
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Energy</span>
                        <span className="text-sm font-black text-white uppercase font-league">{venue.status}</span>
                    </div>
                    <div className="bg-surface border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-1 shadow-lg">
                        <Trophy className="w-5 h-5 text-primary" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Checkins</span>
                        <span className="text-sm font-black text-white font-mono">{venue.checkIns}</span>
                    </div>
                    <div className="bg-surface border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-1 shadow-lg">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hours</span>
                        <span className="text-[10px] font-bold text-white uppercase">
                            {typeof venue.hours === 'string' ? venue.hours : 'Featured Hours'}
                        </span>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex gap-3">
                    <button
                        onClick={() => handleClockIn(venue)}
                        disabled={clockedInVenue === venue.id}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/10 ${clockedInVenue === venue.id ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-primary text-black hover:scale-[1.02] active:scale-95'
                            }`}
                    >
                        <MapPin className="w-4 h-4" />
                        {clockedInVenue === venue.id ? 'Checked In' : 'Clock In (+10)'}
                    </button>
                    <button
                        onClick={() => handleVibeCheck(venue)}
                        className="w-14 h-14 bg-surface border-2 border-slate-700 rounded-2xl flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all active:scale-95 shadow-xl"
                    >
                        <Share2 className="w-6 h-6" />
                    </button>
                </div>

                {/* Intelligence Section */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] font-league italic">Intel & Buzz</h3>

                    {venue.deal && (
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-4">
                            <div className="bg-primary p-2.5 h-fit rounded-xl">
                                <Beer className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 italic">Active Deal</p>
                                <p className="text-sm font-bold text-white leading-relaxed">{venue.deal}</p>
                                {venue.dealEndsIn && (
                                    <p className="text-[9px] text-primary/60 font-black uppercase mt-2">Ends in {venue.dealEndsIn} mins</p>
                                )}
                            </div>
                        </div>
                    )}

                    {venue.leagueEvent && (
                        <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex gap-4">
                            <div className="bg-slate-800 p-2.5 h-fit rounded-xl">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">League Integration</p>
                                <p className="text-sm font-black text-white uppercase font-league tracking-wide">{venue.leagueEvent} Tonight</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Starts at 7:00 PM • Double Points</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Gallery */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] font-league italic">Vibe Gallery</h3>
                    <div className="bg-surface border border-white/5 rounded-2xl p-2 min-h-[150px]">
                        <VenueGallery photos={venue.photos} />
                    </div>
                </div>

                {/* Location Info */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] font-league italic">Navigation</h3>
                    <div className="bg-surface border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-800 p-2.5 rounded-xl">
                                <Navigation className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Address</span>
                                <p className="text-sm font-bold text-white uppercase tracking-tight">{venue.address || 'Olympia, WA'}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-700" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VenueProfileScreen;
