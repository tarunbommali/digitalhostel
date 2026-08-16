import { useMemo } from "react";
import { useAuth } from "@/core/context/auth-context";

/**
 * Custom hook providing memoized user role flags and auth helper accessors.
 */
export function useAuthUser() {
  const { user, role, moderatorType, organizationId, loading, isInOrganizationContext } =
    useAuth();

  const isSuperAdmin = useMemo(() => role === "super_admin", [role]);
  const isAdmin = useMemo(() => role === "admin", [role]);
  const isModerator = useMemo(() => role === "moderator", [role]);
  const isStudent = useMemo(() => role === "student", [role]);
  const isSecurityGuard = useMemo(
    () =>
      role === "security_guard" ||
      (role === "moderator" && moderatorType === "security_guard"),
    [role, moderatorType]
  );

  const isAttendanceOnly = useMemo(
    () => role === "moderator" && moderatorType === "attendance_only",
    [role, moderatorType]
  );

  const isDisciplineMonitor = useMemo(
    () => role === "moderator" && moderatorType === "discipline_monitor",
    [role, moderatorType]
  );

  const isAuthenticated = useMemo(() => !!user && !!role, [user, role]);

  return {
    user,
    role,
    moderatorType,
    organizationId,
    loading,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isModerator,
    isStudent,
    isSecurityGuard,
    isAttendanceOnly,
    isDisciplineMonitor,
    isInOrganizationContext,
  };
}

export default useAuthUser;
