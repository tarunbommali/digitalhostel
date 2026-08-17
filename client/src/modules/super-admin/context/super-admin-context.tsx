import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { api } from "@/core/lib/api";
import { toast } from "sonner";
import { Organization, KPIMetrics } from "../types/organization.types";

interface SuperAdminContextType {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  kpis: KPIMetrics;
  fetchOrganizations: (force?: boolean) => Promise<void>;
  getOrganizationById: (id: string) => Organization | undefined;
  updateOrganizationInState: (id: string, updated: Partial<Organization>) => void;
  addOrganizationToState: (org: Organization) => void;
  removeOrganizationFromState: (id: string) => void;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const SuperAdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchedRef = useRef<boolean>(false);

  const fetchOrganizations = useCallback(async (force = false) => {
    // If already fetched and not forced, reuse existing context state
    if (isFetchedRef.current && !force) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Organization[]>("/super-admin/organizations");
      setOrganizations(data || []);
      isFetchedRef.current = true;
    } catch (err: any) {
      const msg = err.message || "Failed to load registered organizations";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch once when provider mounts
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Derived KPI metrics calculated in memory
  const kpis: KPIMetrics = useMemo(() => {
    const total = organizations.length;
    const active = organizations.filter(
      (o) => (o.subscriptionStatus || "").toLowerCase() === "active"
    ).length;
    const totalUsers = organizations.reduce((acc, o) => acc + (o.totalUsers || 1), 0);
    const enterpriseCount = organizations.filter(
      (o) => (o.plan || "").toUpperCase() === "ENTERPRISE"
    ).length;
    const proCount = organizations.filter(
      (o) => (o.plan || "").toUpperCase() === "PRO"
    ).length;
    const basicCount = organizations.filter(
      (o) => (o.plan || "").toUpperCase() === "BASIC"
    ).length;

    return { total, active, totalUsers, enterpriseCount, proCount, basicCount };
  }, [organizations]);

  const getOrganizationById = useCallback(
    (id: string) => {
      return organizations.find((o) => o._id === id || o.id === id);
    },
    [organizations]
  );

  const updateOrganizationInState = useCallback((id: string, updated: Partial<Organization>) => {
    setOrganizations((prev) =>
      prev.map((org) => {
        if (org._id === id || org.id === id) {
          return {
            ...org,
            ...updated,
            branding: {
              ...org.branding,
              ...updated.branding,
            },
          };
        }
        return org;
      })
    );
  }, []);

  const addOrganizationToState = useCallback((org: Organization) => {
    setOrganizations((prev) => [org, ...prev]);
  }, []);

  const removeOrganizationFromState = useCallback((id: string) => {
    setOrganizations((prev) => prev.filter((o) => o._id !== id && o.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      organizations,
      loading,
      error,
      kpis,
      fetchOrganizations,
      getOrganizationById,
      updateOrganizationInState,
      addOrganizationToState,
      removeOrganizationFromState,
    }),
    [
      organizations,
      loading,
      error,
      kpis,
      fetchOrganizations,
      getOrganizationById,
      updateOrganizationInState,
      addOrganizationToState,
      removeOrganizationFromState,
    ]
  );

  return <SuperAdminContext.Provider value={value}>{children}</SuperAdminContext.Provider>;
};

export const useSuperAdmin = (): SuperAdminContextType => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error("useSuperAdmin must be used within a SuperAdminProvider");
  }
  return context;
};

export default SuperAdminContext;
