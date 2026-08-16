import {
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
  type UserCredential,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

/** Persist the session in localStorage (default) or for the tab only. */
export async function applyPersistence(remember: boolean): Promise<void> {
  await setPersistence(getFirebaseAuth(), remember ? browserLocalPersistence : browserSessionPersistence);
}

export async function loginWithEmail(email: string, password: string, remember = true): Promise<UserCredential> {
  await applyPersistence(remember);
  return signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
}

/** Error codes that mean "the user simply closed / cancelled the popup". */
const CANCELLED_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
]);

export function isCancelledPopup(error: unknown): boolean {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code: string }).code) : "";
  return CANCELLED_CODES.has(code);
}

/**
 * Ensure a Firestore profile exists at `users/{uid}`. Existing profiles are
 * never overwritten, so administrator-assigned roles stay intact.
 */
export async function ensureUserDocument(user: User): Promise<void> {
  const ref = doc(getFirebaseDb(), "users", user.uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;
  const name = user.displayName?.trim() || user.email?.split("@")[0] || "CERION user";
  await setDoc(ref, {
    uid: user.uid,
    name,
    fullName: name,
    email: user.email ?? "",
    role: "viewer",
    status: "active",
    disabled: false,
    school: "",
    classrooms: [],
    createdAt: serverTimestamp(),
  });
}

/** Google sign-in through the existing Firebase Authentication project. */
export async function signInWithGoogle(remember = true): Promise<UserCredential> {
  await applyPersistence(remember);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(getFirebaseAuth(), provider);
  try {
    await ensureUserDocument(credential.user);
  } catch (error) {
    // Profile creation is best-effort; sign-in itself already succeeded.
    console.warn("[CERION] Could not create the Firestore profile for this account.", error);
  }
  return credential;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
}

export async function sendVerification(user: User): Promise<void> {
  await sendEmailVerification(user);
}

export async function logout(): Promise<void> {
  await signOut(getFirebaseAuth());
}

/** Human-readable message for a Firebase error. */
export function firebaseErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code: string }).code) : "";
  switch (code) {
    case "auth/invalid-email":
      return "That email address is not valid.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/missing-password":
      return "Please enter your password.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact your administrator.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled for this project. Ask your administrator to enable it in the Firebase console.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/user-cancelled":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup. Allow popups and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorised for Google sign-in. Ask your administrator to add it in the Firebase console.";
    case "auth/account-exists-with-different-credential":
      return "An account with this email already exists. Sign in with your email and password instead.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "permission-denied":
      return "You do not have permission to perform this action.";
    case "unavailable":
      return "Cloud Firestore is unreachable. Check that it is enabled for this project.";
    default:
      return error instanceof Error && error.message ? error.message : "Something went wrong. Please try again.";
  }
}
