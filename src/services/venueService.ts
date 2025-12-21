import { Venue } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

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
