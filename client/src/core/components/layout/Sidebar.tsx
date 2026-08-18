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
  Layers,
  Palette,
  Bell,
  GraduationCap,
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

interface NavItemDef {
  label: string;
  to: string;
  icon: React.ElementType;
  roles: string[];
  isExternalOrRoot?: boolean;
  featureId?: string;
  requiredFeature?: PlanFeatureKey;
}

interface NavSection {
  title?: string;
  items: NavItemDef[];
}

export default function Sidebar({
  className = "",
  isOpen: overrideIsOpen,
  onClose: overrideOnClose,
}: SidebarProps = {}) {
  const reduxIsOpen = useAppSelector((state) => state.app.isMenuOpen);
  const dispatch = useAppDispatch();
  const { user, role, moderatorType, signOut } = useAuth();
  const { organization, isFeatureEnabled } = useTenant();
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

  // Dynamic Navigation Sections based on Role Hierarchy & Enabled Feature Flags
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
        title: "Overview",
        items: [
          {
            label: isStudent ? "Student Dashboard" : "Dashboard",
            to: "dashboard",
            icon: LayoutDashboard,
            roles: ["admin", "moderator", "student", "security_guard"],
          },
        ],
      },
      {
        title: "Residents",
        items: [
          {
            label: "Students Directory",
            to: "students",
            icon: Users,
            roles: ["admin", "moderator:administration", "moderator:full"],
            featureId: "students",
          },
          {
            label: "Rooms & Beds",
            to: "rooms",
            icon: DoorOpen,
            roles: ["admin", "moderator:administration", "moderator:full"],
            featureId: "rooms",
          },
          {
            label: "Leave Requests",
            to: "leaves",
            icon: Calendar,
            roles: ["admin", "moderator:administration", "moderator:full", "student"],
            featureId: "leaves",
          },
          {
            label: "Hostel Setup",
            to: "hostel-setup",
            icon: Building2,
            roles: ["admin", "moderator:administration", "moderator:full"],
          },
          {
            label: "Academic Setup",
            to: "academic-setup",
            icon: GraduationCap,
            roles: ["admin", "moderator:administration", "moderator:full"],
          },
        ],
      },
      {
        title: isStudent ? "Daily Passes & Requests" : "Operations",
        items: [
          {
            label: isSecurityGuard ? "Gate Scanner (QR)" : "Gate Outing Pass",
            to: isSecurityGuard ? "scanner" : "outings",
            icon: OutingIcon,
            roles: ["admin", "moderator:administration", "moderator:full", "student", "security_guard"],
            featureId: "outings",
          },
          {
            label: "Mess Attendance",
            to: "attendance",
            icon: CalendarCheck,
            roles: ["admin", "moderator:attendance_only", "moderator:full"],
            featureId: "attendance",
          },
          {
            label: isStudent ? "Discipline Status" : "Discipline Flags",
            to: "flags",
            icon: AlertTriangle,
            roles: ["admin", "moderator:discipline_monitor", "moderator:administration", "moderator:full", "student"],
            featureId: "discipline",
            requiredFeature: "incidentReporting",
          },
        ],
      },
      {
        title: "Finance",
        items: [
          {
            label: isStudent ? "Monthly Invoices" : "Monthly Bills",
            to: "bills",
            icon: Receipt,
            roles: ["admin", "student"],
            featureId: "billing",
            requiredFeature: "monthlyBilling",
          },
          {
            label: isStudent ? "Fee Receipts" : "Fee Payments",
            to: "payments",
            icon: CreditCard,
            roles: ["admin", "student"],
            featureId: "payments",
            requiredFeature: "onlinePayments",
          },
        ],
      },
      {
        title: "Organization Settings",
        items: [
          {
            label: "General",
            to: "settings/general",
            icon: Building2,
            roles: ["admin"],
          },
          {
            label: "Branding",
            to: "settings/branding",
            icon: Palette,
            roles: ["admin"],
          },
          {
            label: "Features & Modules",
            to: "settings/features",
            icon: Layers,
            roles: ["admin"],
          },
          {
            label: "Staff & Roles",
            to: "settings/staff",
            icon: UserCheck,
            roles: ["admin"],
          },
          {
            label: "Notifications",
            to: "settings/notifications",
            icon: Bell,
            roles: ["admin"],
          },
          {
            label: "Security",
            to: "settings/security",
            icon: ShieldCheck,
            roles: ["admin"],
          },
        ],
      },
    ];
  }, [isSuperAdmin, isStudent, isSecurityGuard]);

  // Dynamic Feature Flag & Role Item Filter
  const filterItem = (item: NavItemDef) => {
    // Check modular SaaS feature flag
    if (item.featureId && !isFeatureEnabled(item.featureId)) {
      return false;
    }

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
        {/* Header Branding & Tenant Identity Block */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-[var(--color-border)] ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {isSuperAdmin ? (
            <Logo
              variant="platform"
              to="/super-admin"
              size="md"
              showWordmark={!collapsed}
            />
          ) : collapsed ? (
            <Logo
              variant="tenant"
              to={`${basePath}/dashboard`}
              size="md"
              logoUrl={organization?.branding?.logoUrl}
              orgName={organization?.name}
              showWordmark={false}
            />
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              {organization?.branding?.logoUrl ? (
                <img
                  src={organization.branding.logoUrl}
                  alt={organization.name}
                  className="h-8 w-8 rounded-lg object-contain border border-[var(--color-border)] bg-white p-0.5 shrink-0"
                />
              ) : (
                <div
                  className="h-8 w-8 rounded-lg grid place-items-center text-white font-bold text-xs shrink-0 shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  {organization?.name ? organization.name.slice(0, 2).toUpperCase() : "CS"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {organization?.name || "Campus Stay"}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                  <span className="truncate">{getRoleLabel()}</span>
                </div>
              </div>
            </div>
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
          <Link
            to={slug ? `/organization/${slug}/account` : isSuperAdmin ? "/super-admin" : "/account"}
            className="px-2 py-1.5 flex items-center justify-between rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer group select-none"
            title="View Account & Subscription"
          >
            <div className="overflow-hidden">
              <p className="font-body-medium text-xs text-[var(--text-primary)] truncate font-semibold group-hover:text-[var(--tenant-primary)]">
                {organization?.name || user?.firstName || (isSuperAdmin ? "Super Admin" : "Hostel")}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] truncate capitalize">
                {getRoleLabel()}
              </p>
            </div>
          </Link>
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
