import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import { api } from "@/core/lib/api";
import { toast } from "sonner";
import { DashboardStats } from "../types/dashboard.types";

interface DashboardContextValue {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchDashboardStats: (force?: boolean) => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFetchedRef = useRef(false);
  const inFlightRequestRef = useRef<Promise<any> | null>(null);

  const fetchDashboardStats = useCallback(async (force = false) => {
    if (isFetchedRef.current && !force) {
      return;
    }

    if (inFlightRequestRef.current) {
      return inFlightRequestRef.current;
    }

    setLoading(true);
    setError(null);

    const request = api
      .get<DashboardStats>("/stats/dashboard")
      .then((data) => {
        setStats(data || null);
        isFetchedRef.current = true;
      })
      .catch((err) => {
        const msg = err.message || "Failed to load dashboard metrics";
        setError(msg);
        console.error("Dashboard stats error:", err);
      })
      .finally(() => {
        setLoading(false);
        inFlightRequestRef.current = null;
      });

    inFlightRequestRef.current = request;
    return request;
  }, []);

  const refreshDashboard = useCallback(async () => {
    await fetchDashboardStats(true);
  }, [fetchDashboardStats]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const value = useMemo(
    () => ({
      stats,
      loading,
      error,
      fetchDashboardStats,
      refreshDashboard,
    }),
    [stats, loading, error, fetchDashboardStats, refreshDashboard]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export default DashboardContext;
