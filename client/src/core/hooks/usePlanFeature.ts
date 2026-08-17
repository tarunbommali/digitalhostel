import { useMemo } from "react";
import { useTenant } from "@/core/context/tenant-context";
import { useAuth } from "@/core/context/auth-context";
import {
  PlanFeatureKey,
  PlanLimitKey,
  isPlanFeatureEnabled,
  normalizePlanTier,
  getPlanTierLimit,
  getRequiredPlanForFeature,
  FEATURE_METADATA,
} from "@/core/config/plans";

export function usePlanFeature(featureKey?: PlanFeatureKey) {
  const { organization } = useTenant();
  const { role } = useAuth();

  const isSuperAdmin = role === "super_admin";
  const currentPlan = normalizePlanTier(organization?.plan);

  return useMemo(() => {
    if (!featureKey) {
      return {
        isAllowed: true,
        currentPlan,
        isSuperAdmin,
        requiredPlan: "BASIC" as const,
        featureMeta: null,
        getLimit: (limitKey: PlanLimitKey) => getPlanTierLimit(currentPlan, limitKey),
        checkFeature: (fKey: PlanFeatureKey) =>
          isSuperAdmin || isPlanFeatureEnabled(currentPlan, fKey),
      };
    }

    const isAllowed = isSuperAdmin || isPlanFeatureEnabled(currentPlan, featureKey);
    const requiredPlan = getRequiredPlanForFeature(featureKey);
    const featureMeta = FEATURE_METADATA[featureKey] || null;

    return {
      isAllowed,
      currentPlan,
      requiredPlan,
      isSuperAdmin,
      featureMeta,
      getLimit: (limitKey: PlanLimitKey) => getPlanTierLimit(currentPlan, limitKey),
      checkFeature: (fKey: PlanFeatureKey) =>
        isSuperAdmin || isPlanFeatureEnabled(currentPlan, fKey),
    };
  }, [organization?.plan, featureKey, isSuperAdmin, currentPlan]);
}

export default usePlanFeature;
