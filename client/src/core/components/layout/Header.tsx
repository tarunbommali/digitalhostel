import * as React from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  Wifi,
  WifiOff,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import { useThemeMode } from "@/core/context/theme-context";
import { useOnline } from "@/hooks/useOnline";
import { useAppDispatch } from "@/utils/store";
import { toggleMenu } from "@/utils/appSlice";
import { CommandPalette } from "@/core/components/ui/command-palette";
import { NotificationCenter } from "./NotificationCenter";
import { Logo } from "@/core/components/ui/Logo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/core/components/ui/dropdown-menu";

export interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps = {}) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { user, role, signOut } = useAuth();
  const { organization } = useTenant();
  const { resolvedTheme, toggleTheme } = useThemeMode();
  const isDark = resolvedTheme === "dark";
  const isOnline = useOnline();

  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  // Page classifications
  const isSuperAdminRoute = location.pathname.startsWith("/super-admin");
  const isTenantRoute = location.pathname.startsWith("/organization/") && !location.pathname.endsWith("/login");
  const isPublicPage = !isTenantRoute && !isSuperAdminRoute;

  // Format page name for tenant route
  const pathParts = location.pathname.split("/").filter(Boolean);
  const pageName = pathParts[pathParts.length - 1] || "Dashboard";
  const formattedTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, " ");

  const handleSignOut = async () => {
    await signOut();
    navigate(isSuperAdminRoute ? "/super-admin/login" : slug ? `/organization/${slug}/login` : "/");
  };

  return (
    <>
      <header className={`sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:px-6 transition-colors duration-200 ${className || ""}`}>
        {/* =========================================================================
            LEFT SECTION: Brand (Public Only) or Breadcrumbs / Mobile Menu Toggle
           ========================================================================= */}
        <div className="flex items-center gap-3 px-12">
          {/* Public / Landing: Show single top-level Logo */}
          {isPublicPage && (
            <Logo to="/" size="md" />
          )}

          {/* Super Admin Route: Mobile hamburger + Breadcrumb (No duplicate logo) */}
          {isSuperAdminRoute && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(toggleMenu())}
                className="md:hidden p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="text-xs font-semibold text-[var(--text-primary)]">Platform Console</span>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="text-[11px] bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] border border-[var(--tenant-primary)]/30 px-2 py-0.5 rounded-full font-semibold">
                Super Admin
              </span>
            </div>
          )}

          {/* Tenant Route: Mobile hamburger + Organization Breadcrumbs (No duplicate logo) */}
          {isTenantRoute && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(toggleMenu())}
                className="md:hidden p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="text-[var(--text-muted)] text-xs font-medium hidden sm:inline">
                {organization?.name || "Workspace"}
              </span>
              <span className="text-[var(--text-muted)] hidden sm:inline">/</span>
              <h1 className="font-body-medium text-xs text-[var(--text-primary)] font-semibold truncate max-w-[140px] sm:max-w-none">
                {formattedTitle}
              </h1>
            </div>
          )}
        </div>

        {/* =========================================================================
            CENTER SECTION: Search Bar (ONLY for Tenant Workspace)
           ========================================================================= */}
        {isTenantRoute ? (
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 h-8 w-56 lg:w-72 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 text-xs text-[var(--text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search anything...</span>
            <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-1.5 font-mono text-[10px] text-[var(--text-muted)]">
              ⌘K
            </kbd>
          </button>
        ) : (
          <div className="flex-1" />
        )}

        {/* =========================================================================
            RIGHT SECTION: Theme Toggle, Network Status, Notifications, Profile
           ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Universal Theme Toggle (Always Available) */}
          <button
            onClick={toggleTheme}
            className="h-8 px-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-sunken)] hover:bg-[var(--color-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle visual theme"
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Network Status Badge (Non-public pages) */}
          {!isPublicPage && (
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${isOnline
                ? "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]"
                : "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger-border)]"
                }`}
            >
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? "Online" : "Offline"}</span>
            </div>
          )}

          {/* Tenant Notification Center (ONLY for Tenant Workspace) */}
          {isTenantRoute && (
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Open notifications center"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--tenant-primary)]" />
            </button>
          )}

          {/* Context-aware Profile / Sign In */}
          {isPublicPage ? (
            <div className="flex items-center gap-2">
              {user ? (
                <button
                  onClick={() =>
                    navigate(role === "super_admin" ? "/super-admin" : slug ? `/organization/${slug}/dashboard` : "/")
                  }
                  className="h-8 px-3 rounded-md bg-[var(--tenant-primary)] text-white hover:bg-[var(--tenant-primary-hover)] text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Go to Workspace</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              ) : (
                <button
                  onClick={() => navigate("/super-admin/login")}
                  className="h-8 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-sunken)] hover:bg-[var(--color-surface-muted)] text-[var(--text-primary)] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Platform Login
                </button>
              )}
            </div>
          ) : isSuperAdminRoute ? (
            /* Super Admin Profile Dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer">
                  <div className="h-7 w-7 rounded-md bg-[var(--tenant-primary)] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    S
                  </div>
                  <span className="hidden md:inline text-xs font-semibold text-[var(--text-primary)] max-w-[100px] truncate">
                    Super Admin
                  </span>
                  <ChevronDown className="h-3 w-3 text-[var(--text-muted)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Super Admin</p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">{user?.email || "admin@campusstay.com"}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/super-admin")}>
                  <Shield className="h-3.5 w-3.5 mr-2 text-[var(--tenant-primary)]" />
                  <span>Platform Console</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-[var(--color-danger)] focus:text-[var(--color-danger)]">
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Tenant User Profile Dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer">
                  <div className="h-7 w-7 rounded-md bg-[var(--tenant-primary)] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                  <span className="hidden md:inline text-xs font-semibold text-[var(--text-primary)] max-w-[110px] truncate">
                    {user?.fullName || "Account"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-[var(--text-muted)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">{user?.email}</p>
                  <span className="mt-1 inline-block text-[10px] uppercase font-semibold text-[var(--tenant-primary)]">
                    {role ? role.replace(/_/g, " ") : "Member"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/organization/${slug}/settings`)}>
                  <User className="h-3.5 w-3.5 mr-2" />
                  <span>Profile & Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-[var(--color-danger)] focus:text-[var(--color-danger)]">
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Tenant Modals (Command Palette & Notification Drawer) */}
      {isTenantRoute && (
        <>
          <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
          <NotificationCenter open={notificationsOpen} onOpenChange={setNotificationsOpen} />
        </>
      )}
    </>
  );
}
