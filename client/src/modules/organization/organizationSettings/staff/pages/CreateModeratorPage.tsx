import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/core/lib/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorUtils";
import { Button } from "@/core/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { ModeratorForm, ModeratorFormValues } from "../components/ModeratorForm";

export function CreateModeratorPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { organization } = useTenant();
  const basePath = slug ? `/organization/${slug}` : "";
  const [busy, setBusy] = useState(false);

  const handleCreate = async (values: ModeratorFormValues) => {
    if (!values.email || (!values.firstName && !values.fullName)) {
      toast.error("First name and email are required");
      return;
    }

    setBusy(true);
    try {
      await api.post("/moderators", values);
      const createdName = `${values.firstName} ${values.lastName}`.trim() || values.fullName || "Staff Member";
      toast.success(`Staff account for ${createdName} created successfully`);
      navigate(`${basePath}/settings/staff`);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to create staff account"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <PageHeader
          eyebrow="Organization Settings"
          title="Add New Staff Account"
          description="Create a new warden, admin, mess supervisor, or security account and assign operational responsibilities."
          breadcrumbs={[
            { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
            { label: "Organization Settings", to: `${basePath}/settings/general` },
            { label: "Staff & Roles", to: `${basePath}/settings/staff` },
            { label: "New Staff Member" },
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
        mode="create"
        busy={busy}
        onSubmit={handleCreate}
        onCancel={() => navigate(`${basePath}/settings/staff`)}
      />
    </div>
  );
}

export default CreateModeratorPage;
