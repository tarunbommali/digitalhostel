import * as React from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { NotificationsTab } from "../components/NotificationsTab";

export function NotificationsSettingsPage() {
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      <PageHeader
        eyebrow="Organization Settings"
        title="Notifications & Alerts"
        description="Configure automated system broadcasts, parent SMS alerts, and warden email channels."
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Organization Settings", to: `${basePath}/settings/general` },
          { label: "Notifications" },
        ]}
      />

      <NotificationsTab />
    </div>
  );
}

export default NotificationsSettingsPage;
