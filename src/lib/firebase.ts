import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const env = import.meta.env as Record<string, string | undefined>;

// Firebase web config is publishable by design (protected by Firebase security rules).
const firebaseConfig: FirebaseOptions = {
  apiKey: env["VITE_FIREBASE_API_KEY"] ?? "AIzaSyCBs47AQkI-nUNOGqrJ0YfITh_YMqvZxAA",
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"] ?? "cerion-platform.firebaseapp.com",
  projectId: env["VITE_FIREBASE_PROJECT_ID"] ?? "cerion-platform",
  storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"] ?? "cerion-platform.firebasestorage.app",
  messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"] ?? "687869164022",
  appId: env["VITE_FIREBASE_APP_ID"] ?? "1:687869164022:web:fe05dc33d6ef371aedafd7",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

let cached: Auth | null = null;

/** Client-only. Never call during SSR. */
export function getFirebaseAuth(): Auth {
  if (cached) return cached;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  cached = getAuth(app);
  return cached;
}
