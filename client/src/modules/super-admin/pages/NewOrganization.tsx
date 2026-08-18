import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/core/lib/api";
import { toast } from "sonner";
import { useSuperAdmin } from "../context/super-admin-context";
import { OrganizationFormData } from "../types/organization.types";
import OrganizationForm from "../components/OrganizationForm";
import { PageHeader } from "@/core/components/ui/PageHeader";

export default function NewOrganization() {
  const navigate = useNavigate();
  const { fetchOrganizations } = useSuperAdmin();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Create Organization | Campus Stay";
  }, []);

  const handleCreate = async (formData: OrganizationFormData) => {
    if (!formData.name || !formData.slug || !formData.adminEmail || !formData.adminPassword) {
      toast.error("Please fill in all mandatory fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug.toLowerCase().trim(),
        location: formData.location,
        plan: formData.plan,
        subscriptionStatus: formData.subscriptionStatus,
        adminName: formData.adminName || `${formData.name} Administrator`,
        adminEmail: formData.adminEmail.toLowerCase().trim(),
        adminPassword: formData.adminPassword,
        tagline: formData.tagline,
        branding: {
          logoUrl: formData.logoUrl,
          primaryColor: formData.primaryColor,
        },
      };

      const res: any = await api.post("/super-admin/organizations", payload);
      toast.success(res.message || "Organization & Admin Account Created Successfully!");
      await fetchOrganizations(true);
      navigate("/super-admin/organizations");
    } catch (err: any) {
      toast.error(err.message || "Failed to create organization");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <PageHeader
        eyebrow="Platform Administration"
        title="Create Organization"
        description="Provision a new tenant workspace, configure subscription tier, and create admin account credentials"
        breadcrumbs={[
          { label: "Platform Console", to: "/super-admin" },
          { label: "Organizations", to: "/super-admin/organizations" },
          { label: "Create Organization" },
        ]}
      />

      <OrganizationForm
        isEdit={false}
        onSubmit={handleCreate}
        loading={submitting}
        onCancel={() => navigate("/super-admin/organizations")}
      />
    </div>
  );
}
