import { useState, useEffect } from 'react';
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
                setApiKey(data.key);
            } catch (err) {
                console.error('[MAPS_KEY_FETCH_ERROR]', err);
                setStatus('error');
            }
        };

        if (!(window as any).google?.maps) {
            fetchKey();
        } else {
            setStatus('ready');
        }
    }, [retryCount]);

    // 2. Load the script once we have the key
    useEffect(() => {
        if (!apiKey || (window as any).google?.maps) return;

        // Cleanup any failed script attempts
        const oldScript = document.getElementById('google-maps-script');
        if (oldScript) oldScript.remove();

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setStatus('ready');
        script.onerror = () => {
            console.error('[MAPS_SCRIPT_LOAD_ERROR] Failed to load Google Maps JS API');
            setStatus('error');
        };
        document.head.appendChild(script);
    }, [apiKey, retryCount]);

    return { status, retry, apiKey };
};
