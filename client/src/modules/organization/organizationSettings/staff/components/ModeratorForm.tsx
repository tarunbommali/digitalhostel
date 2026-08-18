import React, { useState, useEffect } from "react";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { PhoneInput } from "@/core/components/ui/phone-input";
import { Button } from "@/core/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  UserCog,
  Users,
  DoorOpen,
  CreditCard,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Save,
  UserPlus,
  Loader2,
} from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import {
  AccessLevel,
  StaffPreset,
  DomainPermissions,
  DEFAULT_DOMAIN_PERMISSIONS,
  STAFF_PRESETS,
  resolveModeratorType,
} from "../types/authorization.types";

export interface ModeratorFormValues {
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  gender: string;
  password?: string;
  moderatorType: string;
  role?: string;
}

interface ModeratorFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<ModeratorFormValues>;
  busy: boolean;
  onSubmit: (values: ModeratorFormValues) => Promise<void>;
  onCancel: () => void;
}

export function ModeratorForm({
  mode,
  initialValues,
  busy,
  onSubmit,
  onCancel,
}: ModeratorFormProps) {
  const [form, setForm] = useState<ModeratorFormValues>({
    firstName: initialValues?.firstName || "",
    lastName: initialValues?.lastName || "",
    fullName: initialValues?.fullName || "",
    email: initialValues?.email || "",
    phone: initialValues?.phone || "",
    gender: initialValues?.gender || "male",
    password: initialValues?.password || (mode === "create" ? "Password#123" : ""),
    moderatorType: initialValues?.moderatorType || "administration",
    role: initialValues?.role || "moderator",
  });

  const [countryCode, setCountryCode] = useState("+91");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [activePreset, setActivePreset] = useState<StaffPreset>(mode === "create" ? "student_admin" : "custom");
  const [domainPermissions, setDomainPermissions] = useState<DomainPermissions>(DEFAULT_DOMAIN_PERMISSIONS);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  // Sync initialValues when editing
  useEffect(() => {
    if (initialValues) {
      const rawPhone = initialValues.phone || "";
      const digitsOnly = rawPhone.replace(/\D/g, "");
      setPhoneDigits(digitsOnly.slice(-10));
      setCountryCode("+91");

      const fName = initialValues.firstName || (initialValues.fullName || "").split(" ")[0] || "";
      const lName = initialValues.lastName || (initialValues.fullName || "").split(" ").slice(1).join(" ") || "";

      setForm({
        firstName: fName,
        lastName: lName,
        fullName: initialValues.fullName || `${fName} ${lName}`.trim(),
        email: initialValues.email || "",
        phone: rawPhone,
        gender: initialValues.gender || "male",
        password: "",
        moderatorType: initialValues.moderatorType || "administration",
        role: initialValues.role || "moderator",
      });

      const matchedPreset = STAFF_PRESETS.find((p) => p.moderatorType === initialValues.moderatorType);
      if (matchedPreset) {
        setActivePreset(matchedPreset.id);
        setDomainPermissions(JSON.parse(JSON.stringify(matchedPreset.permissions)));
      } else {
        setActivePreset("custom");
      }
    }
  }, [initialValues]);

  // Apply a preset
  const handleSelectPreset = (presetId: StaffPreset) => {
    setActivePreset(presetId);
    const preset = STAFF_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setDomainPermissions(JSON.parse(JSON.stringify(preset.permissions)));
      setForm((prev) => ({
        ...prev,
        moderatorType: preset.moderatorType,
      }));
    }
  };

  // Update access level for a domain
  const handleDomainLevelChange = (
    domain: "residents" | "operations" | "finance",
    level: AccessLevel
  ) => {
    setActivePreset("custom");
    const updated: DomainPermissions = {
      ...domainPermissions,
      [domain]: {
        ...domainPermissions[domain],
        level,
      },
    };
    setDomainPermissions(updated);

    const resolved = resolveModeratorType(updated);
    setForm((prev) => ({
      ...prev,
      moderatorType: resolved,
    }));
  };

  // Toggle granular custom capability
  const handleCustomCapabilityToggle = (
    domain: "residents" | "operations" | "finance",
    key: string
  ) => {
    setActivePreset("custom");
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
    setForm((prev) => ({
      ...prev,
      moderatorType: resolved,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = phoneDigits.trim() ? `${countryCode} ${phoneDigits.trim()}` : "";
    const computedFull = `${form.firstName} ${form.lastName}`.trim() || form.fullName || "Staff Member";

    await onSubmit({
      ...form,
      fullName: computedFull,
      phone: fullPhone,
    });
  };

  return (
    <Card className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information & Credentials */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2.5">
            <UserCog className="h-4 w-4 text-[var(--tenant-primary)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Personal Information & Credentials
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--text-primary)]">First Name *</Label>
              <Input
                required
                placeholder="e.g. Ramesh"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="h-9 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--text-primary)]">Last Name *</Label>
              <Input
                required
                placeholder="e.g. Kumar"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="h-9 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--text-primary)]">Email Address *</Label>
              <Input
                required
                type="email"
                placeholder="warden@hostel.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-9 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]"
              />
            </div>
            <div className="space-y-1.5">
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
                <SelectTrigger className="h-9 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
                  <SelectItem value="male">👨 Male Warden (Boys Hostel Access)</SelectItem>
                  <SelectItem value="female">👩 Female Warden (Girls Hostel Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--text-primary)]">
                {mode === "create" ? "Default Password (Visible) *" : "New Password (Optional)"}
              </Label>
              <Input
                required={mode === "create"}
                type={mode === "create" ? "text" : "password"}
                minLength={8}
                placeholder={mode === "create" ? "Password#123" : "Leave blank to keep unchanged"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-9 text-xs font-mono bg-[var(--color-surface-sunken)] border-[var(--color-border)]"
              />
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────── */}
        {/* ACCESS & RESPONSIBILITIES SECTION */}
        {/* ──────────────────────────────────────────── */}
        <div className="pt-4 border-t border-[var(--color-border)] space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Staff Access & Responsibilities
              </h3>
              <Badge variant="neutral" size="sm" className="gap-1">
                Resolved: <span className="font-mono">{form.moderatorType || "administration"}</span>
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Choose what this staff member is responsible for. Pick a quick preset or configure access levels across Residents, Operations, and Finance.
            </p>
          </div>

          {/* Quick Setup Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Quick Setup Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {STAFF_PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[var(--tenant-primary)] bg-[var(--tenant-primary)]/10 shadow-xs"
                        : "border-[var(--color-border)] bg-[var(--color-surface-sunken)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <div>
                      <span className="text-base block mb-1">{preset.icon}</span>
                      <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">{preset.title}</p>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 truncate">{preset.subtitle}</p>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setActivePreset("custom")}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activePreset === "custom"
                    ? "border-[var(--tenant-primary)] bg-[var(--tenant-primary)]/10 shadow-xs"
                    : "border-[var(--color-border)] bg-[var(--color-surface-sunken)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                <div>
                  <SlidersHorizontal className="h-4 w-4 text-[var(--text-muted)] mb-1" />
                  <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">Custom</p>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Manual Access</p>
              </button>
            </div>
          </div>

          {/* 3 Domain Cards */}
          <div className="space-y-3 pt-2">
            {/* 1. 👥 Residents Domain */}
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] grid place-items-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text-primary)]">Residents</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Students &middot; Rooms & Beds &middot; Allocations &middot; Leaves
                    </p>
                  </div>
                </div>

                {/* Level Selector */}
                <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-lg border border-[var(--color-border)] self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleDomainLevelChange("residents", "full")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      domainPermissions.residents.level === "full"
                        ? "bg-[var(--tenant-primary)] text-white shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Full Access
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleDomainLevelChange("residents", "limited");
                      setExpandedDomain(expandedDomain === "residents" ? null : "residents");
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      domainPermissions.residents.level === "limited"
                        ? "bg-[var(--color-warning)] text-white shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Limited
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDomainLevelChange("residents", "none")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      domainPermissions.residents.level === "none"
                        ? "bg-[var(--color-surface-sunken)] text-[var(--text-primary)] font-semibold border border-[var(--color-border)] shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    No Access
                  </button>
                </div>
              </div>

              {/* Customize Expandable */}
              {domainPermissions.residents.level === "limited" && (
                <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-[var(--text-primary)]">
                    <span>Customize Resident Permissions</span>
                    <button
                      type="button"
                      onClick={() => setExpandedDomain(expandedDomain === "residents" ? null : "residents")}
                      className="text-xs text-[var(--tenant-primary)] hover:underline flex items-center gap-1"
                    >
                      {expandedDomain === "residents" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {expandedDomain === "residents" ? "Collapse" : "Expand"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {[
                      { key: "viewStudents", label: "View Student Profiles" },
                      { key: "createStudents", label: "Create / Register Students" },
                      { key: "editStudents", label: "Edit Student Records" },
                      { key: "bulkImport", label: "Bulk CSV Spreadsheet Import" },
                      { key: "roomAllocation", label: "Room & Bed Allocation" },
                      { key: "leaveReview", label: "Leave Application Review" },
                    ].map((item) => {
                      const isChecked = domainPermissions.residents.custom?.[item.key as keyof typeof domainPermissions.residents.custom] ?? false;
                      return (
                        <label
                          key={item.key}
                          className="flex items-center gap-2 p-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCustomCapabilityToggle("residents", item.key)}
                            className="rounded border-[var(--color-border)] text-[var(--tenant-primary)]"
                          />
                          <span className="text-[11px] text-[var(--text-primary)] leading-tight">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. ⚙ Operations Domain */}
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 grid place-items-center shrink-0">
                    <DoorOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text-primary)]">Operations</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Attendance &middot; Outings &middot; Gate Pass &middot; Discipline
                    </p>
                  </div>
                </div>

                {/* Level Selector */}
                <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-lg border border-[var(--color-border)] self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleDomainLevelChange("operations", "full")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      domainPermissions.operations.level === "full"
                        ? "bg-[var(--tenant-primary)] text-white shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Full Access
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleDomainLevelChange("operations", "limited");
                      setExpandedDomain(expandedDomain === "operations" ? null : "operations");
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      domainPermissions.operations.level === "limited"
                        ? "bg-[var(--color-warning)] text-white shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Limited
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDomainLevelChange("operations", "none")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      domainPermissions.operations.level === "none"
                        ? "bg-[var(--color-surface-sunken)] text-[var(--text-primary)] font-semibold border border-[var(--color-border)] shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    No Access
                  </button>
                </div>
              </div>

              {/* Customize Expandable */}
              {domainPermissions.operations.level === "limited" && (
                <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-[var(--text-primary)]">
                    <span>Customize Operations Permissions</span>
                    <button
                      type="button"
                      onClick={() => setExpandedDomain(expandedDomain === "operations" ? null : "operations")}
                      className="text-xs text-[var(--tenant-primary)] hover:underline flex items-center gap-1"
                    >
                      {expandedDomain === "operations" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {expandedDomain === "operations" ? "Collapse" : "Expand"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {[
                      { key: "gateScanner", label: "Gate Scanner & Outpass Check-in/out" },
                      { key: "attendanceMarking", label: "Mess Meal Attendance Marking" },
                      { key: "outingsLog", label: "View Outings & Gate Movement Log" },
                      { key: "disciplineFlags", label: "Discipline Flags & Incident Reports" },
                      { key: "leaveApproval", label: "Approve / Reject Leaves" },
                    ].map((item) => {
                      const isChecked = domainPermissions.operations.custom?.[item.key as keyof typeof domainPermissions.operations.custom] ?? false;
                      return (
                        <label
                          key={item.key}
                          className="flex items-center gap-2 p-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCustomCapabilityToggle("operations", item.key)}
                            className="rounded border-[var(--color-border)] text-[var(--tenant-primary)]"
                          />
                          <span className="text-[11px] text-[var(--text-primary)] leading-tight">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. 💳 Finance Domain */}
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 grid place-items-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text-primary)]">Finance</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Billing &middot; Fee Payments &middot; Financial Records
                    </p>
                  </div>
                </div>

                {/* Level Selector */}
                <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-lg border border-[var(--color-border)] self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleDomainLevelChange("finance", "full")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      domainPermissions.finance.level === "full"
                        ? "bg-[var(--tenant-primary)] text-white shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Full Access
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleDomainLevelChange("finance", "limited");
                      setExpandedDomain(expandedDomain === "finance" ? null : "finance");
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      domainPermissions.finance.level === "limited"
                        ? "bg-[var(--color-warning)] text-white shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Limited
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDomainLevelChange("finance", "none")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      domainPermissions.finance.level === "none"
                        ? "bg-[var(--color-surface-sunken)] text-[var(--text-primary)] font-semibold border border-[var(--color-border)] shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    No Access
                  </button>
                </div>
              </div>

              {/* Customize Expandable */}
              {domainPermissions.finance.level === "limited" && (
                <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-[var(--text-primary)]">
                    <span>Customize Finance Permissions</span>
                    <button
                      type="button"
                      onClick={() => setExpandedDomain(expandedDomain === "finance" ? null : "finance")}
                      className="text-xs text-[var(--tenant-primary)] hover:underline flex items-center gap-1"
                    >
                      {expandedDomain === "finance" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {expandedDomain === "finance" ? "Collapse" : "Expand"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {[
                      { key: "viewBills", label: "View Student Invoices & Bills" },
                      { key: "generateBills", label: "Generate Monthly Batch Bills" },
                      { key: "recordPayments", label: "Record Cash / SBI Collect Payments" },
                      { key: "financialReports", label: "Export Financial Reports" },
                    ].map((item) => {
                      const isChecked = domainPermissions.finance.custom?.[item.key as keyof typeof domainPermissions.finance.custom] ?? false;
                      return (
                        <label
                          key={item.key}
                          className="flex items-center gap-2 p-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCustomCapabilityToggle("finance", item.key)}
                            className="rounded border-[var(--color-border)] text-[var(--tenant-primary)]"
                          />
                          <span className="text-[11px] text-[var(--text-primary)] leading-tight">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--color-border)]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={busy}
            className="text-xs gap-1.5"
          >
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {!busy && (mode === "create" ? <UserPlus className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />)}
            {busy
              ? mode === "create"
                ? "Creating Account..."
                : "Saving Changes..."
              : mode === "create"
              ? "Create Staff Account"
              : "Save Staff Details"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default ModeratorForm;
