import React, { useState, useEffect } from "react";
import { Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { OrganizationFormData } from "../types/organization.types";
import { toast } from "sonner";

interface OrganizationFormProps {
  initialData?: Partial<OrganizationFormData>;
  isEdit: boolean;
  onSubmit: (data: OrganizationFormData) => Promise<void>;
  loading?: boolean;
  onCancel: () => void;
}

const defaultFormData: OrganizationFormData = {
  name: "",
  slug: "",
  location: "Bangalore",
  plan: "Pro",
  subscriptionStatus: "Active",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
  tagline: "Modern Premium Student Hostel & Residency",
  logoUrl: "",
  primaryColor: "#4F46E5",
};

export const OrganizationForm: React.FC<OrganizationFormProps> = ({
  initialData,
  isEdit,
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const [formData, setFormData] = useState<OrganizationFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!isEdit) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      setFormData({ ...formData, name, slug });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleCopySlug = () => {
    const url = `/organization/${formData.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Portal URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 md:p-8 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Profile Section */}
        <div>
          <h3 className="font-h3 text-base font-semibold text-[var(--text-primary)] mb-4">
            Hostel & Organization Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organization Name */}
            <div className="space-y-1.5">
              <Label className="font-label text-[var(--text-primary)]">
                Hostel / Organization Name <span className="text-[var(--color-danger)]">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. Royal Crown Hostel"
                value={formData.name}
                onChange={handleNameChange}
                className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
              />
            </div>

            {/* URL Slug with quick copy action */}
            <div className="space-y-1.5">
              <Label className="font-label text-[var(--text-primary)]">
                URL Route Slug <span className="text-[var(--color-danger)]">*</span>
              </Label>
              <div className="relative">
                <Input
                  required
                  placeholder="e.g. royal-crown"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--tenant-primary)] font-mono text-xs rounded-md h-9 pr-24"
                />
                <div className="absolute right-1 top-1 flex items-center gap-1">
                  <span className="text-[10px] text-[var(--text-muted)] px-1 font-mono">/org/</span>
                  <button
                    type="button"
                    onClick={handleCopySlug}
                    className="p-1 hover:bg-[var(--color-surface-hover)] rounded-md transition-colors cursor-pointer"
                    title="Copy portal URL"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-[var(--color-success)]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Location */}
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

            {/* Plan */}
            <div className="space-y-1.5">
              <Label className="font-label text-[var(--text-primary)]">Subscription Plan</Label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[var(--text-primary)] text-xs px-3 focus:outline-none focus:border-[var(--tenant-primary)] cursor-pointer"
              >
                <option value="Basic">Basic Plan (500 Students, 1 Block)</option>
                <option value="Pro">Pro Plan (1,000 Students, Unlimited Blocks)</option>
                <option value="Enterprise">Enterprise Plan (Unlimited)</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="font-label text-[var(--text-primary)]">Subscription Status</Label>
              <select
                value={formData.subscriptionStatus}
                onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value })}
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[var(--text-primary)] text-xs px-3 focus:outline-none focus:border-[var(--tenant-primary)] cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Trial">Trial</option>
                <option value="Expired">Expired</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Admin Credentials Section */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          <h3 className="font-h3 text-base font-semibold text-[var(--text-primary)] mb-4">
            Tenant Administrator Credentials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-label text-[var(--text-primary)]">
                Admin Full Name
              </Label>
              <Input
                placeholder="e.g. John Doe"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
              />
            </div>

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

            {!isEdit ? (
              <div className="space-y-1.5 md:col-span-2">
                <Label className="font-label text-[var(--text-primary)]">
                  Admin Temporary Password <span className="text-[var(--color-danger)]">*</span>
                </Label>
                <Input
                  type="password"
                  required
                  placeholder="Enter temporary password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
                />
              </div>
            ) : (
              <div className="space-y-1.5 md:col-span-2">
                <Label className="font-label text-[var(--text-primary)]">
                  New Admin Password (leave blank to keep current)
                </Label>
                <Input
                  type="password"
                  placeholder="Enter new password (leave blank to keep current)"
                  value={formData.adminPassword || ""}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tenant Branding Section */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          <h3 className="font-h3 text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Tenant Branding Customization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-label text-[var(--text-primary)]">Hostel Tagline</Label>
              <Input
                placeholder="e.g. Modern Student Living & Residency"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-label text-[var(--text-primary)]">Logo URL</Label>
              <Input
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="font-label text-[var(--text-primary)]">Primary Brand Color (Hex)</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] p-0.5 cursor-pointer"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] font-mono text-xs rounded-md h-9 max-w-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={loading}
            className="gap-2"
          >
            {isEdit ? "Save Changes" : "Create Organization"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationForm;
