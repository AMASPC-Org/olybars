import { useEffect, useRef } from 'react';
import { useGoogleMapsScript } from './useGoogleMapsScript';

export const usePlacesAutocomplete = (onPlaceSelect: (place: google.maps.places.PlaceResult) => void) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const status = useGoogleMapsScript();

    useEffect(() => {
        if (!inputRef.current || status !== 'ready' || !(window as any).google?.maps?.places) return;

        // Initialize Autocomplete
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'us' },
            fields: ['address_components', 'geometry', 'icon', 'name', 'place_id', 'formatted_address', 'types'],
            types: ['establishment', 'geocode'],
        });

        // Listen for place selection
        autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (place && place.geometry) {
                onPlaceSelect(place);
            }
        });

        return () => {
            if (autocompleteRef.current) {
                (window as any).google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, [onPlaceSelect, status]);

    return { inputRef };
};
