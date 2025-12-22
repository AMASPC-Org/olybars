import { useState, useEffect } from 'react';

interface GeolocationState {
    coords: {
        latitude: number;
        longitude: number;
    } | null;
    error: string | null;
    loading: boolean;
    permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export const useGeolocation = (options: PositionOptions = { enableHighAccuracy: true }) => {
    const [state, setState] = useState<GeolocationState>({
        coords: null,
        error: null,
        loading: true,
        permissionStatus: 'unknown',
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setState(s => ({ ...s, error: 'Geolocation not supported', loading: false }));
            return;
        }

        // Check permission status if API available
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then(status => {
                setState(s => ({ ...s, permissionStatus: status.state }));
                status.onchange = () => {
                    setState(s => ({ ...s, permissionStatus: status.state }));
                };
            });
        }

        const handleSuccess = (position: GeolocationPosition) => {
            setState({
                coords: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
                error: null,
                loading: false,
                permissionStatus: 'granted',
            });
        };

        const handleError = (error: GeolocationPositionError) => {
            setState(s => ({
                ...s,
                error: error.message,
                loading: false,
                permissionStatus: error.code === error.PERMISSION_DENIED ? 'denied' : s.permissionStatus,
            }));
        };

        const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return state;
};
