import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, } from "lucide-react";
import { api } from "@/core/lib/api";
import { toast } from "sonner";
import { OrganizationForm } from "../components/OrganizationForm";
import { Organization, OrganizationFormData } from "../types/organization.types";
import { useSuperAdmin } from "../context/super-admin-context";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";

export default function EditOrganization() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getOrganizationById, updateOrganizationInState } = useSuperAdmin();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orgData, setOrgData] = useState<Partial<OrganizationFormData> | null>(() => {
    if (!id) return null;
    const cached = getOrganizationById(id);
    if (!cached) return null;
    return {
      name: cached.name || "",
      slug: cached.slug || "",
      location: cached.location || "",
      plan: (cached.plan || "PRO").toUpperCase(),
      subscriptionStatus: (cached.subscriptionStatus || "active").toLowerCase(),
      adminName: cached.adminName || `${cached.name || ""} Administrator`,
      adminEmail: cached.adminEmail || "",
      adminPassword: "",
      tagline: cached.branding?.tagline || cached.tagline || "",
      logoUrl: cached.branding?.logoUrl || "",
      primaryColor: cached.branding?.primaryColor || "#4F46E5",
    };
  });

  useEffect(() => {
    document.title = "Edit Organization | Campus Stay";
    const fetchOrganization = async () => {
      if (!id) return;
      if (orgData) return; // Fast-path: use context data immediately
      setLoading(true);
      try {
        const data = await api.get<Organization>(`/organizations/by-id/${id}`);
        setOrgData({
          name: data.name || "",
          slug: data.slug || "",
          location: data.location || "",
          plan: (data.plan || "PRO").toUpperCase(),
          subscriptionStatus: (data.subscriptionStatus || "active").toLowerCase(),
          adminName: data.adminName || `${data.name || ""} Administrator`,
          adminEmail: data.adminEmail || "",
          adminPassword: "",
          tagline: data.branding?.tagline || data.tagline || "",
          logoUrl: data.branding?.logoUrl || "",
          primaryColor: data.branding?.primaryColor || "#4F46E5",
        });
      } catch (err: any) {
        toast.error(err.message || "Failed to load organization details");
        navigate("/super-admin/organizations");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [id, navigate, orgData]);

  const handleUpdate = async (formData: OrganizationFormData) => {
    if (!id) return;
    setSaving(true);
    try {
      const payload: any = {
        name: formData.name,
        slug: formData.slug.toLowerCase().trim(),
        location: formData.location,
        plan: formData.plan,
        subscriptionStatus: formData.subscriptionStatus,
        adminEmail: formData.adminEmail.toLowerCase().trim(),
        branding: {
          tagline: formData.tagline,
          logoUrl: formData.logoUrl,
          primaryColor: formData.primaryColor,
        },
      };

      if (formData.adminPassword && formData.adminPassword.trim()) {
        payload.adminPassword = formData.adminPassword.trim();
      }

      await api.patch(`/organizations/${id}`, payload);
      updateOrganizationInState(id, payload);
      toast.success("Organization updated successfully!");
      navigate("/super-admin/organizations");
    } catch (err: any) {
      toast.error(err.message || "Failed to update organization");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Edit Organization
          </h1>
          <p className="font-small text-xs text-[var(--text-secondary)] mt-1">
            Update tenant profile details, subscription plan, administrative access, and branding
          </p>
        </div>

        {/* Page-Specific Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Super Admin", to: "/super-admin", },
            { label: "Organizations", to: "/super-admin/organizations" },
            { label: orgData?.name ? `Edit: ${orgData.name}` : "Edit Organization" },
          ]}
        />
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 text-[var(--tenant-primary)] animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--text-muted)]">Loading organization profile...</p>
        </div>
      ) : (
        <OrganizationForm
          initialData={orgData || undefined}
          isEdit={true}
          onSubmit={handleUpdate}
          loading={saving}
          onCancel={() => navigate("/super-admin/organizations")}
        />
      )}
    </div>
  );
}
