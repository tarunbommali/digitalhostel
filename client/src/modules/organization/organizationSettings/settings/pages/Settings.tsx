import * as React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Building2,
  Palette,
  Layers,
  Users,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/core/components/ui/tabs";
import { GeneralTab } from "../components/GeneralTab";
import { BrandingTab } from "../components/BrandingTab";
import { NotificationsTab } from "../components/NotificationsTab";
import { SecurityTab } from "../components/SecurityTab";
import { FeatureManagement } from "../../features/pages/FeatureManagement";
import { ModeratorsPage } from "../../staff/pages/Moderators";

export function SettingsPage() {
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "general";

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val });
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "branding":
        return "Branding & Styling";
      case "features":
        return "Features & Modules";
      case "staff":
        return "Staff & Roles";
      case "notifications":
        return "Notifications & Alerts";
      case "security":
        return "Security & Access";
      case "general":
      default:
        return "General Configuration";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      <PageHeader
        eyebrow="Administration"
        title="Organization Settings"
        description="Unified configuration hub for organization profile, branding, modular tools, staff privileges, alerts, and security."
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Organization Settings", to: `${basePath}/settings` },
          { label: getTabTitle(activeTab) },
        ]}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList
            variant="segmented"
            className="w-full sm:w-auto h-auto p-1 grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-row gap-1 bg-[var(--color-surface-sunken)] border border-[var(--color-border)]"
          >
            <TabsTrigger value="general" className="gap-2 py-2 px-3 text-xs font-medium">
              <Building2 className="w-3.5 h-3.5 shrink-0 text-[var(--tenant-primary)]" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2 py-2 px-3 text-xs font-medium">
              <Palette className="w-3.5 h-3.5 shrink-0 text-fuchsia-500" />
              <span>Branding</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2 py-2 px-3 text-xs font-medium">
              <Layers className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span>Features & Modules</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2 py-2 px-3 text-xs font-medium">
              <Users className="w-3.5 h-3.5 shrink-0 text-blue-500" />
              <span>Staff & Roles</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 py-2 px-3 text-xs font-medium">
              <Bell className="w-3.5 h-3.5 shrink-0 text-violet-500" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 py-2 px-3 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="focus-visible:outline-none">
          <GeneralTab />
        </TabsContent>

        <TabsContent value="branding" className="focus-visible:outline-none">
          <BrandingTab />
        </TabsContent>

        <TabsContent value="features" className="focus-visible:outline-none">
          <FeatureManagement />
        </TabsContent>

        <TabsContent value="staff" className="focus-visible:outline-none">
          <ModeratorsPage />
        </TabsContent>

        <TabsContent value="notifications" className="focus-visible:outline-none">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="security" className="focus-visible:outline-none">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage;
