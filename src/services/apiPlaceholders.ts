import { UserAlertPreferences, ClockInRecord, PointsReason } from '../types';

export const saveAlertPreferences = async (prefs: UserAlertPreferences) => {
  console.log("Saving prefs (Future Firestore Write):", prefs);
};

export const logUserActivity = async (activity: { type: PointsReason, timestamp: number }) => {
  console.log("Logging activity (Future Firestore Write):", activity);
};

export const syncClockIns = async (history: ClockInRecord[]) => {
  console.log("Syncing clock-ins (Future Firestore Write):", history);
};
