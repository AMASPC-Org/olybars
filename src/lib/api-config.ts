/**
 * OlyBars API Configuration
 * Automatically detects the environment and provides the correct base URL.
 */

const getApiBaseUrl = () => {
    if (typeof window === 'undefined') return '';

    // If VITE_API_URL is provided at build time (standard for our Cloud Run deploys), use it.
    // Ensure we don't end up with /api/api by trimming trailing slashes/api
    const builtInUrl = import.meta.env.VITE_API_URL;
    if (builtInUrl) {
        return builtInUrl.replace(/\/api\/?$/, '') + '/api';
    }

    const hostname = window.location.hostname;

    // Local Development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
    }

    // Fallback for DEV/PROD if env var is missing (legacy support)
    return hostname.includes('dev')
        ? 'https://olybars-backend-juthzlaerq-uw.a.run.app/api'
        : 'https://olybars-backend-juthzlaerq-uw.a.run.app/api'; // Unified to the valid backend
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
    }
};
