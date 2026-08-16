import * as React from "react";
import { useTenant } from "@/core/context/tenant-context";
import { Logo } from "@/core/components/ui/Logo";

export interface AuthBrandHeaderProps {
  variant: "platform" | "tenant";
}

export function AuthBrandHeader({ variant }: AuthBrandHeaderProps) {
  const { organization } = useTenant();

  if (variant === "platform") {
    return (
      <div className="flex flex-col items-center text-center mb-6 space-y-1">
        <Logo variant="platform" to="/super-admin/login" size="lg" />
        <p className="font-small text-xs text-[var(--text-muted)] mt-1">
          Platform Management & Administration Console
        </p>
      </div>
    );
  }

  const logoUrl = organization?.branding?.logoUrl;
  const orgName = organization?.name || "Campus Stay";
  const location = organization?.location;

  return (
    <div className="flex flex-col items-center text-center mb-6 space-y-1">
      <Logo
        variant="tenant"
        to={organization?.slug ? `/organization/${organization.slug}/login` : "/"}
        logoUrl={logoUrl}
        orgName={orgName}
        size="lg"
      />
      {location && (
        <p className="font-small text-xs text-[var(--text-muted)] mt-1">
          {location} Residency Workspace
        </p>
      )}
    </div>
  );
}

export default AuthBrandHeader;
