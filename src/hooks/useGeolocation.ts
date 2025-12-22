import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
    coords: {
        latitude: number;
        longitude: number;
    } | null;
    error: string | null;
    loading: boolean;
    permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

interface GeolocationOptions extends PositionOptions {
    shouldPrompt?: boolean;
}

export const useGeolocation = (options: GeolocationOptions = { enableHighAccuracy: true, shouldPrompt: false }) => {
    const [state, setState] = useState<GeolocationState>({
        coords: null,
        error: null,
        loading: true,
        permissionStatus: 'unknown',
    });
    const [isRequested, setIsRequested] = useState(options.shouldPrompt);

    const requestLocation = useCallback(() => {
        setIsRequested(true);
    }, []);

    const handleSuccess = useCallback((position: GeolocationPosition) => {
        setState({
            coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            },
            error: null,
            loading: false,
            permissionStatus: 'granted',
        });
    }, []);

    const handleError = useCallback((error: GeolocationPositionError) => {
        setState(s => ({
            ...s,
            error: error.message,
            loading: false,
            permissionStatus: error.code === error.PERMISSION_DENIED ? 'denied' : s.permissionStatus,
        }));
    }, []);

    useEffect(() => {
        // If not requested and shouldPrompt is false, just stop loading
        if (!isRequested) {
            setState(s => ({ ...s, loading: false }));
            return;
        }

        if (!navigator.geolocation) {
            setState(s => ({ ...s, error: 'Geolocation not supported', loading: false }));
            return;
        }

        setState(s => ({ ...s, loading: true }));

        // Check permission status if API available
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then(status => {
                setState(s => ({ ...s, permissionStatus: status.state as any }));
                status.onchange = () => {
                    setState(s => ({ ...s, permissionStatus: status.state as any }));
                };
            });
        }

        const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

        return () => navigator.geolocation.clearWatch(watchId);
    }, [isRequested, options, handleSuccess, handleError]);

    const refresh = useCallback(() => {
        if (!isRequested) {
            setIsRequested(true);
        } else {
            // Force a refresh by briefly toggling loading or just triggering a one-off get
            setState(s => ({ ...s, loading: true }));
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    handleSuccess(position);
                },
                (error) => {
                    handleError(error);
                },
                options
            );
        }
    }, [isRequested, options, handleSuccess, handleError]);

    return { ...state, requestLocation, refresh, isRequested };
};
