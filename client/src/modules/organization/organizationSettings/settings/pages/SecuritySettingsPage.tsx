import * as React from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { SecurityTab } from "../components/SecurityTab";

export function SecuritySettingsPage() {
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      <PageHeader
        eyebrow="Organization Settings"
        title="Security & Access Policies"
        description="Manage authentication complexity requirements, session timeout, audit logging, and cryptographic tenant tokens."
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Organization Settings", to: `${basePath}/settings/general` },
          { label: "Security" },
        ]}
      />

      <SecurityTab />
    </div>
  );
}

export default SecuritySettingsPage;
