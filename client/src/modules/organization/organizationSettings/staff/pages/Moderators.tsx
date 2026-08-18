import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/core/lib/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorUtils";
import { StaffListTable } from "../components/StaffListTable";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { useParams } from "react-router-dom";

export interface ModeratorsPageProps {
  hideHeader?: boolean;
}

export function ModeratorsPage({ hideHeader = false }: ModeratorsPageProps = {}) {
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";
  const [mods, setMods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMods = useCallback(() => {
    setLoading(true);
    api
      .get<any[]>("/moderators")
      .then((data) => {
        const list = Array.isArray(data) ? data : (data as any)?.data || [];
        setMods(list);
      })
      .catch((err) => toast.error(getErrorMessage(err, "Failed to load staff accounts")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMods();
  }, [fetchMods]);

  async function toggleActive(id: string, active: boolean) {
    try {
      await api.put(`/moderators/${id}/status`, { active: !active });
      toast.success(`Account ${!active ? "enabled" : "disabled"}`);
      fetchMods();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to toggle status"));
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {!hideHeader && (
        <PageHeader
          eyebrow="Organization Settings"
          title="Staff & Roles"
          description="Manage staff directory, privileges, and assigned operational responsibilities across Residents, Operations, and Finance."
          breadcrumbs={[
            { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
            { label: "Organization Settings", to: `${basePath}/settings/general` },
            { label: "Staff & Roles" },
          ]}
        />
      )}

      <StaffListTable
        loading={loading}
        mods={mods}
        toggleActive={toggleActive}
      />
    </div>
  );
}

export default ModeratorsPage;

