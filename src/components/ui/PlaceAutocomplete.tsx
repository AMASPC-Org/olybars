import React, { useState } from 'react';
import { Search, X, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { usePlacesAutocomplete } from '../../hooks/usePlacesAutocomplete';

interface PlaceAutocompleteProps {
    onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
    placeholder?: string;
    className?: string;
    venues?: Venue[];
}

export const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({
    onPlaceSelect,
    placeholder = "Search for a place...",
    className = "",
    venues
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const { query, setQuery, predictions, selectPrediction, loading } = usePlacesAutocomplete((place) => {
        onPlaceSelect(place);
        setShowDropdown(false);
    }, venues);

    return (
        <div className={`relative group ${className}`}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={placeholder}
                    className="w-full bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700/50 rounded-2xl py-4 pl-12 pr-12 text-white font-bold placeholder:text-slate-600 focus:border-primary outline-none transition-all shadow-2xl font-body"
                />
                {(query || loading) && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {loading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                        {query && (
                            <button
                                onClick={() => {
                                    setQuery('');
                                    setShowDropdown(false);
                                }}
                                className="p-1 hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-500 hover:text-white" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Dropdown Results */}
            {showDropdown && predictions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    {predictions.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => selectPrediction(p)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0 text-left"
                        >
                            <div className={`p-2 rounded-lg ${p.isLocal ? 'bg-primary/10 text-primary' : 'bg-slate-800 text-slate-400'}`}>
                                {p.isLocal ? <Sparkles size={16} /> : <MapPin size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${p.isLocal ? 'text-white' : 'text-slate-300'}`}>
                                    {p.isLocal ? p.venue.name : p.description.split(',')[0]}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider">
                                    {p.isLocal ? (p.venue.address || 'OLYMPIA, WA') : p.description}
                                </p>
                            </div>
                        </button>
                    ))}
                    <div className="p-2 bg-slate-950/50 border-t border-slate-800">
                        <p className="text-[8px] text-slate-600 uppercase tracking-[0.2em] text-center font-bold">
                            Powered by Well 80 & Google
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
