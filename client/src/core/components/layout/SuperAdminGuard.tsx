import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/core/context/auth-context";

export function SuperAdminGuard({ children }: { children?: React.ReactNode } = {}) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  const isSuperAdminAttempt = location.pathname.startsWith("/super-admin");
  if (isSuperAdminAttempt && user && role !== "super_admin") {
    const slug = user.organizationSlug || localStorage.getItem("tenant_slug") || "developer";
    return <Navigate to={`/organization/${slug}/dashboard`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default SuperAdminGuard;
