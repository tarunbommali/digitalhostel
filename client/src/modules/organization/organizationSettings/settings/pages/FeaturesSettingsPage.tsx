import * as React from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { FeatureManagement } from "../../features/pages/FeatureManagement";

export function FeaturesSettingsPage() {
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      <PageHeader
        eyebrow="Organization Settings"
        title="Features & Modular Tooling"
        description="Enable or disable modular SaaS components (Attendance, Outings, Leaves, Billing, Incident Flags, Maintenance)."
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Organization Settings", to: `${basePath}/settings/general` },
          { label: "Features & Modules" },
        ]}
      />

      <FeatureManagement hideHeader />
    </div>
  );
}

export default FeaturesSettingsPage;
