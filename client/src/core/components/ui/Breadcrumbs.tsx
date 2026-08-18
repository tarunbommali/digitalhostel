import * as React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronRight, Home, Building2, Layers } from "lucide-react";
import { useTenant } from "@/core/context/tenant-context";
import { useAuth } from "@/core/context/auth-context";
import { cn } from "@/core/lib/utils";

export interface BreadcrumbCrumb {
  label: string;
  to?: string;
  icon?: React.ElementType;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbCrumb[];
  className?: string;
}

const ROUTE_NAME_MAP: Record<string, { section: string; title: string }> = {
  dashboard: { section: "Core Operations", title: "Dashboard" },
  students: { section: "Core Operations", title: "Students Directory" },
  new: { section: "Students Directory", title: "Register Student" },
  import: { section: "Students Directory", title: "Bulk CSV Import" },
  rooms: { section: "Core Operations", title: "Rooms & Beds" },
  attendance: { section: "Daily Passes & Mess", title: "Mess Attendance" },
  outings: { section: "Daily Passes & Mess", title: "Gate Outing Pass" },
  scanner: { section: "Gate Security", title: "Gate Scanner" },
  leaves: { section: "Daily Passes & Mess", title: "Leave Requests" },
  bills: { section: "Finance & Governance", title: "Monthly Bills" },
  payments: { section: "Finance & Governance", title: "Fee Payments" },
  flags: { section: "Governance", title: "Discipline Flags" },
  moderators: { section: "Organization Settings", title: "Staff & Roles" },
  settings: { section: "Organization Settings", title: "General" },
  general: { section: "Organization Settings", title: "General" },
  branding: { section: "Organization Settings", title: "Branding" },
  features: { section: "Organization Settings", title: "Features & Modules" },
  staff: { section: "Organization Settings", title: "Staff & Roles" },
  notifications: { section: "Organization Settings", title: "Notifications" },
  security: { section: "Organization Settings", title: "Security" },
  edit: { section: "Organization Settings", title: "Edit Staff" },
  account: { section: "Workspace Profile", title: "Account & Subscription" },
  "hostel-setup": { section: "Residents & Housing", title: "Hostel Setup" },
  "academic-setup": { section: "Residents & Housing", title: "Academic Setup" },
};

export function Breadcrumbs({ items: customItems, className }: BreadcrumbsProps) {
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const { organization } = useTenant();
  const { role } = useAuth();

  const isSuperAdmin = role === "super_admin" || location.pathname.startsWith("/super-admin");

  const crumbs: BreadcrumbCrumb[] = React.useMemo(() => {
    if (customItems && customItems.length > 0) {
      return customItems;
    }

    // Super Admin Route
    if (isSuperAdmin) {
      const superAdminCrumbs: BreadcrumbCrumb[] = [
        { label: "Super Admin", to: "/super-admin/organizations", icon: Building2 },
      ];

      const parts = location.pathname.split("/").filter(Boolean);
      // parts might be: ['super-admin'], ['super-admin', 'dashboard'], ['super-admin', 'organizations'], ['super-admin', 'organizations', 'new'], ['super-admin', 'organizations', ':id', 'edit']
      const subParts = parts.slice(1);

      if (subParts.length === 0 || subParts[0] === "dashboard" || subParts[0] === "organizations") {
        if (subParts.length <= 1) {
          superAdminCrumbs.push({ label: "Organizations" });
          return superAdminCrumbs;
        }

        if (subParts[1] === "new") {
          superAdminCrumbs.push({ label: "Organizations", to: "/super-admin/organizations" });
          superAdminCrumbs.push({ label: "Create Organization" });
          return superAdminCrumbs;
        }

        if (subParts.length >= 3 && subParts[2] === "edit") {
          superAdminCrumbs.push({ label: "Organizations", to: "/super-admin/organizations" });
          superAdminCrumbs.push({ label: "Edit Organization" });
          return superAdminCrumbs;
        }
      }

      if (subParts[0] === "analytics") {
        superAdminCrumbs.push({ label: "Platform Analytics" });
        return superAdminCrumbs;
      }

      if (subParts[0] === "users") {
        superAdminCrumbs.push({ label: "Global Users" });
        return superAdminCrumbs;
      }

      superAdminCrumbs.push({ label: "Organizations" });
      return superAdminCrumbs;
    }

    // Tenant Scoped Routes
    if (slug) {
      const orgName = organization?.name || "Workspace";
      const pathParts = location.pathname.split("/").filter(Boolean);
      const subPaths = pathParts.slice(2); // After /organization/:slug

      const result: BreadcrumbCrumb[] = [
        { label: "Hostels", to: "/", icon: Home },
        { label: orgName, to: `/organization/${slug}/dashboard` },
      ];

      if (subPaths.length === 0 || subPaths[0] === "dashboard") {
        result.push({ label: "Core Operations" });
        result.push({ label: "Dashboard" });
        return result;
      }

      if (subPaths[0] === "students") {
        if (subPaths[1] === "new") {
          result.push({ label: "Students Directory", to: `/organization/${slug}/students` });
          result.push({ label: "Register New Student" });
          return result;
        }
        if (subPaths[1] === "import") {
          result.push({ label: "Students Directory", to: `/organization/${slug}/students` });
          result.push({ label: "Bulk CSV Import" });
          return result;
        }
        result.push({ label: "Core Operations" });
        result.push({ label: "Students Directory" });
        return result;
      }

      const mapped = ROUTE_NAME_MAP[subPaths[0]];
      if (mapped) {
        result.push({ label: mapped.section });
        result.push({ label: mapped.title });
      } else {
        const title = subPaths[0].charAt(0).toUpperCase() + subPaths[0].slice(1).replace(/-/g, " ");
        result.push({ label: title });
      }

      return result;
    }

    return [{ label: "Home", to: "/", icon: Home }];
  }, [customItems, isSuperAdmin, slug, organization, location.pathname]);

  if (!crumbs || crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border)] text-xs text-[var(--text-muted)] w-fit max-w-full overflow-x-auto",
        className
      )}
    >
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        const Icon = crumb.icon;

        return (
          <React.Fragment key={`${crumb.label}-${idx}`}>
            {idx > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 opacity-60" />
            )}

            <div className="flex items-center gap-1.5 shrink-0">
              {Icon && <Icon className="w-3.5 h-3.5 text-[var(--tenant-primary)] shrink-0" />}

              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  className="font-medium text-[var(--text-secondary)] hover:text-[var(--tenant-primary)] transition-colors hover:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "font-medium",
                    isLast
                      ? "text-[var(--text-primary)] font-semibold"
                      : "text-[var(--text-muted)]"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
