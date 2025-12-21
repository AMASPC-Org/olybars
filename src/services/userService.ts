import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserAlertPreferences, CheckInRecord } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

export const saveAlertPreferences = async (userId: string, prefs: UserAlertPreferences) => {
  try {
    await setDoc(doc(db, 'users', userId), { preferences: prefs }, { merge: true });
  } catch (e) {
    console.error('Error saving prefs:', e);
  }
};

/**
 * Placeholder for activity logging. In Phase 4, this might move to a central API.
 */
export const logUserActivity = async (userId: string, activity: any) => {
  console.log('Logging user activity locally (WIP):', activity);
  // Optional: Restore Firestore write if user profile is public
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
