/**
 * OlyBars API Configuration
 * Automatically detects the environment and provides the correct base URL.
 */

const getApiBaseUrl = () => {
    if (typeof window === 'undefined') return '';

    const hostname = window.location.hostname;

    // Local Development (Frontend only or Local Backend)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://127.0.0.1:3001/api';
    }

    // Development Staging
    if (hostname.includes('olybars-dev.web.app')) {
        return 'https://olybars-backend-juthzlaerq-uw.a.run.app/api';
    }

    // Production
    if (hostname.includes('olybars.com')) {
        return 'https://olybars-backend-26629455103.us-west1.run.app/api';
    }

    // Fallback to Production Cloud Run URL
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
    }
};
