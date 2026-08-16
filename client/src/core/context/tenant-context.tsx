import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { api } from "@/core/lib/api";

export interface OrganizationBranding {
  tagline?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  bannerUrl?: string;
  faviconUrl?: string;
}

export interface OrganizationSettings {
  maxStudents?: number;
  maxRooms?: number;
  maxStaff?: number;
  allowBulkImport?: boolean;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  location: string;
  plan?: string;
  subscriptionPlan?: "basic" | "pro" | "enterprise" | "Basic" | "Pro" | "Enterprise";
  subscriptionStatus?: "active" | "trial" | "expired" | "cancelled" | "Active" | "Trial" | "Expired" | "Cancelled";
  createdDate?: string;
  adminEmail: string;
  contactPhone?: string;
  supportEmail?: string;
  branding?: OrganizationBranding;
  settings?: OrganizationSettings;
  maxStudents?: number;
  maxRooms?: number;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface TenantContextType {
  organization: Organization | null;
  loading: boolean;
  error: string | null;
  fetchTenantBySlug: (slug: string) => Promise<Organization | null>;
  clearTenant: () => void;
  validateUserAccess: (userOrgId?: string) => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // useRef to keep stable reference to active organization & prevent dependency re-triggers
  const orgRef = useRef<Organization | null>(null);
  useEffect(() => {
    orgRef.current = organization;
  }, [organization]);

  // useRef to deduplicate in-flight parallel network requests for the same tenant slug
  const inFlightRequestsRef = useRef<Map<string, Promise<Organization | null>>>(new Map());

  const applyTenantBranding = useCallback((org: Organization | null) => {
    if (!org) return;

    const root = document.documentElement;
    const primary = org.branding?.primaryColor || "#6366f1";
    const secondary = org.branding?.secondaryColor || "#4f46e5";

    root.style.setProperty("--tenant-primary", primary);
    root.style.setProperty("--tenant-secondary", secondary);
    root.style.setProperty("--primary", primary);

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", primary);
    }

    if (org.name) {
      document.title = `${org.name} - Inside Home Hostel Management`;
    }
  }, []);

  const fetchTenantBySlug = useCallback(
    async (slug: string): Promise<Organization | null> => {
      if (!slug) return null;
      const normalizedSlug = slug.toLowerCase();

      // Return cached state if already loaded for this slug
      if (orgRef.current && orgRef.current.slug.toLowerCase() === normalizedSlug) {
        return orgRef.current;
      }

      // Return existing in-flight promise if duplicate fetch is initiated simultaneously
      if (inFlightRequestsRef.current.has(normalizedSlug)) {
        return inFlightRequestsRef.current.get(normalizedSlug)!;
      }

      setLoading(true);
      setError(null);

      const requestPromise = (async () => {
        try {
          const data = await api.get<Organization>(`/organizations/by-slug/${slug}`, {
            noAuth: true,
          });

          if (data.isActive === false) {
            throw new Error("Organization is currently inactive");
          }

          setOrganization(data);
          if (data._id) {
            localStorage.setItem("organizationId", data._id);
            localStorage.setItem(`org_mapping_${slug}`, data._id);
          }
          applyTenantBranding(data);
          setLoading(false);
          return data;
        } catch (err: any) {
          console.error("Failed to load tenant organization:", err);
          setError(err.message || "Organization not found");
          setOrganization(null);
          setLoading(false);
          return null;
        } finally {
          inFlightRequestsRef.current.delete(normalizedSlug);
        }
      })();

      inFlightRequestsRef.current.set(normalizedSlug, requestPromise);
      return requestPromise;
    },
    [applyTenantBranding]
  );

  const clearTenant = useCallback(() => {
    setOrganization(null);
    setError(null);
    localStorage.removeItem("organizationId");
    document.documentElement.style.removeProperty("--tenant-primary");
    document.documentElement.style.removeProperty("--tenant-secondary");
    document.title = "Inside Home - Multi-Tenant Hostel Management Platform";
  }, []);

  const validateUserAccess = useCallback(
    (userOrgId?: string): boolean => {
      if (!orgRef.current || !userOrgId) return false;
      return orgRef.current._id.toString() === userOrgId.toString();
    },
    []
  );

  // Memoize Provider value to prevent un-necessary child re-renders
  const value = useMemo(
    () => ({
      organization,
      loading,
      error,
      fetchTenantBySlug,
      clearTenant,
      validateUserAccess,
    }),
    [organization, loading, error, fetchTenantBySlug, clearTenant, validateUserAccess]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
