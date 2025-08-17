import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAV8EITshJJO_-NGkBOMiU3gIIMs0vZirQ",
  authDomain: "skopeo-ai.firebaseapp.com",
  projectId: "skopeo-ai",
  storageBucket: "skopeo-ai.firebasestorage.app",
  messagingSenderId: "295265049654",
  appId: "1:295265049654:web:486856ccde50928efe8c97",
  measurementId: "G-S7Y1FDBM6L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Debug Firebase connection
console.log('Firebase initialized with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

export default app;
