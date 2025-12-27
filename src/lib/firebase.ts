import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

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

// Initialize App Check
if (typeof window !== 'undefined') {
  const isDebug = import.meta.env.VITE_APP_CHECK_DEBUG === 'true' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (isDebug) {
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    console.log('🛡️ [AppCheck] Debug mode enabled');
  }
  const siteKey = import.meta.env.VITE_APP_CHECK_KEY;

  if (siteKey && !siteKey.includes('PLACEHOLDER') && siteKey.length > 20) {
    console.log('🛡️ [AppCheck] Initializing with Site Key');
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true
    });
  } else if (isDebug) {
    console.log('🛡️ [AppCheck] Initializing in Debug mode');
    // For debug mode, we can use a dummy key or just the debug token property
    // But initializeAppCheck still needs a provider instance.
    const dummyKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Standard ReCAPTCHA test key
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(dummyKey),
      isTokenAutoRefreshEnabled: true
    });
  } else {
    console.warn('⚠️ [AppCheck] Skipping initialization: Missing or invalid Site Key.');
  }
}

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