import * as React from "react";
import { useState, useEffect } from "react";
import { Sliders, ShieldCheck, Sparkles, Building2, Users, Layers, Palette, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { LookupManager } from "@/core/components/LookupManager";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";
import { useTenant } from "@/core/context/tenant-context";
import { usePlanFeature } from "@/core/hooks/usePlanFeature";
import { PlanGate } from "@/core/components/PlanGate";
import { api } from "@/core/lib/api";

export function SettingsPage() {
  const { organization, fetchTenantBySlug } = useTenant();
  const { currentPlan, getLimit, isAllowed: canBrand } = usePlanFeature("customBranding");
  const [threshold, setThreshold] = useState(5);

  const [brandingForm, setBrandingForm] = useState({
    primaryColor: organization?.branding?.primaryColor || "#4F46E5",
    secondaryColor: organization?.branding?.secondaryColor || "#0D9488",
    tagline: organization?.branding?.tagline || "",
    logoUrl: organization?.branding?.logoUrl || "",
  });
  const [savingBranding, setSavingBranding] = useState(false);

  useEffect(() => {
    if (organization?.branding) {
      setBrandingForm({
        primaryColor: organization.branding.primaryColor || "#4F46E5",
        secondaryColor: organization.branding.secondaryColor || "#0D9488",
        tagline: organization.branding.tagline || "",
        logoUrl: organization.branding.logoUrl || "",
      });
    }
  }, [organization]);

  useEffect(() => {
    const saved = localStorage.getItem("flag_threshold");
    if (saved) {
      setThreshold(parseInt(saved, 10));
    }
  }, []);

  function saveThreshold() {
    localStorage.setItem("flag_threshold", String(threshold));
    toast.success("System configurations saved successfully");
  }

  async function handleSaveBranding(e: React.FormEvent) {
    e.preventDefault();
    if (!organization?._id) return;
    setSavingBranding(true);
    try {
      await api.patch(`/organizations/${organization._id}/branding`, {
        branding: brandingForm,
      });
      toast.success("Organization branding updated successfully");
      if (organization.slug) {
        fetchTenantBySlug(organization.slug);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update tenant branding");
    } finally {
      setSavingBranding(false);
    }
  }

  const maxStudents = getLimit("maxStudents");
  const maxStaff = getLimit("maxModerators");
  const maxBlocks = getLimit("maxBlocks");

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-h1 text-[var(--text-primary)]">System Settings</h1>
          <p className="font-small text-[var(--text-secondary)] mt-0.5">
            Manage organization tier quotas, custom branding, and master lookups
          </p>
        </div>
        <Breadcrumbs />
      </div>

      {/* Organization Tier & Quota Overview Card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] grid place-items-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-h3 text-base text-[var(--text-primary)]">
                {organization?.name || "Hostel Organization"}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Slug: <span className="font-mono">{organization?.slug}</span> | ID:{" "}
                <span className="font-mono">{organization?._id}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">Active Tier:</span>
            {currentPlan === "ENTERPRISE" ? (
              <Badge variant="enterprise" size="md">
                ENTERPRISE
              </Badge>
            ) : currentPlan === "PRO" ? (
              <Badge variant="pro" size="md">
                PRO
              </Badge>
            ) : (
              <Badge variant="basic" size="md">
                BASIC
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] space-y-1">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Users className="w-3.5 h-3.5 text-[var(--tenant-primary)]" />
              <span>Student Capacity Limit</span>
            </div>
            <p className="font-display text-lg font-bold text-[var(--text-primary)]">
              {maxStudents === Infinity ? "Unlimited" : `${maxStudents} Max`}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] space-y-1">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Staff / Moderator Seats</span>
            </div>
            <p className="font-display text-lg font-bold text-[var(--text-primary)]">
              {maxStaff === Infinity ? "Unlimited" : `${maxStaff} Seats`}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] space-y-1">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Hostel Blocks</span>
            </div>
            <p className="font-display text-lg font-bold text-[var(--text-primary)]">
              {maxBlocks === Infinity ? "Unlimited" : `${maxBlocks} Block`}
            </p>
          </div>
        </div>
      </div>

      {/* Tenant Branding Customization Card (Gated to Pro & Enterprise) */}
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

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm" disabled={savingBranding}>
                {savingBranding ? "Saving Branding..." : "Save Branding"}
              </Button>
            </div>
          </form>
        </PlanGate>
      </div>

      {/* Disciplinary Risk Threshold Card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[var(--tenant-primary)]" />
          <h3 className="font-h3 text-base text-[var(--text-primary)]">Disciplinary Risk Threshold</h3>
        </div>
        <p className="font-small text-xs text-[var(--text-muted)] max-w-lg">
          Students with this count or more of open flag incidents are highlighted with high-risk priority alerts.
        </p>
        <div className="flex items-end gap-3 max-w-xs pt-1">
          <div className="flex-1">
            <label className="font-label text-xs text-[var(--text-primary)] block mb-1">
              Active Flags Limit
            </label>
            <input
              type="number"
              min={1}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
            />
          </div>
          <Button onClick={saveThreshold} variant="primary" size="md">
            Save Threshold
          </Button>
        </div>
      </div>

      {/* Master Lookups */}
      <div className="pt-2">
        <LookupManager />
      </div>
    </div>
  );
}

export default SettingsPage;
