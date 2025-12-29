/**
 * OlyBars API Configuration
 * Automatically detects the environment and provides the correct base URL.
 */

const getApiBaseUrl = () => {
    if (typeof window === 'undefined') return '';

    const hostname = window.location.hostname;

    /**
     * UNIVERSAL ROUTING STRATEGY (Resilience-First):
     * We use relative paths (/api) for all environments where the frontend 
     * and backend share a same-origin infrastructure (Local Proxy or Firebase Hosting).
     */
    if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.includes('web.app') ||
        hostname.includes('firebaseapp.com') ||
        hostname.includes('olybars.com')
    ) {
        return '/api';
    }

    // 2. Build-time override (Secondary priority)
    const builtInUrl = import.meta.env.VITE_API_URL;
    if (builtInUrl) {
        return builtInUrl.replace(/\/api\/?$/, '') + '/api';
    }

    // 3. Absolute fallback (Legacy/Hard-coded)
    return 'https://olybars-backend-26629455103.us-west1.run.app/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
    CONFIG: {
        MAPS_KEY: `${API_BASE_URL}/config/maps-key`,
    },
    VENUES: {
        LIST: `${API_BASE_URL}/venues`,
        SYNC: (id: string) => `${API_BASE_URL}/venues/${id}/sync-google`,
        PULSE: (id: string) => `${API_BASE_URL}/venues/${id}/pulse`,
        CHECK_CLAIM: `${API_BASE_URL}/venues/check-claim`,
    },
    PARTNERS: {
        ONBOARD: `${API_BASE_URL}/partners/onboard`,
    },
    USER: {
        ACTIVITY: `${API_BASE_URL}/activity`,
    },
    EVENTS: {
        LIST: `${API_BASE_URL}/events`,
        SUBMIT: `${API_BASE_URL}/events`,
        MANAGE: (id: string) => `${API_BASE_URL}/events/${id}`,
    }
};
