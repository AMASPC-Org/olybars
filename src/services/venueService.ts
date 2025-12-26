import { Venue } from '../types';
import { PULSE_CONFIG } from '../config/pulse';
import { getAuthHeaders } from './apiUtils';

// Forcing production URL for now since user is running frontend-only locally
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

/**
 * Pulse System Integration (Doc 05 Rulebook)
 * The Frontend Service uses the Centralized Pulse Logic Config for consistency.
 */

/**
 * Fetches the list of venues from the backend.
 * Uses PULSE_CONFIG.WINDOWS.STALE_THRESHOLD for background refresh logic.
 */
export const fetchVenues = async (): Promise<Venue[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/venues`);
    if (!response.ok) {
      throw new Error(`Failed to fetch venues: ${response.statusText}`);
    }
    const venues: Venue[] = await response.json();

    // 1. Client-side Stale Check (Optional trigger for backend refresh via side effect)
    // The Backend handles the primary logic, but the Frontend verifies freshness.
    const now = Date.now();
    venues.forEach(venue => {
      const lastUpdated = venue.currentBuzz?.lastUpdated || 0;
      if (now - lastUpdated > PULSE_CONFIG.WINDOWS.STALE_THRESHOLD) {
        // We could trigger a dedicated background refresh here if needed
        // but currently the backend handles this on GET /venues.
      }
    });

    return venues;
  } catch (error) {
    console.error('Error in fetchVenues:', error);
    // Return empty array as fallback to prevent UI crash
    return [];
  }
};

/**
 * Updates venue profile details (Listing management)
 * Strictly adheres to Allowed Fields whitelisted in server/src/venueService.ts
 */
export const updateVenueDetails = async (venueId: string, updates: Partial<Venue>, userId?: string): Promise<{ success: boolean, updates: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/venues/${venueId}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ updates, userId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update venue: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in updateVenueDetails:', error);
    throw error;
  }
};

/**
 * Trigger a backend sync with Google Places API
 */
export const syncVenueWithGoogle = async (venueId: string, manualPlaceId?: string): Promise<{ success: boolean, message: string, updates: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/venues/${venueId}/sync-google`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ googlePlaceId: manualPlaceId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to sync with Google');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Error in syncVenueWithGoogle:', error);
    throw error;
  }
};

/**
 * Pulse Calculation Helpers (Shared Logic)
 * Ensures frontend display logic matches backend scoring weights.
 */
export const getPulsePoints = () => PULSE_CONFIG.POINTS;
export const getPulseThresholds = () => PULSE_CONFIG.THRESHOLDS;

/**
 * Fetch real-time Pulse score for a venue
 */
export const fetchVenuePulse = async (venueId: string): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/venues/${venueId}/pulse`);
    if (!response.ok) {
      throw new Error(`Failed to fetch pulse: ${response.statusText}`);
    }
    const data = await response.json();
    return data.pulse;
  } catch (error) {
    console.error('Error in fetchVenuePulse:', error);
    return 0;
  }
};
