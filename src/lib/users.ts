/**
 * User management data layer (Firebase Auth + Firestore).
 *
 * Accounts are created with an isolated Firebase app so the acting
 * administrator keeps their own session. Profiles live in the `users`
 * collection keyed by the Firebase Auth UID.
 */
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, withSecondaryAuth } from "@/lib/firebase";
import { ROLES, type Role } from "@/lib/rbac";

export const USERS_COLLECTION = "users";

export type UserProfile = {
  uid: string;
  fullName: string;
  email: string;
  role: Role;
  school: string;
  classrooms: string[];
  disabled: boolean;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateUserInput = {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  school: string;
  classrooms: string[];
};

export type UpdateUserInput = {
  fullName: string;
  role: Role;
  school: string;
  classrooms: string[];
};

/** Roles an actor is allowed to create or assign. */
export function assignableRoles(actorRole: Role | null): Role[] {
  if (actorRole === "owner") return [...ROLES];
  if (actorRole === "admin") return ["teacher", "viewer"];
  return [];
}

export function canManageUser(actorRole: Role | null, actorSchool: string | null, target: UserProfile): boolean {
  if (actorRole === "owner") return true;
  if (actorRole === "admin") {
    return assignableRoles("admin").includes(target.role) && (!actorSchool || target.school === actorSchool);
  }
  return false;
}

function toProfile(id: string, data: Record<string, unknown>): UserProfile {
  const role = data["role"];
  return {
    uid: id,
    fullName: typeof data["fullName"] === "string" ? data["fullName"] : "",
    email: typeof data["email"] === "string" ? data["email"] : "",
    role: (ROLES as readonly string[]).includes(role as string) ? (role as Role) : "viewer",
    school: typeof data["school"] === "string" ? data["school"] : "",
    classrooms: Array.isArray(data["classrooms"]) ? (data["classrooms"] as string[]) : [],
    disabled: data["disabled"] === true,
    createdBy: typeof data["createdBy"] === "string" ? data["createdBy"] : null,
    createdAt: readTime(data["createdAt"]),
    updatedAt: readTime(data["updatedAt"]),
  };
}

function readTime(value: unknown): string | null {
  if (value && typeof value === "object" && "toDate" in (value as object)) {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return null;
    }
  }
  return typeof value === "string" ? value : null;
}

export async function listUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(getFirebaseDb(), USERS_COLLECTION), orderBy("fullName")));
  return snap.docs.map((d) => toProfile(d.id, d.data()));
}

/** Live user list; returns an unsubscribe function. */
export function subscribeUsers(
  onData: (users: UserProfile[]) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getFirebaseDb(), USERS_COLLECTION),
    (snap) => {
      const rows = snap.docs.map((d) => toProfile(d.id, d.data()));
      rows.sort((a, b) => a.fullName.localeCompare(b.fullName));
      onData(rows);
    },
    onError,
  );
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getFirebaseDb(), USERS_COLLECTION, uid));
  return snap.exists() ? toProfile(snap.id, snap.data()) : null;
}

export async function createUserAccount(
  input: CreateUserInput,
  actorRole: Role | null,
  actorEmail: string | null,
): Promise<UserProfile> {
  if (!assignableRoles(actorRole).includes(input.role)) {
    throw new Error("permission");
  }

  const uid = await withSecondaryAuth(async (auth) => {
    const credential = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);
    if (input.fullName.trim()) {
      await updateProfile(credential.user, { displayName: input.fullName.trim() });
    }
    return credential.user.uid;
  });

  await setDoc(doc(getFirebaseDb(), USERS_COLLECTION, uid), {
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    role: input.role,
    school: input.school.trim(),
    classrooms: input.classrooms,
    disabled: false,
    createdBy: actorEmail ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    uid,
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    role: input.role,
    school: input.school.trim(),
    classrooms: input.classrooms,
    disabled: false,
  };
}

export async function updateUserAccount(uid: string, input: UpdateUserInput, actorRole: Role | null): Promise<void> {
  if (!assignableRoles(actorRole).includes(input.role)) throw new Error("permission");
  await updateDoc(doc(getFirebaseDb(), USERS_COLLECTION, uid), {
    fullName: input.fullName.trim(),
    role: input.role,
    school: input.school.trim(),
    classrooms: input.classrooms,
    updatedAt: serverTimestamp(),
  });
}

export async function setUserDisabled(uid: string, disabled: boolean): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), USERS_COLLECTION, uid), {
    disabled,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUserAccount(uid: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), USERS_COLLECTION, uid));
}

export async function resetUserPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

/** Maps Firebase error codes to translation keys. */
export function userErrorKey(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code: string }).code) : "";
  if (code === "auth/email-already-in-use") return "users.error.emailInUse";
  if (code === "auth/invalid-email") return "users.error.invalidEmail";
  if (code === "auth/weak-password") return "users.error.weakPassword";
  if (code.startsWith("permission-denied") || code === "permission-denied") return "users.error.permission";
  if (error instanceof Error && error.message === "permission") return "users.error.permission";
  return "users.error.generic";
}
