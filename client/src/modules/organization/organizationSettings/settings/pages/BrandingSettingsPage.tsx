import * as React from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { BrandingTab } from "../components/BrandingTab";

export function BrandingSettingsPage() {
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      <PageHeader
        eyebrow="Organization Settings"
        title="Hostel Branding & Styling"
        description="Customize primary and secondary accent colors, logo, banners, slogans, and live theme styling."
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Organization Settings", to: `${basePath}/settings/general` },
          { label: "Branding" },
        ]}
      />

      <BrandingTab />
    </div>
  );
}

export default BrandingSettingsPage;
