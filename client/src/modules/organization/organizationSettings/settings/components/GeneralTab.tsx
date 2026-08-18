import React, { useState } from "react";
import { Building2, Globe, Clock, Calendar, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { useTenant } from "@/core/context/tenant-context";
import { api } from "@/core/lib/api";
import { toast } from "sonner";

export function GeneralTab() {
  const { organization, fetchTenantBySlug } = useTenant();

  const [form, setForm] = useState({
    name: organization?.name || "",
    type: (organization as any)?.type || "hostel",
    location: organization?.location || "",
    contactPhone: organization?.contactPhone || "",
    supportEmail: organization?.supportEmail || "",
    timezone: (organization as any)?.timezone || "Asia/Kolkata (IST)",
    academicYear: (organization as any)?.academicYear || "2026–2027",
  });
  const [savingGeneral, setSavingGeneral] = useState(false);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?._id) return;
    setSavingGeneral(true);
    try {
      await api.patch(`/organizations/${organization._id}`, form);
      toast.success("Organization settings updated successfully");
      if (organization.slug) {
        await fetchTenantBySlug(organization.slug);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update organization settings");
    } finally {
      setSavingGeneral(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl">
      {/* Organization Identity & Profile Card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] grid place-items-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-h3 text-base text-[var(--text-primary)] font-semibold">
                Organization Profile
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Core identity, timezone, and contact information for this workspace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs text-[var(--text-muted)]">Status:</span>
            <Badge variant="success" size="sm" dot>
              Active
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSaveGeneral} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organization Name */}
            <div className="space-y-1.5">
              <label className="font-label text-xs text-[var(--text-primary)] block">
                Organization Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. MyHome Residencies"
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
              />
            </div>

            {/* Organization Type */}
            <div className="space-y-1.5">
              <label className="font-label text-xs text-[var(--text-primary)] block">
                Property / Organization Type
              </label>
              <Select
                value={form.type}
                onValueChange={(val) => setForm({ ...form, type: val })}
              >
                <SelectTrigger className="h-9 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)] text-xs">
                  <SelectItem value="hostel">🏢 Student Hostel</SelectItem>
                  <SelectItem value="college_residence">🎓 College Campus Residence</SelectItem>
                  <SelectItem value="pg">🏠 Paying Guest (PG)</SelectItem>
                  <SelectItem value="co_living">🏘️ Co-Living Community</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campus / Location */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-label text-xs text-[var(--text-primary)] block">
                Campus Address / Location *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                placeholder="e.g. Main Campus, Gate 2, Hyderabad, Telangana"
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="font-label text-xs text-[var(--text-primary)] block">
                Administrative Contact Phone
              </label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
              />
            </div>

            {/* Support Email */}
            <div className="space-y-1.5">
              <label className="font-label text-xs text-[var(--text-primary)] block">
                Official Support Email
              </label>
              <input
                type="email"
                value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                placeholder="admin@campusstay.edu"
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
              />
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <label className="font-label text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                Timezone
              </label>
              <Select
                value={form.timezone}
                onValueChange={(val) => setForm({ ...form, timezone: val })}
              >
                <SelectTrigger className="h-9 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)] text-xs">
                  <SelectItem value="Asia/Kolkata (IST)">Asia/Kolkata (IST +5:30)</SelectItem>
                  <SelectItem value="Asia/Dubai (GST)">Asia/Dubai (GST +4:00)</SelectItem>
                  <SelectItem value="Asia/Singapore (SGT)">Asia/Singapore (SGT +8:00)</SelectItem>
                  <SelectItem value="Europe/London (GMT)">Europe/London (GMT +0:00)</SelectItem>
                  <SelectItem value="America/New_York (EST)">America/New_York (EST -5:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Academic Year */}
            <div className="space-y-1.5">
              <label className="font-label text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                Current Academic Year
              </label>
              <input
                type="text"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                placeholder="2026–2027"
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[var(--color-border)]">
            <Button type="submit" variant="primary" size="sm" disabled={savingGeneral} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              {savingGeneral ? "Saving Settings..." : "Save Organization Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GeneralTab;
