/**
 * Email/password authentication helpers for CERION.
 *
 * Registration creates the Firebase Auth account and the matching Firestore
 * profile document at `users/{uid}` (lowercase collection).
 */
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type UserCredential,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { USERS_COLLECTION } from "@/lib/users";

export const DEFAULT_ROLE = "user";
export const DEFAULT_STATUS = "active";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

/** Persist the session in localStorage (default) or for the tab only. */
export async function applyPersistence(remember: boolean): Promise<void> {
  await setPersistence(getFirebaseAuth(), remember ? browserLocalPersistence : browserSessionPersistence);
}

/** Creates `users/{uid}` if it does not exist yet. */
export async function ensureUserDocument(uid: string, name: string, email: string): Promise<void> {
  const ref = doc(getFirebaseDb(), USERS_COLLECTION, uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return;
  await setDoc(ref, {
    uid,
    name,
    fullName: name,
    email,
    role: DEFAULT_ROLE,
    status: DEFAULT_STATUS,
    disabled: false,
    school: "",
    classrooms: [],
    createdAt: serverTimestamp(),
  });
}

export async function registerWithEmail(input: RegisterInput, remember = true): Promise<UserCredential> {
  await applyPersistence(remember);
  const name = input.name.trim();
  const email = input.email.trim();
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, input.password);
  if (name) await updateProfile(credential.user, { displayName: name });
  await ensureUserDocument(credential.user.uid, name, email);
  return credential;
}

export async function loginWithEmail(email: string, password: string, remember = true): Promise<UserCredential> {
  await applyPersistence(remember);
  return signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
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
      return "Email/password sign-in is not enabled for this project.";
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
