import React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth, type AppRole } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PlanFeatureKey } from "@/core/config/plans";
import { canAccess } from "@/core/access";
import { PlanLockedPage } from "./PlanLockedPage";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  requireOrganization?: boolean;
  superAdminOnly?: boolean;
  requiredFeature?: PlanFeatureKey;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireOrganization = false,
  superAdminOnly = false,
  requiredFeature,
}: ProtectedRouteProps) {
  const { user, role, loading, organizationId } = useAuth();
  const { organization } = useTenant();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();

  // Show loading spinner during auth check
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // 1. Super Admin Only Routes - Strict Validation
  if (superAdminOnly) {
    if (!user || role !== "super_admin") {
      if (user && organizationId) {
        toast.error("Access denied: This section is for Super Admin only.");
        if (slug) {
          return <Navigate to={`/organization/${slug}/dashboard`} replace />;
        }
        return <Navigate to="/" replace />;
      }
      return <Navigate to="/super-admin/login" replace />;
    }
    return <>{children}</>;
  }

  // 2. Authentication Check
  if (!user) {
    const loginPath = slug
      ? `/organization/${slug}/login`
      : location.pathname.startsWith("/super-admin")
      ? "/super-admin/login"
      : "/auth";

    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 3. Super Admin trying to access organization routes without explicit switch
  if (role === "super_admin" && slug) {
    return <>{children}</>;
  }

  // 4. Organization Context Requirement Check
  if (requireOrganization && !organizationId && !slug) {
    toast.error("Organization context required");
    return <Navigate to="/" replace />;
  }

  // 5. Unified Access Resolver (RBAC + Plan Gating + Organization Module Toggle)
  if (role !== "super_admin") {
    const access = canAccess({
      organization,
      role,
      requiredFeature,
      allowedRoles,
    });

    if (!access.allowed) {
      if (access.reason === "ROLE_NOT_ALLOWED") {
        toast.error("You do not have permission to access this page");
        if (slug) return <Navigate to={`/organization/${slug}/dashboard`} replace />;
        return <Navigate to="/" replace />;
      }

      if (access.reason === "PLAN_REQUIRED" && requiredFeature) {
        return <PlanLockedPage featureKey={requiredFeature} />;
      }

      if (access.reason === "DISABLED_BY_ORGANIZATION") {
        toast.error("This module is currently disabled by your organization administrator");
        if (slug) return <Navigate to={`/organization/${slug}/dashboard`} replace />;
        return <Navigate to="/" replace />;
      }
    }
  }

  return <>{children}</>;
}
