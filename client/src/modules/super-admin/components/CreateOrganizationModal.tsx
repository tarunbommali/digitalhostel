import React, { useState } from "react";
import { Building2, Shield, Sparkles } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { OrganizationFormData } from "../types/organization.types";
import { toast } from "sonner";
import { api } from "@/core/lib/api";

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const initialFormData: OrganizationFormData = {
  name: "",
  slug: "",
  location: "Bangalore",
  plan: "Pro",
  subscriptionStatus: "Active",
  adminName: "",
  adminEmail: "",
  adminPassword: "Bommali@2001",
  tagline: "Modern Premium Student Hostel & Residency",
  logoUrl: "",
  primaryColor: "#4F46E5",
};

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<OrganizationFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setFormData(initialFormData);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create organization");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 md:p-8 max-w-2xl w-full shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--tenant-primary)] flex items-center justify-center text-white font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-h3 text-lg text-[var(--text-primary)]">Create Organization & Admin</h3>
              <p className="font-small text-xs text-[var(--text-muted)]">
                Provision multi-tenant credentials for new hostel workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg font-bold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-label text-[var(--text-primary)]">
                Hostel / Organization Name <span className="text-[var(--color-danger)]">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. Royal Crown Hostel"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
                  setFormData({ ...formData, name, slug });
                }}
                className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-label text-[var(--text-primary)]">
                URL Slug (Route Path) <span className="text-[var(--color-danger)]">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. royal-crown"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--tenant-primary)] font-mono text-xs rounded-md h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="font-label text-[var(--text-primary)]">
                Location (City) <span className="text-[var(--color-danger)]">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. Bangalore"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-label text-[var(--text-primary)]">Subscription Plan</Label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[var(--text-primary)] text-xs px-3 focus:outline-none focus:border-[var(--tenant-primary)]"
              >
                <option value="Basic">Basic Plan</option>
                <option value="Pro">Pro Plan</option>
                <option value="Enterprise">Enterprise Plan</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-label text-[var(--text-primary)]">Subscription Status</Label>
              <select
                value={formData.subscriptionStatus}
                onChange={(e) =>
                  setFormData({ ...formData, subscriptionStatus: e.target.value })
                }
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[var(--text-primary)] text-xs px-3 focus:outline-none focus:border-[var(--tenant-primary)]"
              >
                <option value="Active">Active</option>
                <option value="Trial">Trial</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--color-border)]">
            <h4 className="font-h3 text-xs text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[var(--tenant-primary)]" />
              Tenant Administrator Initial Account
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-label text-[var(--text-primary)]">
                  Admin Email (Login ID) <span className="text-[var(--color-danger)]">*</span>
                </Label>
                <Input
                  type="email"
                  required
                  placeholder="admin@hostel.edu"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-label text-[var(--text-primary)]">
                  Admin Temporary Password <span className="text-[var(--color-danger)]">*</span>
                </Label>
                <Input
                  type="password"
                  required
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--color-border)]">
            <h4 className="font-h3 text-xs text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Tenant Branding Customization (Optional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-label text-[var(--text-primary)]">Hostel Tagline</Label>
                <Input
                  placeholder="e.g. Modern Student Living"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-label text-[var(--text-primary)]">Primary Brand Color (Hex)</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-9 h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] p-0.5 cursor-pointer"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] font-mono text-xs rounded-md h-9 flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              className="gap-1.5"
            >
              Create & Provision Organization
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrganizationModal;
