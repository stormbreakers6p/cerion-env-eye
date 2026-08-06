import { initializeApp, getApps, getApp, deleteApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

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
let cachedDb: Firestore | null = null;

function app(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/** Client-only. Never call during SSR. */
export function getFirebaseAuth(): Auth {
  if (cached) return cached;
  cached = getAuth(app());
  return cached;
}

/** Client-only Firestore instance used for user profiles and organisation data. */
export function getFirebaseDb(): Firestore {
  if (cachedDb) return cachedDb;
  cachedDb = getFirestore(app());
  return cachedDb;
}

/**
 * Isolated Firebase app used to create accounts without replacing the current
 * session (createUserWithEmailAndPassword signs the new user in on its app).
 * Callers must dispose it with `disposeSecondaryAuth`.
 */
export async function withSecondaryAuth<T>(run: (auth: Auth) => Promise<T>): Promise<T> {
  const secondary = initializeApp(firebaseConfig, `cerion-provisioning-${Date.now()}`);
  const secondaryAuth = getAuth(secondary);
  try {
    return await run(secondaryAuth);
  } finally {
    try {
      await secondaryAuth.signOut();
    } catch {
      /* ignore */
    }
    await deleteApp(secondary);
  }
}

