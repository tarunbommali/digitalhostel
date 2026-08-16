import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/core/context/auth-context";

export function SuperAdminGuard() {
  const { user, role } = useAuth();
  const location = useLocation();

  const isSuperAdminAttempt = location.pathname.startsWith("/super-admin");
  if (isSuperAdminAttempt && user && role !== "super_admin") {
    const pathMatch = location.pathname.match(/\/organization\/([^/]+)/);
    const targetSlug = pathMatch ? pathMatch[1] : "skyline-luxury";
    return <Navigate to={`/organization/${targetSlug}/dashboard`} replace />;
  }

  return <Outlet />;
}
