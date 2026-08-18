import React, { useState, useEffect } from "react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { PhoneInput } from "@/core/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/core/components/ui/dialog";
import {
  Loader2,
  Users,
  DoorOpen,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import {
  AccessLevel,
  DomainPermissions,
  DEFAULT_DOMAIN_PERMISSIONS,
  STAFF_PRESETS,
  resolveModeratorType,
} from "../types/authorization.types";

interface EditStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  setForm: (form: any) => void;
  countryCode: string;
  setCountryCode: (code: string) => void;
  phoneDigits: string;
  setPhoneDigits: (digits: string) => void;
  busy: boolean;
  handleUpdate: (e: React.FormEvent) => void;
}

export function EditStaffModal({
  open,
  onOpenChange,
  form,
  setForm,
  countryCode,
  setCountryCode,
  phoneDigits,
  setPhoneDigits,
  busy,
  handleUpdate,
}: EditStaffModalProps) {
  const [domainPermissions, setDomainPermissions] = useState<DomainPermissions>(DEFAULT_DOMAIN_PERMISSIONS);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  // Sync initial domain permissions from existing moderatorType
  useEffect(() => {
    if (form.moderatorType) {
      const match = STAFF_PRESETS.find((p) => p.moderatorType === form.moderatorType);
      if (match) {
        setDomainPermissions(JSON.parse(JSON.stringify(match.permissions)));
      }
    }
  }, [form.moderatorType]);

  const handleDomainLevelChange = (
    domain: "residents" | "operations" | "finance",
    level: AccessLevel
  ) => {
    const updated: DomainPermissions = {
      ...domainPermissions,
      [domain]: {
        ...domainPermissions[domain],
        level,
      },
    };
    setDomainPermissions(updated);

    const resolved = resolveModeratorType(updated);
    setForm({
      ...form,
      moderatorType: resolved,
    });
  };

  const handleCustomCapabilityToggle = (
    domain: "residents" | "operations" | "finance",
    key: string
  ) => {
    const currentDomain = domainPermissions[domain];
    const currentCustom = (currentDomain.custom || {}) as Record<string, boolean>;
    const newVal = !currentCustom[key];

    const updated: DomainPermissions = {
      ...domainPermissions,
      [domain]: {
        ...currentDomain,
        level: "limited",
        custom: {
          ...currentCustom,
          [key]: newVal,
        },
      },
    };
    setDomainPermissions(updated);

    const resolved = resolveModeratorType(updated);
    setForm({
      ...form,
      moderatorType: resolved,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-[var(--text-primary)]">
            Edit Staff Account & Responsibilities
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-5 py-2">
          {/* Identity Fields */}
          <div className="grid gap-3.5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--text-primary)]">First Name *</Label>
              <Input
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--text-primary)]">Last Name *</Label>
              <Input
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-medium text-[var(--text-primary)]">Email Address *</Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-medium text-[var(--text-primary)]">Phone Number</Label>
              <PhoneInput
                countryCode={countryCode}
                setCountryCode={setCountryCode}
                phoneDigits={phoneDigits}
                setPhoneDigits={setPhoneDigits}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--text-primary)]">Gender & Attached Hostel Access *</Label>
              <Select
                value={form.gender}
                onValueChange={(val) => setForm({ ...form, gender: val })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">👨 Male Warden (Boys Access)</SelectItem>
                  <SelectItem value="female">👩 Female Warden (Girls Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--text-primary)]">New Password (Optional)</Label>
              <Input
                type="password"
                placeholder="Leave blank to keep unchanged"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          {/* Access & Responsibilities */}
          <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Staff Access & Responsibilities
              </h3>
              <Badge variant="neutral" size="sm" className="gap-1">
                Resolved: <span className="font-mono">{form.moderatorType || "administration"}</span>
              </Badge>
            </div>

            {/* 3 Domain Cards */}
            <div className="space-y-3">
              {/* Residents */}
              <div className="p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-[var(--tenant-primary)]" />
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-primary)]">Residents</h4>
                      <p className="text-[11px] text-[var(--text-muted)]">Students, Rooms, Allocations & Leaves</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-lg border border-[var(--color-border)] self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleDomainLevelChange("residents", "full")}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        domainPermissions.residents.level === "full"
                          ? "bg-[var(--tenant-primary)] text-white shadow-xs"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      Full
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleDomainLevelChange("residents", "limited");
                        setExpandedDomain(expandedDomain === "residents" ? null : "residents");
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        domainPermissions.residents.level === "limited"
                          ? "bg-[var(--color-warning)] text-white shadow-xs"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      Limited
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDomainLevelChange("residents", "none")}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        domainPermissions.residents.level === "none"
                          ? "bg-[var(--color-surface-sunken)] text-[var(--text-primary)] font-semibold border border-[var(--color-border)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      None
                    </button>
                  </div>
                </div>

                {domainPermissions.residents.level === "limited" && (
                  <div className="pt-2 border-t border-[var(--color-border)] space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { key: "viewStudents", label: "View Students" },
                        { key: "createStudents", label: "Create Students" },
                        { key: "editStudents", label: "Edit Students" },
                        { key: "bulkImport", label: "Bulk Import" },
                        { key: "roomAllocation", label: "Room Allocation" },
                        { key: "leaveReview", label: "Leave Review" },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-1.5 p-1.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-xs cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={domainPermissions.residents.custom?.[item.key as keyof typeof domainPermissions.residents.custom] ?? false}
                            onChange={() => handleCustomCapabilityToggle("residents", item.key)}
                            className="rounded text-[var(--tenant-primary)]"
                          />
                          <span className="text-[11px] text-[var(--text-primary)]">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Operations */}
              <div className="p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <DoorOpen className="w-4 h-4 text-amber-500" />
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-primary)]">Operations</h4>
                      <p className="text-[11px] text-[var(--text-muted)]">Attendance, Outings, Gate Pass & Discipline</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-lg border border-[var(--color-border)] self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleDomainLevelChange("operations", "full")}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        domainPermissions.operations.level === "full"
                          ? "bg-[var(--tenant-primary)] text-white shadow-xs"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      Full
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleDomainLevelChange("operations", "limited");
                        setExpandedDomain(expandedDomain === "operations" ? null : "operations");
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        domainPermissions.operations.level === "limited"
                          ? "bg-[var(--color-warning)] text-white shadow-xs"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      Limited
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDomainLevelChange("operations", "none")}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        domainPermissions.operations.level === "none"
                          ? "bg-[var(--color-surface-sunken)] text-[var(--text-primary)] font-semibold border border-[var(--color-border)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      None
                    </button>
                  </div>
                </div>

                {domainPermissions.operations.level === "limited" && (
                  <div className="pt-2 border-t border-[var(--color-border)] space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { key: "gateScanner", label: "Gate Scanner" },
                        { key: "attendanceMarking", label: "Mess Attendance" },
                        { key: "outingsLog", label: "Outings Log" },
                        { key: "disciplineFlags", label: "Discipline Flags" },
                        { key: "leaveApproval", label: "Leave Approval" },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-1.5 p-1.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-xs cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={domainPermissions.operations.custom?.[item.key as keyof typeof domainPermissions.operations.custom] ?? false}
                            onChange={() => handleCustomCapabilityToggle("operations", item.key)}
                            className="rounded text-[var(--tenant-primary)]"
                          />
                          <span className="text-[11px] text-[var(--text-primary)]">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Finance */}
              <div className="p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-primary)]">Finance</h4>
                      <p className="text-[11px] text-[var(--text-muted)]">Billing, Payments & Invoices</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-lg border border-[var(--color-border)] self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleDomainLevelChange("finance", "full")}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        domainPermissions.finance.level === "full"
                          ? "bg-[var(--tenant-primary)] text-white shadow-xs"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      Full
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleDomainLevelChange("finance", "limited");
                        setExpandedDomain(expandedDomain === "finance" ? null : "finance");
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        domainPermissions.finance.level === "limited"
                          ? "bg-[var(--color-warning)] text-white shadow-xs"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      Limited
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDomainLevelChange("finance", "none")}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        domainPermissions.finance.level === "none"
                          ? "bg-[var(--color-surface-sunken)] text-[var(--text-primary)] font-semibold border border-[var(--color-border)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      None
                    </button>
                  </div>
                </div>

                {domainPermissions.finance.level === "limited" && (
                  <div className="pt-2 border-t border-[var(--color-border)] space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { key: "viewBills", label: "View Bills & Invoices" },
                        { key: "generateBills", label: "Generate Bills" },
                        { key: "recordPayments", label: "Record Payments" },
                        { key: "financialReports", label: "Financial Reports" },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-1.5 p-1.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-xs cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={domainPermissions.finance.custom?.[item.key as keyof typeof domainPermissions.finance.custom] ?? false}
                            onChange={() => handleCustomCapabilityToggle("finance", item.key)}
                            className="rounded text-[var(--tenant-primary)]"
                          />
                          <span className="text-[11px] text-[var(--text-primary)]">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save Staff Details
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
