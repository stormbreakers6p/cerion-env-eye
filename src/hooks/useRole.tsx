import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { isRole, type Permission, type Role, hasPermission as rbacHas } from "@/lib/rbac";
import { useAuth } from "@/hooks/useAuth";

const ROLE_OVERRIDE_KEY = "cerion.role";
const SCHOOL_KEY = "cerion.selectedSchool";

/** Default role used when the account has no `role` custom claim yet. */
const DEFAULT_ROLE: Role = "owner";

type RoleContextValue = {
  role: Role | null;
  loading: boolean;
  /** Prototype-only override so the interface can be reviewed as any role. */
  setRoleOverride: (role: Role) => void;
  can: (permission: Permission) => boolean;
  selectedSchool: string | null;
  setSelectedSchool: (school: string | null) => void;
};

const RoleContext = createContext<RoleContextValue>({
  role: null,
  loading: true,
  setRoleOverride: () => {},
  can: () => false,
  selectedSchool: null,
  setSelectedSchool: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [claimRole, setClaimRole] = useState<Role | null>(null);
  const [override, setOverride] = useState<Role | null>(null);
  const [selectedSchool, setSelectedSchoolState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRole = window.localStorage.getItem(ROLE_OVERRIDE_KEY);
    if (isRole(storedRole)) setOverride(storedRole);
    setSelectedSchoolState(window.localStorage.getItem(SCHOOL_KEY));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function resolveClaim() {
      if (authLoading) return;
      if (!user || !isFirebaseConfigured) {
        if (!cancelled) {
          setClaimRole(null);
          setLoading(false);
        }
        return;
      }
      try {
        const token = await getFirebaseAuth().currentUser?.getIdTokenResult();
        const claim = token?.claims?.["role"];
        if (!cancelled && isRole(claim)) {
          setClaimRole(claim);
        } else {
          // Fall back to the stored CERION profile (created by user management).
          const profile = await getUserProfile(user.uid).catch(() => null);
          if (cancelled) return;
          if (profile?.disabled) {
            await signOut();
            return;
          }
          setClaimRole(profile ? profile.role : null);
          if (profile?.school) setSelectedSchoolState(profile.school);
        }
      } catch {
        if (!cancelled) setClaimRole(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void resolveClaim();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, signOut]);


  const setRoleOverride = useCallback((next: Role) => {
    setOverride(next);
    window.localStorage.setItem(ROLE_OVERRIDE_KEY, next);
  }, []);

  const setSelectedSchool = useCallback((school: string | null) => {
    setSelectedSchoolState(school);
    if (school) window.localStorage.setItem(SCHOOL_KEY, school);
    else window.localStorage.removeItem(SCHOOL_KEY);
  }, []);

  const role: Role | null = user ? (claimRole ?? override ?? DEFAULT_ROLE) : null;

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      loading: authLoading || loading,
      setRoleOverride,
      can: (permission: Permission) => rbacHas(role, permission),
      selectedSchool,
      setSelectedSchool,
    }),
    [role, authLoading, loading, setRoleOverride, selectedSchool, setSelectedSchool],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
