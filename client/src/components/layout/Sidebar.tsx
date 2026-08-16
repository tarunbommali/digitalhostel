import { useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/components/ui/button";
import { useAuth } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import { useAppDispatch, useAppSelector } from "@/utils/store";
import { closeMenu } from "@/utils/appSlice";
import { NAV, NavItem } from "@/utils/constants";

export interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  items?: NavItem[];
}

export default function Sidebar({
  className,
  isOpen: overrideIsOpen,
  onClose: overrideOnClose,
  items: overrideItems,
}: SidebarProps = {}) {
  const reduxIsOpen = useAppSelector((state) => state.app.isMenuOpen);
  const dispatch = useAppDispatch();
  const { user, role, moderatorType, signOut } = useAuth();
  const { organization } = useTenant();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const isOpen = overrideIsOpen !== undefined ? overrideIsOpen : reduxIsOpen;
  const handleClose = overrideOnClose || (() => dispatch(closeMenu()));

  const isAdmin = role === "admin";
  const isSecurityGuard =
    role === "security_guard" ||
    (role === "moderator" && moderatorType === "security_guard");
  const isAttendanceOnly =
    role === "moderator" && moderatorType === "attendance_only";
  const isDisciplineMonitor =
    role === "moderator" && moderatorType === "discipline_monitor";
  const isAdministrationMod =
    role === "moderator" &&
    (moderatorType === "administration" || moderatorType === "full");

  const basePath = slug ? `/organization/${slug}` : "";
  const primaryColor = organization?.branding?.primaryColor || "#6366f1";

  // Filter navigation items based on role automatically if not overridden
  const defaultItems = useMemo(() => {
    if (!role) return [];
    return NAV.filter((item) => {
      if (!item.roles.includes(role)) return false;
      if ((isAdmin || isAdministrationMod) && item.to === "attendance")
        return false;
      if (isAttendanceOnly && item.to !== "attendance") return false;
      if (isDisciplineMonitor && !["dashboard", "flags"].includes(item.to))
        return false;
      if (isSecurityGuard && item.to !== "dashboard") return false;
      return true;
    });
  }, [
    role,
    isAdmin,
    isAdministrationMod,
    isAttendanceOnly,
    isDisciplineMonitor,
    isSecurityGuard,
  ]);

  const items = overrideItems || defaultItems;

  const getRoleDisplay = useCallback(() => {
    if (role === "admin") return "Hostel Admin";
    if (isSecurityGuard) return "Hostel Security Guard";
    if (isAttendanceOnly) return "Mess Attendance Staff";
    if (isDisciplineMonitor) return "Discipline Warden";
    if (role === "moderator") return "Administration";
    return "Student";
  }, [role, isSecurityGuard, isAttendanceOnly, isDisciplineMonitor]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0 border-r border-sidebar-border flex flex-col justify-between",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      <div>
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link to={`${basePath}/dashboard`} className="flex items-center gap-3">
            {organization?.branding?.logoUrl ? (
              <img
                src={organization.branding.logoUrl}
                alt={organization.name}
                className="h-8 w-8 rounded-md object-cover border border-sidebar-border"
              />
            ) : (
              <div
                className="grid h-8 w-8 place-items-center rounded-md text-white font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {organization?.name ? organization.name.charAt(0) : "H"}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-semibold leading-none truncate">
                {organization?.name || "Inside Home Hostel"}
              </p>
              <p className="text-[10px] opacity-70 truncate mt-0.5">
                {organization?.location || "Residency Workspace"}
              </p>
            </div>
          </Link>
          <button className="md:hidden" onClick={handleClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 p-3">
          {items.map((item) => {
            const targetPath = `${basePath}/${item.to}`;
            const isActive = location.pathname === targetPath;
            return (
              <Link
                key={item.to}
                to={targetPath}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2"
                )}
                style={isActive ? { borderLeftColor: primaryColor } : undefined}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-sidebar-border p-3 bg-sidebar space-y-2">
        <div className="px-2 text-xs">
          <p className="truncate font-medium">{user?.email}</p>
          <p className="opacity-70 font-medium">{getRoleDisplay()}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={async () => {
            await signOut();
            navigate(slug ? `/organization/${slug}/login` : "/");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>
    </aside>
  );
}
