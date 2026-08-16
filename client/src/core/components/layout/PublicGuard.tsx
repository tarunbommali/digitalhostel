import * as React from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";

export function getAuthenticatedDashboard(
  user: any,
  role: string | null,
  tenantSlugParam?: string,
  organizationSlug?: string
): string {
  if (role === "super_admin") {
    return "/super-admin";
  }

  const slug =
    tenantSlugParam ||
    user?.organizationSlug ||
    organizationSlug ||
    localStorage.getItem("tenant_slug") ||
    "developer";

  return `/organization/${slug}/dashboard`;
}

export function PublicGuard({ children }: { children?: React.ReactNode } = {}) {
  const { user, role, loading } = useAuth();
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();

  // While auth session is initializing from localStorage, prevent flashing
  if (loading) {
    return null;
  }

  // If user is already authenticated, prohibit access to public landing & login pages
  // Automatically redirect directly to their corresponding workspace dashboard
  if (user) {
    const destination = getAuthenticatedDashboard(
      user,
      role,
      slug,
      organization?.slug
    );
    return <Navigate to={destination} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default PublicGuard;
