import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserAlertPreferences, CheckInRecord, UserProfile } from '../types';

const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const API_BASE_URL = (isLocalhost ? 'http://localhost:3001' : (import.meta.env.VITE_API_URL || 'https://olybars-backend-juthzlaerq-uw.a.run.app')) + '/api';

export const saveAlertPreferences = async (userId: string, prefs: UserAlertPreferences) => {
  try {
    await setDoc(doc(db, 'users', userId), { preferences: prefs }, { merge: true });
  } catch (e) {
    console.error('Error saving prefs:', e);
  }
};

/**
 * Log user activity and award points via the production backend.
 */
export const logUserActivity = async (userId: string, activity: {
  type: string,
  venueId?: string,
  points: number,
  hasConsent?: boolean,
  metadata?: any
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...activity })
    });
    if (!response.ok) throw new Error('Failed to log activity');
    return await response.json();
  } catch (e) {
    console.error('Activity logging error:', e);
    // Fallback to local log if offline (for MVP resilience)
  }
};

/**
 * Fetch aggregated activity statistics for a venue.
 */
export const fetchActivityStats = async (venueId: string, period: string = 'week') => {
  try {
    const response = await fetch(`${API_BASE_URL}/activity?venueId=${venueId}&period=${period}`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (e) {
    console.error('Stats fetch error:', e);
    return { earned: 0, redeemed: 0, activeUsers: 0 };
  }
};

/**
 * Update photo approval status in the venue document.
 */
export const updatePhotoApproval = async (venueId: string, photoId: string, updates: { isApprovedForFeed?: boolean, isApprovedForSocial?: boolean }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/venues/${venueId}/photos/${photoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update photo approval');
    return await response.json();
  } catch (e) {
    console.error('Photo approval error:', e);
    throw e;
  }
};

/**
 * Perform a geofenced check-in via the production backend.
 */
export const performCheckIn = async (venueId: string, userId: string, lat: number, lng: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueId, userId, lat, lng })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Check-in failed');
    }

    return await response.json();
  } catch (e) {
    console.error('Check-in error:', e);
    throw e;
  }
};

export const syncCheckIns = async (userId: string, history: CheckInRecord[]) => {
  try {
    await setDoc(doc(db, 'users', userId), { checkInHistory: history }, { merge: true });
  } catch (e) {
    console.error('Error syncing checkins:', e);
  }
};

export const setupAdmin = async (email: string, secretKey: string, password?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/setup-super`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, secretKey, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Promotion failed');
    }
    return await response.json();
  } catch (e) {
    console.error('Admin setup error:', e);
    throw e;
  }
};
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Update failed');
    }
    return await response.json();
  } catch (e) {
    console.error('Update profile error:', e);
    throw e;
  }
};
