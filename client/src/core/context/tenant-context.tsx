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
import { OrganizationFeatureState, FeatureConfig } from "@/core/types/feature.types";
import { FEATURE_REGISTRY } from "@/core/features/feature-registry";
import { toast } from "sonner";

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
  features?: Record<string, FeatureConfig>;
  maxStudents?: number;
  maxRooms?: number;
  totalRooms?: number;
  totalBeds?: number;
  totalStudents?: number;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantContextType {
  organization: Organization | null;
  featureState: OrganizationFeatureState;
  loading: boolean;
  error: string | null;
  fetchTenantBySlug: (slug: string) => Promise<Organization | null>;
  fetchOrganization: (slug: string) => Promise<void>;
  updateFeature: (featureId: string, config: Partial<FeatureConfig>) => Promise<void>;
  isFeatureEnabled: (featureId: string) => boolean;
  getFeatureConfig: (featureId: string) => FeatureConfig | null;
  getEnabledFeatures: () => string[];
  refreshFeatures: () => Promise<void>;
  clearTenant: () => void;
  validateUserAccess: (userOrgId?: string) => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [featureState, setFeatureState] = useState<OrganizationFeatureState>({});
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
    const primary = org.branding?.primaryColor || "#4F46E5";
    const secondary = org.branding?.secondaryColor || "#0D9488";

    // Calculate WCAG AA contrast and apply tokens
    import("@/core/theme").then(({ applyTenantTheme }) => {
      applyTenantTheme(primary, secondary);
    });

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", primary);
    }

    if (org.name) {
      document.title = `${org.name} - Campus Stay Management`;
    }
  }, []);

  const initializeFeatureState = useCallback((orgFeatures?: Record<string, FeatureConfig>) => {
    const features: OrganizationFeatureState = {};
    FEATURE_REGISTRY.forEach((feature) => {
      features[feature.id] = orgFeatures?.[feature.id] || {
        ...feature.defaultConfig,
        enabled: feature.isCore ? true : (orgFeatures?.[feature.id]?.enabled ?? feature.defaultConfig.enabled),
      };
    });
    setFeatureState(features);
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
          initializeFeatureState(data.features);

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
    [applyTenantBranding, initializeFeatureState]
  );

  const fetchOrganization = useCallback(
    async (slug: string): Promise<void> => {
      await fetchTenantBySlug(slug);
    },
    [fetchTenantBySlug]
  );

  const updateFeature = useCallback(
    async (featureId: string, config: Partial<FeatureConfig>) => {
      const targetOrgId = organization?._id || localStorage.getItem("organizationId");
      if (!targetOrgId) {
        toast.error("Organization context is not loaded yet");
        return;
      }
      try {
        await api.patch(`/organizations/${targetOrgId}/features`, {
          featureId,
          config,
        });

        setFeatureState((prev) => {
          const current = prev[featureId] || FEATURE_REGISTRY.find((f) => f.id === featureId)?.defaultConfig || {
            enabled: true,
            settings: {},
            access: { roles: ["admin"] },
          };
          return {
            ...prev,
            [featureId]: {
              ...current,
              ...config,
              settings: {
                ...current.settings,
                ...(config.settings || {}),
              },
            },
          };
        });

        toast.success("Feature updated successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to update feature");
        throw err;
      }
    },
    [organization]
  );

  const isFeatureEnabled = useCallback(
    (featureId: string): boolean => {
      const feature = FEATURE_REGISTRY.find((f) => f.id === featureId);
      if (!feature) return true;
      if (feature.isCore) return true;

      const state = featureState[featureId];
      if (!state) return feature.defaultConfig.enabled;

      // Check dependencies
      if (feature.dependencies.length > 0) {
        const allDepsEnabled = feature.dependencies.every((depId) => {
          const depFeature = FEATURE_REGISTRY.find((f) => f.id === depId);
          if (!depFeature) return true;
          if (depFeature.isCore) return true;
          return featureState[depId]?.enabled ?? depFeature.defaultConfig.enabled;
        });
        if (!allDepsEnabled) return false;
      }

      return state.enabled;
    },
    [featureState]
  );

  const getFeatureConfig = useCallback(
    (featureId: string): FeatureConfig | null => {
      const feature = FEATURE_REGISTRY.find((f) => f.id === featureId);
      if (!feature) return null;
      return featureState[featureId] || feature.defaultConfig;
    },
    [featureState]
  );

  const getEnabledFeatures = useCallback(() => {
    return FEATURE_REGISTRY.filter((f) => isFeatureEnabled(f.id)).map((f) => f.id);
  }, [isFeatureEnabled]);

  const refreshFeatures = useCallback(async () => {
    if (!organization?.slug) return;
    await fetchTenantBySlug(organization.slug);
  }, [organization, fetchTenantBySlug]);

  const clearTenant = useCallback(() => {
    setOrganization(null);
    setFeatureState({});
    setError(null);
    localStorage.removeItem("organizationId");
    document.documentElement.style.removeProperty("--tenant-primary");
    document.documentElement.style.removeProperty("--tenant-secondary");
    document.title = "Campus Stay - Multi-Tenant Hostel Management Platform";
  }, []);

  const validateUserAccess = useCallback((userOrgId?: string): boolean => {
    if (!orgRef.current || !userOrgId) return false;
    return orgRef.current._id.toString() === userOrgId.toString();
  }, []);

  // Memoize Provider value to prevent un-necessary child re-renders
  const value = useMemo<TenantContextType>(
    () => ({
      organization,
      featureState,
      loading,
      error,
      fetchTenantBySlug,
      fetchOrganization,
      updateFeature,
      isFeatureEnabled,
      getFeatureConfig,
      getEnabledFeatures,
      refreshFeatures,
      clearTenant,
      validateUserAccess,
    }),
    [
      organization,
      featureState,
      loading,
      error,
      fetchTenantBySlug,
      fetchOrganization,
      updateFeature,
      isFeatureEnabled,
      getFeatureConfig,
      getEnabledFeatures,
      refreshFeatures,
      clearTenant,
      validateUserAccess,
    ]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}

export const useOrganization = useTenant;

