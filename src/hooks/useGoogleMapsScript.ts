import { useState, useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const useGoogleMapsScript = () => {
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(() => {
        if ((window as any).google?.maps) return 'ready';
        return 'loading';
    });

    useEffect(() => {
        if ((window as any).google?.maps) {
            setStatus('ready');
            return;
        }

        const scriptId = 'google-maps-script';
        const existingScript = document.getElementById(scriptId);

        if (existingScript) {
            const checkInterval = setInterval(() => {
                if ((window as any).google?.maps) {
                    clearInterval(checkInterval);
                    setStatus('ready');
                }
            }, 100);
            return () => clearInterval(checkInterval);
        }

        if (!GOOGLE_MAPS_API_KEY) {
            setStatus('error');
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization,places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setStatus('ready');
        script.onerror = () => setStatus('error');
        document.head.appendChild(script);
    }, []);

    return status;
};
