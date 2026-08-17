import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { Badge } from "@/core/components/ui/badge";

export interface PlanFeature {
  label: string;
  values: [string | boolean, string | boolean, string | boolean]; // basic, pro, enterprise
}

export interface FeatureSection {
  title: string;
  features: PlanFeature[];
}

export const FEATURE_SECTIONS: FeatureSection[] = [
  {
    title: "Core",
    features: [
      { label: "Max students", values: ["500", "1,000", "Unlimited"] },
      { label: "Max moderator/staff seats", values: ["2", "10", "Unlimited"] },
      { label: "Hostel blocks", values: ["1", "Unlimited", "Unlimited"] },
      { label: "Academic years / departments", values: [true, true, true] },
    ],
  },
  {
    title: "Student Management",
    features: [
      { label: "Student directory & profiles", values: [true, true, true] },
      { label: "Bulk import (CSV)", values: [false, true, true] },
      { label: "Digital ID card / QR", values: [true, true, true] },
    ],
  },
  {
    title: "Rooms & Allocation",
    features: [
      { label: "Room & bed management", values: [true, true, true] },
      { label: "Bed transfer/reassignment", values: [true, true, true] },
      { label: "Multi-floor/multi-block visual map", values: [false, true, true] },
    ],
  },
  {
    title: "Attendance",
    features: [
      { label: "Mess attendance (QR scan)", values: [true, true, true] },
      { label: "Attendance reports/export", values: ["Basic", "Advanced", "Advanced + custom"] },
    ],
  },
  {
    title: "Outings / Gate Pass",
    features: [
      { label: "Gate scanner (scan in/out)", values: [true, true, true] },
      { label: "Overdue return alerts", values: [false, true, true] },
    ],
  },
  {
    title: "Leaves",
    features: [
      { label: "Leave request & approval workflow", values: [true, true, true] },
      { label: "Rebate calculation", values: [false, true, true] },
    ],
  },
  {
    title: "Billing & Payments",
    features: [
      { label: "Monthly billing", values: [false, true, true] },
      { label: "Online payment collection", values: [false, true, true] },
      { label: "Payment reconciliation", values: [false, true, true] },
      { label: "Custom fee structures", values: [false, false, true] },
    ],
  },
  {
    title: "Discipline",
    features: [
      { label: "Incident/flag reporting", values: [false, true, true] },
      { label: "Discipline workflow (open/review/resolve)", values: [false, true, true] },
    ],
  },
  {
    title: "Branding & Access",
    features: [
      { label: "Custom tenant branding (logo, colors)", values: [false, true, true] },
      { label: "Custom domain", values: [false, false, true] },
      { label: "SSO / OAuth login", values: [false, false, true] },
    ],
  },
  {
    title: "Reporting",
    features: [
      { label: "Standard reports", values: [true, true, true] },
      { label: "Cross-block/cross-department analytics", values: [false, true, true] },
      { label: "Custom report builder", values: [false, false, true] },
    ],
  },
  {
    title: "Platform & Ops",
    features: [
      { label: "API access", values: [false, false, true] },
      { label: "Audit log retention", values: ["7 days", "90 days", "365 days"] },
      { label: "Backup/DR SLA (RPO/RTO guarantee)", values: [false, false, true] },
      { label: "Priority support", values: [false, "Email", "Email + phone, dedicated"] },
      { label: "Uptime SLA", values: [false, false, "99.9%"] },
    ],
  },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <div className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)] mx-auto">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      </div>
    ) : (
      <Minus className="h-3.5 w-3.5 text-[var(--text-muted)] mx-auto opacity-40" />
    );
  }

  return (
    <span className="font-medium text-xs text-[var(--text-primary)]">
      {value}
    </span>
  );
}

export function PricingComparison({ className }: { className?: string }) {
  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]/60">
              <th className="px-4 py-4 text-sm font-semibold text-[var(--text-primary)] w-2/5">
                Features & Capabilities
              </th>
              <th className="px-4 py-4 text-center w-1/5">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[var(--text-primary)]">Basic</div>
                  <Badge variant="basic" size="sm">Single Block</Badge>
                </div>
              </th>
              <th className="px-4 py-4 text-center w-1/5 bg-[var(--tenant-primary)]/5 border-x border-[var(--color-border)]">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[var(--tenant-primary)]">Pro</div>
                  <Badge variant="pro" size="sm">Multi-Block</Badge>
                </div>
              </th>
              <th className="px-4 py-4 text-center w-1/5">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[var(--text-primary)]">Enterprise</div>
                  <Badge variant="enterprise" size="sm">Full Campus</Badge>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_SECTIONS.map((section) => (
              <React.Fragment key={section.title}>
                <tr className="bg-[var(--color-surface-sunken)]">
                  <td
                    colSpan={4}
                    className="text-xs font-caption uppercase tracking-wide text-[var(--text-muted)] px-4 py-2 font-semibold"
                  >
                    {section.title}
                  </td>
                </tr>
                {section.features.map((feature, i) => (
                  <tr
                    key={feature.label}
                    className={cn(
                      "border-t border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-muted)]/60",
                      i % 2 === 1 && "bg-[var(--color-surface-muted)]/40"
                    )}
                  >
                    <td className="text-sm text-[var(--text-secondary)] px-4 py-3 font-medium">
                      {feature.label}
                    </td>
                    {feature.values.map((value, j) => (
                      <td
                        key={j}
                        className={cn(
                          "text-center px-4 py-3",
                          j === 1 && "bg-[var(--tenant-primary)]/[0.02] border-x border-[var(--color-border)]/60"
                        )}
                      >
                        <FeatureValue value={value} />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PricingComparison;
