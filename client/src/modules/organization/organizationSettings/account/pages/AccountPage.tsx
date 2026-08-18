import * as React from "react";
import { useParams, Link } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Phone,
  Building2,
  CheckCircle2,
  Users,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useAuth } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import { usePlanFeature } from "@/core/hooks/usePlanFeature";
import { Card } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";

export function AccountPage() {
  const { user, role } = useAuth();
  const { organization } = useTenant();
  const { currentPlan, getLimit } = usePlanFeature("customBranding");
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";

  const maxStudents = getLimit("maxStudents");
  const maxStaff = getLimit("maxModerators");
  const maxBlocks = getLimit("maxBlocks");

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      <PageHeader
        eyebrow="Workspace Profile"
        title="Account & Subscription"
        description="Overview of your administrative account, contact details, organization profile, and active SaaS subscription."
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Account & Subscription" },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Account Information Card */}
        <div className="space-y-6 md:col-span-1">
          <Card className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--tenant-primary)] text-white font-bold text-base grid place-items-center shadow-xs">
                {(organization?.name || user?.fullName || "H").charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                  {organization?.name || "Hostel"}
                </h3>
                <p className="text-xs text-[var(--text-muted)] truncate capitalize">
                  {role === "admin" ? "Administrator" : role ? role.replace(/_/g, " ") : "Staff"}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-[var(--color-border)] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name
                </span>
                <span className="font-medium text-[var(--text-primary)]">
                  {user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Hostel Administrator"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <span className="font-medium text-[var(--text-primary)] truncate max-w-[150px]">
                  {user?.email || "admin@hostel.edu"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </span>
                <span className="font-medium text-[var(--text-primary)]">
                  {(user as any)?.phone || (user as any)?.phoneNumber || (organization as any)?.contactPhone || (organization as any)?.phone || "+91 (Not Provided)"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Role Privilege
                </span>
                <Badge variant="brand" size="sm" className="capitalize text-[10px]">
                  {role ? role.replace(/_/g, " ") : "Admin"}
                </Badge>
              </div>
            </div>

            <div className="pt-2">
              <Link to={`${basePath}/settings/general`}>
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Organization Settings
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column: Subscription & Quota Limits */}
        <div className="space-y-6 md:col-span-2">
          {/* Active Subscription Tier Card */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] grid place-items-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-h3 text-base text-[var(--text-primary)] font-semibold">
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
                    PRO PLAN
                  </Badge>
                ) : (
                  <Badge variant="basic" size="md">
                    FREE BASIC
                  </Badge>
                )}
              </div>
            </div>

            {/* Quota Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] space-y-1">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Users className="w-3.5 h-3.5 text-[var(--tenant-primary)]" />
                  <span>Student Capacity Limit</span>
                </div>
                <p className="font-display text-lg font-bold text-[var(--text-primary)]">
                  {maxStudents === Infinity ? "Unlimited" : `${maxStudents} Residents`}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] space-y-1">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>Staff / Moderator Seats</span>
                </div>
                <p className="font-display text-lg font-bold text-[var(--text-primary)]">
                  {maxStaff === Infinity ? "Unlimited" : `${maxStaff} Staff`}
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

            {/* Plan Features Checklist */}
            <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Included Plan Capabilities
              </h4>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {[
                  "Multi-Tenant Complete Data Isolation",
                  "Gate Scanner & QR Outpass Check-in/out",
                  "Mess Meal Attendance Tracking",
                  "Automated Monthly Billing & SBI Collect Invoices",
                  "Leave Applications & Duty Warden Approvals",
                  "Disciplinary Incident Flags & Auto Risk Scoring",
                  "Non-blocking Audit Logging & Security Trail",
                  "Custom Branding & Organization Color Themes",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[11px]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
