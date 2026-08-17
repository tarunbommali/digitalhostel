import * as React from "react";
import { Lock, Sparkles } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import {
  PlanFeatureKey,
  getRequiredPlanForFeature,
  FEATURE_METADATA,
} from "@/core/config/plans";
import { usePlanFeature } from "@/core/hooks/usePlanFeature";
import { PlanLockedPage } from "./PlanLockedPage";

interface PlanGateProps {
  featureKey: PlanFeatureKey;
  children: React.ReactNode;
  mode?: "page" | "inline" | "hide" | "badge";
  fallback?: React.ReactNode;
  title?: string;
  description?: string;
}

export function PlanGate({
  featureKey,
  children,
  mode = "inline",
  fallback,
  title,
  description,
}: PlanGateProps) {
  const { isAllowed, requiredPlan } = usePlanFeature(featureKey);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (mode === "hide") {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (mode === "page") {
    return (
      <PlanLockedPage
        featureKey={featureKey}
        customTitle={title}
        customDescription={description}
      />
    );
  }

  if (mode === "badge") {
    return (
      <div className="inline-flex items-center gap-1.5 opacity-60 pointer-events-none cursor-not-allowed">
        {children}
        <Badge variant={requiredPlan === "ENTERPRISE" ? "enterprise" : "pro"} size="sm">
          <Lock className="w-3 h-3 mr-1" />
          {requiredPlan}
        </Badge>
      </div>
    );
  }

  // Default "inline" locked container
  const meta = FEATURE_METADATA[featureKey];
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-sunken)]/40 p-6 text-center space-y-3">
      <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 grid place-items-center mx-auto">
        <Lock className="w-4 h-4" />
      </div>
      <div className="space-y-1 max-w-md mx-auto">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">
          {title || meta?.title || "Feature Locked"}
        </h4>
        <p className="text-[11px] text-[var(--text-muted)]">
          {description ||
            meta?.description ||
            `This capability is available exclusively on the ${requiredPlan} tier.`}
        </p>
      </div>
      <div className="pt-1">
        <Badge variant={requiredPlan === "ENTERPRISE" ? "enterprise" : "pro"} size="sm">
          Requires {requiredPlan} Plan
        </Badge>
      </div>
    </div>
  );
}

export default PlanGate;
