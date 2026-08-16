import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { api } from "@/core/lib/api";

export type AppRole =
  | "super_admin"
  | "admin"
  | "moderator"
  | "student"
  | "security_guard";

export type ModeratorType =
  | "administration"
  | "discipline_monitor"
  | "attendance_only"
  | "security_guard"
  | "full";

export interface User {
  id: string;
  email: string;
  role: AppRole;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  organizationId?: string;
  organizationSlug?: string;
  organizationName?: string;
  moderatorType?: ModeratorType;
  emailVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface AuthState {
  user: User | null;
  role: AppRole | null;
  moderatorType: ModeratorType | null;
  organizationId: string | null;
  loading: boolean;
  isInOrganizationContext: () => boolean;
  clearOrganizationContext: () => void;
  signIn: (
    email: string,
    password: string,
    organizationSlug?: string
  ) => Promise<{ error: string | null; user?: User }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [moderatorType, setModeratorType] = useState<ModeratorType | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // useRef to track component mount status to avoid state updates on unmounted component
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isInOrganizationContext = useCallback((): boolean => {
    return !!organizationId && !!user && role !== "super_admin";
  }, [organizationId, user, role]);

  const clearOrganizationContext = useCallback(() => {
    setOrganizationId(null);
    localStorage.removeItem("organizationId");
    Object.keys(localStorage)
      .filter((key) => key.startsWith("org_mapping_"))
      .forEach((key) => localStorage.removeItem(key));
  }, []);

  const setAuthState = useCallback((userData: User | null) => {
    if (!isMountedRef.current) return;

    if (!userData) {
      setUser(null);
      setRole(null);
      setModeratorType(null);
      setOrganizationId(null);
      localStorage.removeItem("organizationId");
      return;
    }

    const orgId = userData.organizationId || null;
    setUser(userData);
    setRole(userData.role);
    setOrganizationId(orgId);

    if (orgId) {
      localStorage.setItem("organizationId", orgId);
    } else {
      localStorage.removeItem("organizationId");
    }

    if (userData.moderatorType) {
      setModeratorType(userData.moderatorType);
    }
  }, []);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (isMountedRef.current) setLoading(false);
      return;
    }

    try {
      const data = await api.get<any>("/auth/me");
      const mType = data.moderatorType || "full";
      
      const orgObj = typeof data.organizationId === "object" ? data.organizationId : null;
      const orgId = orgObj ? (orgObj._id || orgObj.id) : (typeof data.organizationId === "string" ? data.organizationId : undefined);
      const orgSlug = orgObj?.slug || localStorage.getItem("tenant_slug") || undefined;
      const orgName = orgObj?.name || localStorage.getItem("tenant_name") || undefined;

      if (orgSlug) localStorage.setItem("tenant_slug", orgSlug);
      if (orgName) localStorage.setItem("tenant_name", orgName);

      const userData: User = {
        id: data.id || data._id,
        email: data.email,
        role: data.role,
        fullName: data.fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || data.phone,
        organizationId: orgId,
        organizationSlug: orgSlug,
        organizationName: orgName,
        moderatorType: mType,
        emailVerified: data.emailVerified || false,
        isActive: data.isActive !== undefined ? data.isActive : true,
        lastLoginAt: data.lastLoginAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      setAuthState(userData);
    } catch (err) {
      console.error("Token verification failed:", err);
      localStorage.removeItem("token");
      setAuthState(null);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [setAuthState]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const signIn = useCallback(
    async (
      email: string,
      password: string,
      organizationSlug?: string
    ) => {
      try {
        const data = await api.post<{ token: string; user: any }>(
          "/auth/login",
          { email, password },
          { noAuth: true }
        );

        if (!data || !data.user) {
          return { error: "Invalid response from server" };
        }

        // Validate user belongs to target organization if slug is provided
        if (organizationSlug && data.user.role !== "super_admin") {
          try {
            const userOrg = await api.get<any>(
              `/organizations/by-slug/${organizationSlug}`,
              { noAuth: true }
            );
            if (
              userOrg &&
              userOrg._id &&
              data.user.organizationId &&
              userOrg._id.toString() !== data.user.organizationId.toString()
            ) {
              return {
                error: "You don't have access to this organization",
              };
            }
            if (userOrg && userOrg._id) {
              localStorage.setItem(`org_mapping_${organizationSlug}`, userOrg._id);
            }
          } catch (orgErr) {
            console.warn("Organization validation warning:", orgErr);
          }
        }

        const orgObj = typeof data.user.organizationId === "object" ? data.user.organizationId : null;
        const orgId = orgObj ? (orgObj._id || orgObj.id) : (typeof data.user.organizationId === "string" ? data.user.organizationId : undefined);
        const orgSlug = organizationSlug || orgObj?.slug || localStorage.getItem("tenant_slug") || undefined;
        const orgName = orgObj?.name || localStorage.getItem("tenant_name") || undefined;

        if (orgSlug) localStorage.setItem("tenant_slug", orgSlug);
        if (orgName) localStorage.setItem("tenant_name", orgName);

        const mType = data.user.moderatorType || "full";
        const userData: User = {
          id: data.user.id || data.user._id,
          email: data.user.email,
          role: data.user.role,
          fullName: data.user.fullName,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phoneNumber: data.user.phoneNumber || data.user.phone,
          organizationId: orgId,
          organizationSlug: orgSlug,
          organizationName: orgName,
          moderatorType: mType,
          emailVerified: data.user.emailVerified || false,
          isActive: data.user.isActive !== undefined ? data.user.isActive : true,
          lastLoginAt: data.user.lastLoginAt,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt,
        };

        localStorage.setItem("token", data.token);
        setAuthState(userData);

        return { error: null, user: userData };
      } catch (err: any) {
        return { error: err.message || "Failed to sign in" };
      }
    },
    [setAuthState]
  );

  const signOut = useCallback(async () => {
    try {
      await api.post("/auth/logout", {}, { noAuth: true });
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem("token");
    localStorage.removeItem("tenant_slug");
    localStorage.removeItem("tenant_name");
    clearOrganizationContext();
    setAuthState(null);
  }, [clearOrganizationContext, setAuthState]);

  const refreshUser = useCallback(async () => {
    await initAuth();
  }, [initAuth]);

  // Memoize context value to prevent un-necessary re-renders of all consumer components
  const value = useMemo(
    () => ({
      user,
      role,
      moderatorType,
      organizationId,
      loading,
      isInOrganizationContext,
      clearOrganizationContext,
      signIn,
      signOut,
      refreshUser,
    }),
    [
      user,
      role,
      moderatorType,
      organizationId,
      loading,
      isInOrganizationContext,
      clearOrganizationContext,
      signIn,
      signOut,
      refreshUser,
    ]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
