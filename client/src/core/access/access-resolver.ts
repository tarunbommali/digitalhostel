import { PlanFeatureKey, isPlanFeatureEnabled, getRequiredPlanForFeature } from "@/core/config/plans";

export type AccessDenialReason =
  | "ALLOWED"
  | "PLAN_REQUIRED"
  | "DISABLED_BY_ORGANIZATION"
  | "ROLE_NOT_ALLOWED"
  | "UNAUTHENTICATED";

export interface AccessCheckResult {
  allowed: boolean;
  reason: AccessDenialReason;
  requiredPlan?: string | null;
}

export interface AccessCheckOptions {
  organization?: any;
  role?: string | null;
  requiredFeature?: PlanFeatureKey | string;
  allowedRoles?: string[];
}

/**
 * Unified Access Layer:
 * Resolves effective permission by checking:
 * 1. Role Capabilities (RBAC)
 * 2. Subscription Tier / Plan Gating (BASIC vs PRO vs ENTERPRISE)
 * 3. Organization Workspace Feature Toggles
 */
export function canAccess({
  organization,
  role,
  requiredFeature,
  allowedRoles,
}: AccessCheckOptions): AccessCheckResult {
  // Super Admin has global platform bypass
  if (role === "super_admin") {
    return { allowed: true, reason: "ALLOWED" };
  }

  // 1. Role-based RBAC Check
  if (allowedRoles && allowedRoles.length > 0 && role) {
    const isRoleAllowed = allowedRoles.includes(role);
    if (!isRoleAllowed) {
      return { allowed: false, reason: "ROLE_NOT_ALLOWED" };
    }
  }

  // 2. Subscription Plan Gate Check
  if (requiredFeature && organization?.plan) {
    const planAllowed = isPlanFeatureEnabled(organization.plan, requiredFeature as PlanFeatureKey);
    if (!planAllowed) {
      return {
        allowed: false,
        reason: "PLAN_REQUIRED",
        requiredPlan: getRequiredPlanForFeature(requiredFeature as PlanFeatureKey),
      };
    }
  }

  // 3. Organization Modular Feature Toggle Check
  if (requiredFeature && organization?.features) {
    const orgFeatureState = organization.features[requiredFeature];
    if (orgFeatureState === false) {
      return { allowed: false, reason: "DISABLED_BY_ORGANIZATION" };
    }
  }

  return { allowed: true, reason: "ALLOWED" };
}

export default canAccess;
