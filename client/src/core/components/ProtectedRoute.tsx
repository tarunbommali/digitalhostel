import React, { useEffect } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth, type AppRole } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  requireOrganization?: boolean;
  superAdminOnly?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireOrganization = false,
  superAdminOnly = false,
}: ProtectedRouteProps) {
  const { user, role, loading, organizationId, signOut } = useAuth();
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

  // 4. Role-based Access Check
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    toast.error("You do not have permission to access this page");

    if (role === "super_admin") {
      return <Navigate to="/super-admin" replace />;
    } else if (slug) {
      return <Navigate to={`/organization/${slug}/dashboard`} replace />;
    } else if (organizationId) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // 5. Organization Context Requirement Check
  if (requireOrganization && !organizationId && !slug) {
    toast.error("Organization context required");
    return <Navigate to="/" replace />;
  }

  // 6. Organization Context Mismatch Check
  if (slug && organizationId && organization?._id && organization._id !== organizationId && role !== "super_admin") {
    toast.error("Organization context mismatch. Please log in again.");
    signOut();
    return <Navigate to={`/organization/${slug}/login`} replace />;
  }

  return <>{children}</>;
}
