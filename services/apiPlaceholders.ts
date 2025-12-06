import { UserAlertPreferences, CheckInRecord } from '../types';

// These are placeholder hooks for future Firebase/Backend integration.

export const saveAlertPreferences = async (prefs: UserAlertPreferences) => {
  // TODO: Connect to Firestore or Cloud Run API
  console.log('API: Saving preferences', prefs);
  return Promise.resolve(true);
};

export const logUserActivity = async (activity: {
  type: 'checkin' | 'photo' | 'share';
  venueId?: string;
  timestamp: number;
  details?: any;
}) => {
  // TODO: Log to Firestore "Activity" collection
  console.log('API: Logging activity', activity);
  return Promise.resolve(true);
};

export const createOwnerPromoFromText = async (ownerId: string, text: string) => {
  // TODO: Called from SMS webhook or Owner Portal
  console.log('API: Creating promo for', ownerId, text);
  return Promise.resolve(true);
};

export const syncCheckIns = async (history: CheckInRecord[]) => {
    // TODO: Sync local check-in history with server to prevent device spoofing
    console.log('API: Syncing check-ins', history);
    return Promise.resolve(true);
}