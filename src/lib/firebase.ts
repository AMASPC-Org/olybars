import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXElh6HgU4Rl5fvhjMAXyn19ji3azWTJg",
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