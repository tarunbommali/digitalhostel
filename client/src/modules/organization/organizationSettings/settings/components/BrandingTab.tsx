import React, { useState } from "react";
import { Palette, Lock, Check } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { PlanGate } from "@/core/components/PlanGate";
import { useTenant } from "@/core/context/tenant-context";
import { usePlanFeature } from "@/core/hooks/usePlanFeature";
import { api } from "@/core/lib/api";
import { toast } from "sonner";

export function BrandingTab() {
  const { organization, fetchTenantBySlug } = useTenant();
  const { isAllowed: canBrand } = usePlanFeature("customBranding");

  const [brandingForm, setBrandingForm] = useState({
    primaryColor: organization?.branding?.primaryColor || "#4F46E5",
    secondaryColor: organization?.branding?.secondaryColor || "#0D9488",
    tagline: organization?.branding?.tagline || "",
    logoUrl: organization?.branding?.logoUrl || "",
    bannerUrl: organization?.branding?.bannerUrl || "",
  });
  const [savingBranding, setSavingBranding] = useState(false);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?._id) return;
    setSavingBranding(true);
    try {
      await api.patch(`/organizations/${organization._id}/branding`, {
        branding: brandingForm,
      });
      toast.success("Hostel branding and color palette updated successfully");
      if (organization.slug) {
        await fetchTenantBySlug(organization.slug);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update branding settings");
    } finally {
      setSavingBranding(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Branding Card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-[var(--tenant-primary)]" />
            <h3 className="font-h3 text-base text-[var(--text-primary)]">Hostel Branding & Styling</h3>
          </div>
          {!canBrand && (
            <Badge variant="pro" size="sm">
              <Lock className="w-3 h-3 mr-1" />
              Pro Feature
            </Badge>
          )}
        </div>

        <PlanGate
          featureKey="customBranding"
          title="Custom Branding is locked"
          description="Personalize your portal with customized accent colors, hostel emblems, logos, and taglines by upgrading to Pro or Enterprise."
        >
          <form onSubmit={handleSaveBranding} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-label text-xs text-[var(--text-primary)] block">
                  Primary Theme Color (Hex)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandingForm.primaryColor}
                    onChange={(e) =>
                      setBrandingForm({ ...brandingForm, primaryColor: e.target.value })
                    }
                    className="w-9 h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] p-0.5 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingForm.primaryColor}
                    onChange={(e) =>
                      setBrandingForm({ ...brandingForm, primaryColor: e.target.value })
                    }
                    className="flex-1 h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label text-xs text-[var(--text-primary)] block">
                  Secondary Accent Color (Hex)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandingForm.secondaryColor}
                    onChange={(e) =>
                      setBrandingForm({ ...brandingForm, secondaryColor: e.target.value })
                    }
                    className="w-9 h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] p-0.5 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingForm.secondaryColor}
                    onChange={(e) =>
                      setBrandingForm({ ...brandingForm, secondaryColor: e.target.value })
                    }
                    className="flex-1 h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label text-xs text-[var(--text-primary)] block">
                  Hostel Logo URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={brandingForm.logoUrl}
                  onChange={(e) =>
                    setBrandingForm({ ...brandingForm, logoUrl: e.target.value })
                  }
                  className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label text-xs text-[var(--text-primary)] block">
                  Banner / Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  value={brandingForm.bannerUrl}
                  onChange={(e) =>
                    setBrandingForm({ ...brandingForm, bannerUrl: e.target.value })
                  }
                  className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label text-xs text-[var(--text-primary)] block">
                Hostel Tagline / Slogan
              </label>
              <input
                type="text"
                placeholder="Smart Multi-Tenant Hostel Living"
                value={brandingForm.tagline}
                onChange={(e) =>
                  setBrandingForm({ ...brandingForm, tagline: e.target.value })
                }
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)]"
              />
            </div>

            {/* Live Branding Preview */}
            <div className="rounded-lg border border-[var(--color-border)] p-4 bg-[var(--color-surface-sunken)] space-y-2">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Live Brand Preview
              </span>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: brandingForm.primaryColor }}
                >
                  {organization?.name?.[0] || "H"}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    {organization?.name || "Hostel Organization"}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {brandingForm.tagline || "Smart Multi-Tenant Hostel Living"}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div
                    className="px-2.5 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: brandingForm.primaryColor }}
                  >
                    Primary CTA
                  </div>
                  <div
                    className="px-2.5 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: brandingForm.secondaryColor }}
                  >
                    Secondary
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm" disabled={savingBranding}>
                {savingBranding ? "Saving Branding..." : "Save Branding"}
              </Button>
            </div>
          </form>
        </PlanGate>
      </div>
    </div>
  );
}
