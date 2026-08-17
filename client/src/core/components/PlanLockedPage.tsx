import * as React from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Mail,
  Zap,
} from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  PlanFeatureKey,
  FEATURE_METADATA,
  getRequiredPlanForFeature,
  normalizePlanTier,
} from "@/core/config/plans";
import { useTenant } from "@/core/context/tenant-context";
import { useAuth } from "@/core/context/auth-context";

interface PlanLockedPageProps {
  featureKey: PlanFeatureKey;
  customTitle?: string;
  customDescription?: string;
}

export function PlanLockedPage({
  featureKey,
  customTitle,
  customDescription,
}: PlanLockedPageProps) {
  const { organization } = useTenant();
  const { role } = useAuth();
  const meta = FEATURE_METADATA[featureKey];
  const requiredPlan = getRequiredPlanForFeature(featureKey);
  const currentPlan = normalizePlanTier(organization?.plan);

  const title = customTitle || meta?.title || "Feature Locked";
  const description =
    customDescription ||
    meta?.description ||
    `This module requires an upgrade to the ${requiredPlan} plan.`;

  const proFeatures = [
    "Up to 1,000 active students (vs 500 in Basic)",
    "Up to 10 staff / warden moderator accounts",
    "Unlimited hostel blocks & visual bed maps",
    "Automated monthly invoicing & online payment collection",
    "Discipline flags & hearing workflow management",
    "CSV bulk import for instant resident onboarding",
  ];

  const enterpriseFeatures = [
    "Unlimited students & staff accounts",
    "Custom domain, SSO, and university ERP API access",
    "Custom multi-tier fee structures & audit retention (365 days)",
    "Dedicated SLA & 24/7 priority support",
  ];

  const highlights = requiredPlan === "ENTERPRISE" ? enterpriseFeatures : proFeatures;

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Locked Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface-sunken)] to-[var(--color-surface)] border border-[var(--color-border)] p-8 md:p-10 shadow-sm text-center">
        {/* Ambient background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--tenant-primary)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>{requiredPlan} Tier Capability</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h1>

          <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>

          {/* Current vs Required Plan Badge */}
          <div className="pt-2 flex items-center justify-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)]">
              <span className="text-[var(--text-muted)]">Current Plan:</span>
              <span className="font-bold text-[var(--text-primary)]">{currentPlan}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--tenant-primary)]/10 border border-[var(--tenant-primary)]/30 text-[var(--tenant-primary)]">
              <span>Required:</span>
              <span className="font-bold">{requiredPlan} Plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Breakdown & Upgrade Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* What You Unlock Column */}
        <div className="md:col-span-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <Sparkles className="w-4 h-4 text-[var(--tenant-primary)]" />
            <span>What you unlock with the {requiredPlan} tier</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border)] text-xs text-[var(--text-secondary)]"
              >
                <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Instant activation with zero data loss</span>
            <Link
              to="/"
              className="text-[var(--tenant-primary)] hover:underline font-medium flex items-center gap-1"
            >
              <span>View full pricing comparison</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Upgrade / Contact Action Box */}
        <div className="rounded-xl bg-gradient-to-b from-[var(--tenant-primary)]/10 to-[var(--color-surface)] border border-[var(--tenant-primary)]/30 p-6 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--tenant-primary)] text-white grid place-items-center shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-h3 text-base text-[var(--text-primary)]">
              Upgrade Your Workspace
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Contact your platform Super Administrator or our team to upgrade {organization?.name || "your hostel"} instantly.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              asChild
              variant="primary"
              size="md"
              className="w-full justify-center font-semibold shadow-xs"
            >
              <a
                href={`mailto:support@campusstay.com?subject=Upgrade%20Request%20for%20${encodeURIComponent(
                  organization?.name || "Hostel"
                )}%20to%20${requiredPlan}&body=Hello%2C%20we%20would%20like%20to%20upgrade%20our%20workspace%20(${
                  organization?.slug || ""
                })%20to%20the%20${requiredPlan}%20plan.`}
              >
                <Mail className="w-4 h-4 mr-2" /> Request Tier Upgrade
              </a>
            </Button>

            {role === "admin" && (
              <p className="text-[11px] text-center text-[var(--text-muted)]">
                Admin Organization ID: <span className="font-mono">{organization?._id || "N/A"}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanLockedPage;
