import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { usePlacesAutocomplete } from '../../hooks/usePlacesAutocomplete';

interface PlaceAutocompleteProps {
    onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
    placeholder?: string;
    className?: string;
}

export const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({
    onPlaceSelect,
    placeholder = "Search for a place...",
    className = ""
}) => {
    const [inputValue, setInputValue] = useState('');
    const { inputRef } = usePlacesAutocomplete((place) => {
        setInputValue(place.name || place.formatted_address || '');
        onPlaceSelect(place);
    });

    return (
        <div className={`relative group ${className}`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors pr-1" />
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-900/50 backdrop-blur-md border-2 border-slate-700/50 rounded-2xl py-4 pl-12 pr-12 text-white font-bold placeholder:text-slate-600 focus:border-primary outline-none transition-all shadow-xl font-body hover:border-slate-600 focus:bg-slate-900"
            />
            {inputValue && (
                <button
                    onClick={() => setInputValue('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-800 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-slate-500 hover:text-white" />
                </button>
            )}
        </div>
    );
};
