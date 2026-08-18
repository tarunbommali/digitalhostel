import * as React from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { ModeratorsPage } from "../../staff/pages/Moderators";

export function StaffSettingsPage() {
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      <PageHeader
        eyebrow="Organization Settings"
        title="Staff & Roles"
        description="Create and manage staff accounts with specific privilege levels (Administration, Warden, Mess Attendance, Security Guard)."
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Organization Settings", to: `${basePath}/settings/general` },
          { label: "Staff & Roles" },
        ]}
      />

      <ModeratorsPage hideHeader />
    </div>
  );
}

export default StaffSettingsPage;
