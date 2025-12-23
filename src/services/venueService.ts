import { Venue } from '../types';

// Force production backend for now to verify data
const API_BASE_URL = 'https://olybars-backend-juthzlaerq-uw.a.run.app/api';
// const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
// const API_BASE_URL = (isLocalhost ? 'http://localhost:3001' : (import.meta.env.VITE_API_URL || 'https://olybars-backend-juthzlaerq-uw.a.run.app')) + '/api';

/**
 * Fetches the list of venues from the production backend.
 * The backend handles Firestore communication and Buzz Clock sorting.
 */
export const fetchVenues = async (): Promise<Venue[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/venues`);
    if (!response.ok) {
      throw new Error(`Failed to fetch venues: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in fetchVenues:', error);
    // Return empty array as fallback to prevent UI crash
    return [];
  }
};
