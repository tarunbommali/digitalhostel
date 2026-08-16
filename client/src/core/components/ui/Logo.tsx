import * as React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/core/lib/utils";
import { useAuth } from "@/core/context/auth-context";
import { useThemeMode } from "@/core/context/theme-context";
import iconLogo from "@/assets/favicon.png";
import lightThemeLogo from "@/assets/light_theme_logo_platform_campus_stay_text_logo.png";
import darkThemeLogo from "@/assets/dark_theme_logo_platform_campus_stay_text_logo.png";
import type { LogoProps } from "./Logo.types";

const WORDMARK_HEIGHT = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
} as const;

export function Logo({
  variant = "platform",
  to,
  size = "md",
  showWordmark = true,
  logoUrl,
  orgName,
  className,
}: LogoProps) {
  const { user, role } = useAuth();
  const { resolvedTheme } = useThemeMode();
  const [wordmarkError, setWordmarkError] = React.useState(false);

  const destination =
    to ??
    (user
      ? role === "super_admin"
        ? "/super-admin"
        : `/organization/${user.organizationSlug || localStorage.getItem("tenant_slug") || "developer"}/dashboard`
      : "/");

  const platformLogo = resolvedTheme === "light" ? lightThemeLogo : darkThemeLogo;

  React.useEffect(() => setWordmarkError(false), [platformLogo]);

  const initials = orgName
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "CS";

  // When wordmark is hidden (e.g. collapsed/closed sidebar), render the clean rounded logo mark
  if (!showWordmark) {
    return (
      <Link
        to={destination}
        className={cn(
          "flex items-center justify-center group select-none transition-transform duration-150 hover:scale-105",
          className
        )}
        title={variant === "tenant" && orgName ? orgName : "Campus Stay"}
      >
        {variant === "tenant" && logoUrl ? (
          <img
            src={logoUrl}
            alt={orgName ?? "Organization logo"}
            className="h-8 w-8 rounded-full object-contain border border-[var(--color-border)] bg-white p-0.5 shadow-xs"
          />
        ) : variant === "tenant" ? (
          <div className="h-8 w-8 rounded-full grid place-items-center bg-[var(--tenant-primary)] text-[var(--tenant-primary-foreground)] font-bold text-xs shadow-xs">
            {initials}
          </div>
        ) : (
          <img
            src={iconLogo}
            alt="Campus Stay"
            className="h-8 w-8 rounded-full object-contain border border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)] p-1 shadow-xs"
          />
        )}
      </Link>
    );
  }

  return (
    <Link
      to={destination}
      className={cn("flex items-center gap-2.5 group select-none", className)}
    >
      {variant === "tenant" ? (
        <>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={orgName ?? "Organization logo"}
              className="h-8 w-8 rounded-full object-contain border border-[var(--color-border)] bg-white p-0.5 shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-full grid place-items-center bg-[var(--tenant-primary)] text-[var(--tenant-primary-foreground)] font-bold text-xs shrink-0">
              {initials}
            </div>
          )}
          {orgName && (
            <span className="text-sm font-display font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap">
              {orgName}
            </span>
          )}
        </>
      ) : !wordmarkError ? (
        <img
          src={platformLogo}
          alt="Campus Stay"
          className={cn(WORDMARK_HEIGHT[size] || "h-8", "w-auto max-h-9 object-contain")}
          onError={() => setWordmarkError(true)}
        />
      ) : (
        <span className="text-sm font-display font-bold tracking-tight text-[var(--text-primary)]">
          Campus<span className="text-[var(--tenant-primary)]"> Stay</span>
        </span>
      )}
    </Link>
  );
}

export default Logo;
export * from "./Logo.types";