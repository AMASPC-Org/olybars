import { UserAlertPreferences, CheckInRecord, PointsReason } from '../types';

export const saveAlertPreferences = async (prefs: UserAlertPreferences) => {
  console.log("Saving prefs (Future Firestore Write):", prefs);
};

export const logUserActivity = async (activity: { type: PointsReason, timestamp: number }) => {
  console.log("Logging activity (Future Firestore Write):", activity);
};

export const syncCheckIns = async (history: CheckInRecord[]) => {
  console.log("Syncing check-ins (Future Firestore Write):", history);
};
