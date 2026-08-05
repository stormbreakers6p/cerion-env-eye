import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const env = import.meta.env as Record<string, string | undefined>;

const firebaseConfig: FirebaseOptions = {
  apiKey: env["VITE_FIREBASE_API_KEY"] ?? "",
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"] ?? "",
  projectId: env["VITE_FIREBASE_PROJECT_ID"] ?? "",
  storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"] ?? "",
  messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"] ?? "",
  appId: env["VITE_FIREBASE_APP_ID"] ?? "",
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
