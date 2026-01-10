import React, { useEffect, useState } from 'react';
import { X, MapPin, Navigation, Car, CloudRain, Sun, AlertTriangle, Sparkles, ShieldCheck, HardHat, Info } from 'lucide-react';
import { weatherService, WeatherCondition } from '../../../services/weatherService';
import { getUberDeepLink, getLyftDeepLink, getUberWebLink } from '../../../utils/transportUtils';

interface ArtieDistanceWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    distanceMiles: number;
    walkTimeMins: number;
    destinationName: string;
    destinationAddress: string;
    destinationCoords: { lat: number; lng: number };
    userZone?: string;
    destinationZone?: string;
}

export const ArtieDistanceWarningModal: React.FC<ArtieDistanceWarningModalProps> = ({
    isOpen,
    onClose,
    distanceMiles,
    walkTimeMins,
    destinationName,
    destinationAddress,
    destinationCoords,
    userZone,
    destinationZone
}) => {
    const [weather, setWeather] = useState<WeatherCondition>('sunny');

    useEffect(() => {
        const fetchWeather = async () => {
            const data = await weatherService.getCurrentWeather();
            setWeather(data.condition);
        };
        fetchWeather();
    }, []);

    if (!isOpen) return null;

    const getWarningMessage = () => {
        // High Distance (> 1.5 miles): Safe Drive Focus
        if (distanceMiles > 1.5) {
            return {
                title: "Keep the Night Legendary",
                subtitle: "That's a drive. Grab a ride instead?",
                icon: <ShieldCheck className="w-12 h-12 text-primary" />,
                safeDriveNotice: true
            };
        }

        // Mid Distance (Long Walk > 0.5 miles)
        if (distanceMiles > 0.5) {
            return {
                title: "That's a bit of a hike",
                subtitle: "Protect your vibe, grab a ride.",
                icon: <MapPin className="w-12 h-12 text-primary" />,
                safeDriveNotice: false
            };
        }

        // Weather Focused
        if (weather === 'raining') {
            return {
                title: "It's pouring out there",
                subtitle: "Stay dry, call a car.",
                icon: <CloudRain className="w-12 h-12 text-blue-400" />,
                safeDriveNotice: false
            };
        }

        if (weather === 'sunny' && walkTimeMins < 10) {
            return {
                title: "Smooth Sailing",
                subtitle: `Just a ${walkTimeMins} min stroll away.`,
                icon: <Sun className="w-12 h-12 text-yellow-400" />,
                safeDriveNotice: false
            };
        }

        return {
            title: "Plan Your Move",
            subtitle: "Make it a safe one.",
            icon: <Navigation className="w-12 h-12 text-primary" />,
            safeDriveNotice: false
        };
    };

    const warning = getWarningMessage();

    const handleRideShare = (type: 'uber' | 'lyft') => {
        const url = type === 'uber'
            ? getUberDeepLink(destinationAddress, destinationCoords.lat, destinationCoords.lng)
            : getLyftDeepLink(destinationCoords.lat, destinationCoords.lng);
        window.location.href = url;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-primary/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl shadow-primary/10 relative">
                {/* Artie Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="bg-primary/10 p-4 rounded-2xl relative">
                            {warning.icon}
                            <Sparkles className="w-5 h-5 text-primary absolute -top-1 -right-1 animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-white uppercase italic tracking-wide leading-tight">
                            {warning.title}
                        </h2>
                        <p className="text-xs font-bold text-primary italic uppercase tracking-widest">
                            {warning.subtitle}
                        </p>
                    </div>

                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            <span>Distance</span>
                            <span>{distanceMiles > 0.5 ? 'Est. Uber' : 'Est. Walk'}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-black text-white italic">
                            <span>{distanceMiles.toFixed(1)} miles</span>
                            <span>{distanceMiles > 1.5 ? '~5-8 mins' : `${walkTimeMins} mins`}</span>
                        </div>
                    </div>

                    {warning.safeDriveNotice ? (
                        <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 space-y-3">
                            <div className="flex items-center gap-2 text-red-400">
                                <AlertTriangle size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Safe Drive Warning</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed text-left">
                                If you're planning on having more than one, please don't get behind the wheel. We've got Uber and Lyft ready to go.
                            </p>
                        </div>
                    ) : userZone && destinationZone && userZone !== destinationZone && (
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                Traveling from <span className="text-white">{userZone}</span> to <span className="text-white">{destinationZone}</span>.
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={() => handleRideShare('uber')}
                            className="w-full py-4 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/10"
                        >
                            <Car className="w-4 h-4" />
                            Grab a Ride (Uber)
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                        >
                            {distanceMiles > 1.5 ? "I'm the DD (Drive)" : "I'll be a hero (Walk)"}
                        </button>
                    </div>

                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
                        OlyBars favors safe rides. Red Cab: (360) 357-3333
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
