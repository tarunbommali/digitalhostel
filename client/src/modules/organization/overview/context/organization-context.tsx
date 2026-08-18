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
import { useTenant } from "@/core/context/tenant-context";
import { OrganizationStats } from "../types/organization.types";

interface OrganizationContextValue {
  stats: OrganizationStats | null;
  loadingStats: boolean;
  fetchStats: (force?: boolean) => Promise<void>;
  refreshOrganization: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { organization } = useTenant();
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const isFetchedRef = useRef(false);
  const inFlightRequestRef = useRef<Promise<any> | null>(null);

  const fetchStats = useCallback(async (force = false) => {
    if (isFetchedRef.current && !force) return;
    if (inFlightRequestRef.current) return inFlightRequestRef.current;

    setLoadingStats(true);
    const request = api
      .get<OrganizationStats>("/stats/dashboard")
      .then((data) => {
        setStats(data || null);
        isFetchedRef.current = true;
      })
      .catch((err) => {
        console.error("Failed to load organization statistics:", err);
      })
      .finally(() => {
        setLoadingStats(false);
        inFlightRequestRef.current = null;
      });

    inFlightRequestRef.current = request;
    return request;
  }, []);

  const refreshOrganization = useCallback(async () => {
    await fetchStats(true);
  }, [fetchStats]);

  useEffect(() => {
    if (organization) {
      fetchStats();
    }
  }, [organization, fetchStats]);

  const value = useMemo(
    () => ({
      stats,
      loadingStats,
      fetchStats,
      refreshOrganization,
    }),
    [stats, loadingStats, fetchStats, refreshOrganization]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
};

export default OrganizationContext;
