import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/core/lib/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorUtils";
import { Button } from "@/core/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { ModeratorForm, ModeratorFormValues } from "../components/ModeratorForm";

export function EditModeratorPage() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
  const { organization } = useTenant();
  const basePath = slug ? `/organization/${slug}` : "";

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [staffData, setStaffData] = useState<Partial<ModeratorFormValues> | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    api
      .get<any>(`/moderators/${id}`)
      .then((data) => {
        const staff = (data as any)?.data || data;
        const fName = staff.firstName || (staff.fullName || "").split(" ")[0] || "";
        const lName = staff.lastName || (staff.fullName || "").split(" ").slice(1).join(" ") || "";

        setStaffData({
          firstName: fName,
          lastName: lName,
          fullName: staff.fullName || `${fName} ${lName}`.trim(),
          email: staff.email || "",
          phone: staff.phone || staff.phoneNumber || "",
          gender: staff.gender || "male",
          password: "",
          moderatorType: staff.moderatorType || "administration",
          role: staff.role || "moderator",
        });
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, "Failed to load staff details"));
        navigate(`${basePath}/settings/staff`);
      })
      .finally(() => setLoading(false));
  }, [id, basePath, navigate]);

  const handleUpdate = async (values: ModeratorFormValues) => {
    if (!id) return;
    setBusy(true);

    try {
      await api.put(`/moderators/${id}`, values);
      toast.success(`Staff account for ${values.firstName || values.fullName} updated successfully`);
      navigate(`${basePath}/settings/staff`);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to update staff account"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--tenant-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <PageHeader
          eyebrow="Organization Settings"
          title="Edit Staff Account & Responsibilities"
          description="Update personal details, credentials, and assigned operational responsibilities."
          breadcrumbs={[
            { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
            { label: "Organization Settings", to: `${basePath}/settings/general` },
            { label: "Staff & Roles", to: `${basePath}/settings/staff` },
            { label: staffData?.fullName || "Edit Staff" },
          ]}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`${basePath}/settings/staff`)}
          className="gap-1.5 text-xs shrink-0 self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Staff List
        </Button>
      </div>

      <ModeratorForm
        mode="edit"
        initialValues={staffData || undefined}
        busy={busy}
        onSubmit={handleUpdate}
        onCancel={() => navigate(`${basePath}/settings/staff`)}
      />
    </div>
  );
}

export default EditModeratorPage;
