import * as React from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  DoorOpen,
  CalendarCheck,
  LogOut as OutingIcon,
  Calendar,
  Receipt,
  CreditCard,
  AlertTriangle,
  UserCheck,
  Settings,
  Building2,
  Globe,
  ShieldCheck,
  Shield,
  Lock,
} from "lucide-react";
import { useAuth } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import {
  isPlanFeatureEnabled,
  PlanFeatureKey,
  getRequiredPlanForFeature,
} from "@/core/config/plans";
import { useAppDispatch, useAppSelector } from "@/utils/store";
import { closeMenu } from "@/utils/appSlice";
import { Logo } from "@/core/components/ui/Logo";

export interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavSection {
  title?: string;
  items: {
    label: string;
    to: string;
    icon: React.ElementType;
    roles: string[];
    isExternalOrRoot?: boolean;
    requiredFeature?: PlanFeatureKey;
  }[];
}

export default function Sidebar({
  className = "",
  isOpen: overrideIsOpen,
  onClose: overrideOnClose,
}: SidebarProps = {}) {
  const reduxIsOpen = useAppSelector((state) => state.app.isMenuOpen);
  const dispatch = useAppDispatch();
  const { user, role, moderatorType, signOut } = useAuth();
  const { organization } = useTenant();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Collapsed state persisted in localStorage
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const isOpen = overrideIsOpen !== undefined ? overrideIsOpen : reduxIsOpen;
  const handleClose = overrideOnClose || (() => dispatch(closeMenu()));

  const basePath = slug ? `/organization/${slug}` : "";
  const isSuperAdmin = role === "super_admin" || location.pathname.startsWith("/super-admin");

  // Granular RBAC Permissions
  const isHostelAdmin = role === "admin";
  const isSecurityGuard = role === "security_guard";
  const isStudent = role === "student";
  const isAdministrationMod = role === "moderator" && (moderatorType === "administration" || moderatorType === "full");
  const isAttendanceOnly = role === "moderator" && moderatorType === "attendance_only";
  const isDisciplineMonitor = role === "moderator" && moderatorType === "discipline_monitor";

  // Dynamic Navigation Sections based on Role Hierarchy
  const sections: NavSection[] = React.useMemo(() => {
    if (isSuperAdmin) {
      return [
        {
          items: [

            {
              label: "Overview",
              to: "/super-admin",
              icon: LayoutDashboard,
              roles: ["super_admin"],
              isExternalOrRoot: true,
            },
            {
              label: "Organizations",
              to: "/super-admin/organizations",
              icon: Building2,
              roles: ["super_admin"],
              isExternalOrRoot: true,
            },

          ],
        },
      ];
    }

    return [
      {
        title: isStudent ? "Resident Portal" : "Core Operations",
        items: [
          {
            label: isStudent ? "Student Dashboard" : "Dashboard",
            to: "dashboard",
            icon: LayoutDashboard,
            roles: ["admin", "moderator", "student", "security_guard"],
          },
          {
            label: "Students Directory",
            to: "students",
            icon: Users,
            roles: ["admin", "moderator:administration", "moderator:full"],
          },
          {
            label: "Rooms & Beds",
            to: "rooms",
            icon: DoorOpen,
            roles: ["admin", "moderator:administration", "moderator:full"],
          },
        ],
      },
      {
        title: isStudent ? "Daily Requests" : "Daily Passes & Mess",
        items: [
          {
            label: isSecurityGuard ? "Gate Scanner (QR)" : "Gate Outing Pass",
            to: isSecurityGuard ? "scanner" : "outings",
            icon: OutingIcon,
            roles: ["admin", "moderator:administration", "moderator:full", "student", "security_guard"],
          },
          {
            label: "Leave Requests",
            to: "leaves",
            icon: Calendar,
            roles: ["admin", "moderator:administration", "moderator:full", "student"],
          },
          {
            label: "Mess Attendance",
            to: "attendance",
            icon: CalendarCheck,
            roles: ["admin", "moderator:attendance_only", "moderator:full"],
          },
        ],
      },
      {
        title: isStudent ? "Finances" : "Finance & Governance",
        items: [
          {
            label: isStudent ? "Monthly Invoices" : "Monthly Bills",
            to: "bills",
            icon: Receipt,
            roles: ["admin", "student"],
            requiredFeature: "monthlyBilling",
          },
          {
            label: isStudent ? "Fee Receipts" : "Fee Payments",
            to: "payments",
            icon: CreditCard,
            roles: ["admin", "student"],
            requiredFeature: "onlinePayments",
          },
          {
            label: isStudent ? "Discipline Status" : "Discipline Flags",
            to: "flags",
            icon: AlertTriangle,
            roles: ["admin", "moderator:discipline_monitor", "moderator:administration", "moderator:full"],
            requiredFeature: "incidentReporting",
          },
          {
            label: "Staff & Wardens",
            to: "moderators",
            icon: UserCheck,
            roles: ["admin"],
          },
          {
            label: "Hostel Settings",
            to: "settings",
            icon: Settings,
            roles: ["admin"],
          },
        ],
      },
    ];
  }, [isSuperAdmin, isStudent, isSecurityGuard]);

  // Role Item Filter
  const filterItem = (item: { roles: string[] }) => {
    if (isSuperAdmin) return true;
    if (isHostelAdmin) return true;

    return item.roles.some((r) => {
      if (r === "student" && isStudent) return true;
      if (r === "security_guard" && isSecurityGuard) return true;
      if (r === "moderator:attendance_only" && isAttendanceOnly) return true;
      if (r === "moderator:discipline_monitor" && isDisciplineMonitor) return true;
      if (
        (r === "moderator:administration" || r === "moderator:full" || r === "moderator") &&
        isAdministrationMod
      )
        return true;
      return false;
    });
  };

  const primaryColor = organization?.branding?.primaryColor || "var(--tenant-primary)";

  const getRoleLabel = () => {
    if (isSuperAdmin) return "Super Admin";
    if (role === "admin") return "Hostel Administrator";
    if (isSecurityGuard) return "Security Gate Guard";
    if (isAttendanceOnly) return "Mess Attendance Staff";
    if (isDisciplineMonitor) return "Discipline Warden";
    if (role === "moderator") return "Administration Staff";
    return "Hostel Resident";
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col justify-between transition-all duration-200 ease-out md:sticky md:top-0 md:h-screen shrink-0 h-screen overflow-hidden ${collapsed ? "w-16" : "w-64"
        } ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${className}`}
    >
      <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden">
        {/* Header Branding (Single Source of Truth Logo) */}
        <div
          className={`flex h-14 shrink-0 items-center border-b border-[var(--color-border)] ${collapsed ? "justify-center px-2" : "justify-between px-4"
            }`}
        >
          {isSuperAdmin ? (
            <Logo
              variant="platform"
              to="/super-admin"
              size="md"
              showWordmark={!collapsed}
            />
          ) : (
            <Logo
              variant="tenant"
              to={`${basePath}/dashboard`}
              size="md"
              logoUrl={organization?.branding?.logoUrl}
              orgName={organization?.name}
              showWordmark={!collapsed}
            />
          )}
          <button
            className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
            onClick={handleClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Sections with Internal Overflow Scrolling */}
        <nav className="flex-1 overflow-y-auto min-h-0 px-2 py-3 space-y-4">
          {sections.map((section, idx) => {
            const visibleItems = section.items.filter(filterItem);
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                {!collapsed && section.title && (
                  <p className="font-caption text-[10px] uppercase text-[var(--text-muted)] px-3 py-1 font-semibold tracking-wider">
                    {section.title}
                  </p>
                )}
                {visibleItems.map((item, itemIdx) => {
                  const targetPath = item.isExternalOrRoot ? item.to : `${basePath}/${item.to}`;
                  const isActive =
                    item.to === "/super-admin/organizations"
                      ? location.pathname.startsWith("/super-admin/organizations")
                      : item.to === "/super-admin"
                        ? location.pathname === "/super-admin" || location.pathname === "/super-admin/dashboard"
                        : location.pathname === targetPath;
                  const Icon = item.icon;

                  const isLocked =
                    !!item.requiredFeature &&
                    !isSuperAdmin &&
                    !isPlanFeatureEnabled(organization?.plan, item.requiredFeature);
                  const minPlan = item.requiredFeature ? getRequiredPlanForFeature(item.requiredFeature) : null;

                  return (
                    <Link
                      key={`${item.to}-${itemIdx}`}
                      to={targetPath}
                      title={collapsed ? `${item.label}${isLocked ? ` (${minPlan} Plan)` : ""}` : undefined}
                      className={`flex items-center justify-between rounded-md px-3 py-2 text-xs transition-colors group relative ${isActive
                        ? "bg-[var(--tenant-primary)]/10 text-[var(--text-primary)] font-medium"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)]"
                        } ${collapsed ? "justify-center px-0" : ""}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isActive && (
                          <span
                            className="absolute left-0 top-1 bottom-1 w-1 rounded-r-sm bg-[var(--tenant-primary)]"
                            style={{ backgroundColor: primaryColor }}
                          />
                        )}
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-[var(--tenant-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                            }`}
                          style={isActive ? { color: primaryColor } : undefined}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!collapsed && isLocked && minPlan && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                          <Lock className="w-2.5 h-2.5" />
                          <span>{minPlan}</span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Area with User Profile & Collapse Toggle */}
      <div className="border-t border-[var(--color-border)] p-2 space-y-2 bg-[var(--color-surface-sunken)]/40 shrink-0">
        {!collapsed && (
          <div className="px-2 py-1.5 flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="font-body-medium text-xs text-[var(--text-primary)] truncate font-semibold">
                {user?.fullName || (isSuperAdmin ? "Super Admin" : "Active User")}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">{user?.email}</p>
              <p className="text-[10px] text-[var(--tenant-primary)] font-semibold uppercase mt-0.5">
                {getRoleLabel()}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={async () => {
              await signOut();
              navigate(isSuperAdmin ? "/super-admin/login" : slug ? `/organization/${slug}/login` : "/");
            }}
            title="Sign Out"
            className={`flex items-center gap-2 rounded-md p-2 text-xs text-[var(--text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors cursor-pointer w-full ${collapsed ? "justify-center" : ""
              }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>

          <button
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex items-center justify-center p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
