import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Venue } from '../types';
import { API_BASE_URL } from '../lib/api-config';

export const usePlacesAutocomplete = (onPlaceSelect: (place: google.maps.places.PlaceResult) => void, providedVenues?: Venue[]) => {
    const outletContext = useOutletContext<{ venues: Venue[] }>() || { venues: [] };
    const venues = providedVenues || outletContext.venues || [];
    const [query, setQuery] = useState('');
    const [predictions, setPredictions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch predictions from backend proxy
    const fetchPredictions = useCallback(async (input: string) => {
        if (!input || input.length < 2) {
            setPredictions([]);
            return;
        }

        setLoading(true);
        try {
            // Include local OlyBars venues first
            const localMatches = venues.filter(v =>
                (v.name && v.name.toLowerCase().includes(input.toLowerCase())) ||
                (v.address && v.address.toLowerCase().includes(input.toLowerCase()))
            ).map(v => ({
                id: v.id,
                description: `${v.name} - ${v.address || 'Olympia, WA'}`,
                isLocal: true,
                venue: v
            }));

            // Fetch from Google via Backend Proxy
            const response = await fetch(`${API_BASE_URL}/places/search?q=${encodeURIComponent(input)}`);
            const googleData = await response.json();

            const googleMatches = (googleData || []).map((p: any) => ({
                id: p.place_id,
                description: p.description,
                isLocal: false
            }));

            setPredictions([...localMatches, ...googleMatches]);
        } catch (err) {
            console.error('[PLACES_PROXY_ERROR]', err);
        } finally {
            setLoading(false);
        }
    }, [venues]);

    // Fetch place details from backend proxy
    const selectPrediction = async (prediction: any) => {
        if (prediction.isLocal) {
            const v = prediction.venue;
            onPlaceSelect({
                place_id: v.googlePlaceId,
                name: v.name,
                formatted_address: v.address,
                geometry: {
                    location: new google.maps.LatLng(v.location.lat, v.location.lng)
                } as any
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/places/details/${prediction.id}`);
            const data = await response.json();
            if (data) {
                onPlaceSelect(data);
            }
        } catch (err) {
            console.error('[PLACES_DETAILS_ERROR]', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) fetchPredictions(query);
            else setPredictions([]);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, fetchPredictions]);

    return {
        query,
        setQuery,
        predictions,
        selectPrediction,
        loading
    };
};
