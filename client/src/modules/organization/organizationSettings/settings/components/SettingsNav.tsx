import * as React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Building2,
  Palette,
  Layers,
  Users,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/core/lib/utils";

interface SettingsNavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  colorClass: string;
}

const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    label: "General",
    path: "general",
    icon: Building2,
    colorClass: "text-[var(--tenant-primary)]",
  },
  {
    label: "Branding",
    path: "branding",
    icon: Palette,
    colorClass: "text-fuchsia-500",
  },
  {
    label: "Features & Modules",
    path: "features",
    icon: Layers,
    colorClass: "text-amber-500",
  },
  {
    label: "Staff & Roles",
    path: "staff",
    icon: Users,
    colorClass: "text-blue-500",
  },
  {
    label: "Notifications",
    path: "notifications",
    icon: Bell,
    colorClass: "text-violet-500",
  },
  {
    label: "Security",
    path: "security",
    icon: ShieldCheck,
    colorClass: "text-emerald-500",
  },
];

export function SettingsNav() {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const basePath = slug ? `/organization/${slug}/settings` : "/settings";

  return (
    <div className="overflow-x-auto pb-1 mb-6 border-b border-[var(--color-border)]">
      <nav className="flex items-center gap-1 min-w-max">
        {SETTINGS_NAV_ITEMS.map((item) => {
          const itemUrl = `${basePath}/${item.path}`;
          const isActive =
            location.pathname === itemUrl ||
            (item.path === "general" && location.pathname === basePath) ||
            location.pathname.startsWith(`${itemUrl}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={itemUrl}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all select-none",
                isActive
                  ? "bg-[var(--color-surface)] text-[var(--text-primary)] border border-[var(--color-border)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-surface-sunken)]"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5 shrink-0", item.colorClass)} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default SettingsNav;
