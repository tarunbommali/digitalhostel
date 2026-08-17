import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/core/lib/api";
import { toast } from "sonner";
import { LayoutDashboard } from "lucide-react";
import { useSuperAdmin } from "../context/super-admin-context";
import { OrganizationFormData } from "../types/organization.types";
import OrganizationForm from "../components/OrganizationForm";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";

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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Create Organization
          </h1>
          <p className="font-small text-xs text-[var(--text-secondary)] mt-1">
            Provision a new tenant workspace, configure subscription tier, and create admin account credentials
          </p>
        </div>

        {/* Page-Specific Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Platform Console", to: "/super-admin", },
            { label: "Organizations", to: "/super-admin/organizations" },
            { label: "Create Organization" },
          ]}
        />
      </div>

      <OrganizationForm
        isEdit={false}
        onSubmit={handleCreate}
        loading={submitting}
        onCancel={() => navigate("/super-admin/organizations")}
      />
    </div>
  );
}
