import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { API_ENDPOINTS } from '../lib/api-config';

// The frontend will now fetch the restricted key from the backend
// to ensure the GOOGLE_BACKEND_KEY is the single source of truth.

export const useGoogleMapsScript = () => {
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(() => {
        if ((window as any).google?.maps) return 'ready';
        return 'loading';
    });
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const retry = () => {
        setRetryCount(prev => prev + 1);
        setStatus('loading');
    };

    // 1. Fetch the key from the backend
    useEffect(() => {
        const fetchKey = async () => {
            try {
                // Determine API root (handle local vs prod)
                const response = await fetch(`${API_ENDPOINTS.CONFIG.MAPS_KEY}?v=${retryCount}`);
                if (!response.ok) throw new Error('Failed to fetch Maps key');
                const data = await response.json();

                if (data.key && data.key.startsWith('AIza') && data.key.length > 20) {
                    console.log('📡 [MAPS] Key successfully fetched from Artie backend');
                    setApiKey(data.key);
                } else {
                    throw new Error('Backend returned invalid key format');
                }
            } catch (err) {
                console.error('[MAPS_KEY_FETCH_ERROR] Initial fetch failed, checking fallback:', err);

                // Fallback to build-time environment variable if backend fetch fails
                const fallback = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_BROWSER_KEY;
                if (fallback && fallback.startsWith('AIza') && fallback.length > 20) {
                    console.log('📡 [MAPS] Using build-time restricted key (Fallback)');
                    setApiKey(fallback);
                } else {
                    console.error('[MAPS_CRITICAL] No valid API key found in backend or build-time environment.');
                    setStatus('error');
                }
            }
        };

        if (!(window as any).google?.maps) {
            fetchKey();
        } else {
            setStatus('ready');
        }
    }, [retryCount]);

    // 2. Load the script using the official Loader
    useEffect(() => {
        // Only short-circuit if the Map constructor is explicitly available
        if ((window as any).google?.maps?.Map) {
            setStatus('ready');
            return;
        }
        if (!apiKey) return;

        const loader = new Loader({
            apiKey: apiKey,
            version: "weekly",
            libraries: ["places", "marker"], // Load places and marker libraries
        });

        loader.load()
            .then(() => {
                setStatus('ready');
            })
            .catch((err) => {
                console.error('[MAPS_LOADER_ERROR]', err);
                setStatus('error');
            });

    }, [apiKey, retryCount]);

    return { status, retry, apiKey };
};
