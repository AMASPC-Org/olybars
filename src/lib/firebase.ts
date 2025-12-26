import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAfEWY4NF8WDeh612ctG2VNLjSiIcMCRqk",
  authDomain: "ama-ecosystem-prod.firebaseapp.com",
  projectId: "ama-ecosystem-prod",
  storageBucket: "ama-ecosystem-prod.firebasestorage.app",
  messagingSenderId: "26629455103",
  appId: "1:26629455103:web:987d7a42b4dd82a38720ca"
};

// Initialize the Shared Network Backend
const app = initializeApp(firebaseConfig);

// Export the services so the rest of the app can use them
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const functions = getFunctions(app, 'us-west1');

// DISABLED: Forcing emulator connect on localhost was blocking Artie when emulators aren't running.
// To use emulators, explicitly enable this or use an environment variable.
/*
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
*/