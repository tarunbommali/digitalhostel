import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/core/lib/api";

export type AppRole = "admin" | "moderator" | "student" | "security_guard";
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
  moderatorType?: ModeratorType;
}

interface AuthState {
  user: User | null;
  role: AppRole | null;
  moderatorType: ModeratorType | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [moderatorType, setModeratorType] = useState<ModeratorType | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.get<any>("/auth/me");
      const mType = data.moderatorType || "full";
      setUser({
        id: data.id,
        email: data.email,
        role: data.role,
        fullName: data.fullName,
        moderatorType: mType,
      });
      setRole(data.role);
      setModeratorType(mType);
    } catch (err) {
      console.error("Token verification failed:", err);
      localStorage.removeItem("token");
      setUser(null);
      setRole(null);
      setModeratorType(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.post<{ token: string; user: User }>(
        "/auth/login",
        { email, password },
      );
      if (!data || !data.user) {
        return { error: "Invalid response from server" };
      }
      const mType = data.user.moderatorType || "full";
      localStorage.setItem("token", data.token);
      setUser({ ...data.user, moderatorType: mType });
      setRole(data.user.role);
      setModeratorType(mType);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to sign in" };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("token");
    setUser(null);
    setRole(null);
    setModeratorType(null);
  };

  return (
    <AuthCtx.Provider value={{ user, role, moderatorType, loading, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
