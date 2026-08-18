import React, { useState, useEffect } from "react";
import { Layers, AlertTriangle } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Label } from "@/core/components/ui/label";
import { Badge } from "@/core/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/core/components/ui/dialog";
import { Organization, OrganizationPlan } from "../types/organization.types";
import { toast } from "sonner";
import { api } from "@/core/lib/api";
import { useSuperAdmin } from "../context/super-admin-context";

interface ChangePlanModalProps {
  organization: Organization | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const PLAN_HIERARCHY: Record<OrganizationPlan, number> = {
  basic: 1,
  pro: 2,
  enterprise: 3,
};

export const ChangePlanModal: React.FC<ChangePlanModalProps> = ({
  organization,
  onClose,
  onSuccess,
}) => {
  const { updateOrganizationInState } = useSuperAdmin();
  const [targetPlan, setTargetPlan] = useState<OrganizationPlan>("pro");
  const [targetStatus, setTargetStatus] = useState<string>("active");
  const [savingPlan, setSavingPlan] = useState(false);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);

  const currentPlan = (organization?.plan || "pro").toLowerCase() as OrganizationPlan;
  const isDowngrade = organization ? PLAN_HIERARCHY[targetPlan] < PLAN_HIERARCHY[currentPlan] : false;

  useEffect(() => {
    if (organization) {
      const p = (organization.plan || "pro").toLowerCase() as OrganizationPlan;
      setTargetPlan(p);
      setTargetStatus((organization.subscriptionStatus || "active").toLowerCase());
      setShowDowngradeWarning(false);
    }
  }, [organization]);

  if (!organization) return null;

  const handleApplyPlan = async () => {
    setSavingPlan(true);
    try {
      await api.patch(`/super-admin/organizations/${organization._id}`, {
        plan: targetPlan.toUpperCase(),
        subscriptionStatus: targetStatus,
      });
      updateOrganizationInState(organization._id, {
        plan: targetPlan,
        subscriptionStatus: targetStatus as any,
      });
      toast.success(`Plan updated to ${targetPlan.toUpperCase()} for ${organization.name}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update organization plan");
    } finally {
      setSavingPlan(false);
      setShowDowngradeWarning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDowngrade && !showDowngradeWarning) {
      setShowDowngradeWarning(true);
      return;
    }
    handleApplyPlan();
  };

  return (
    <Dialog open={Boolean(organization)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--tenant-primary)] flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-h3 text-base text-[var(--text-primary)]">
                Manage Organization Plan
              </DialogTitle>
              <DialogDescription className="font-small text-xs text-[var(--text-muted)]">
                {organization.name} ({organization.slug})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {showDowngradeWarning ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Plan Downgrade</span>
              </div>
              <p className="text-[var(--text-secondary)]">
                You are downgrading <strong>{organization.name}</strong> from{" "}
                <span className="font-semibold uppercase">{currentPlan}</span> to{" "}
                <span className="font-semibold uppercase">{targetPlan}</span>.
              </p>
              <p className="text-[var(--text-secondary)]">
                Downgrading may disable tenant capabilities such as Monthly Billing, CSV Bulk Import, Online Payments, and Custom Branding if they are outside the {targetPlan.toUpperCase()} tier.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDowngradeWarning(false)}
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                loading={savingPlan}
                onClick={handleApplyPlan}
              >
                Confirm & Apply Downgrade
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-label text-xs text-[var(--text-primary)]">Subscription Plan Tier</Label>
              <select
                value={targetPlan}
                onChange={(e) => setTargetPlan(e.target.value as OrganizationPlan)}
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[var(--text-primary)] text-xs px-3 focus:outline-none focus:border-[var(--tenant-primary)]"
              >
                <option value="basic">Basic Tier (Single Block, 500 Students, 2 Staff)</option>
                <option value="pro">Pro Tier (Multi-Block, 1000 Students, 10 Staff, Billing, Discipline, Bulk Import)</option>
                <option value="enterprise">Enterprise Tier (Full Campus, Unlimited, SSO, API, Custom Domains)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-label text-xs text-[var(--text-primary)]">Subscription Status</Label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[var(--text-primary)] text-xs px-3 focus:outline-none focus:border-[var(--tenant-primary)]"
              >
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="inactive">Inactive</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Plan Highlights Preview */}
            <div className="p-3.5 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-xs space-y-2">
              <div className="font-semibold text-[var(--text-primary)] flex items-center justify-between">
                <span>Plan Capabilities:</span>
                <Badge
                  variant={targetPlan === "enterprise" ? "enterprise" : targetPlan === "pro" ? "pro" : "basic"}
                  size="sm"
                >
                  {targetPlan.toUpperCase()}
                </Badge>
              </div>
              <ul className="text-[11px] text-[var(--text-secondary)] space-y-1">
                <li>• Max Students: <strong>{targetPlan === "enterprise" ? "Unlimited" : targetPlan === "pro" ? "1,000" : "500"}</strong></li>
                <li>• Max Moderator/Staff Seats: <strong>{targetPlan === "enterprise" ? "Unlimited" : targetPlan === "pro" ? "10" : "2"}</strong></li>
                <li>• Hostel Blocks: <strong>{targetPlan === "basic" ? "1 Block" : "Unlimited"}</strong></li>
                <li>• Monthly Billing & Online Payments: <strong>{targetPlan === "basic" ? "❌ Disabled" : "✅ Enabled"}</strong></li>
                <li>• Discipline Flags & Incident Workflows: <strong>{targetPlan === "basic" ? "❌ Disabled" : "✅ Enabled"}</strong></li>
                <li>• CSV Bulk Import: <strong>{targetPlan === "basic" ? "❌ Disabled" : "✅ Enabled"}</strong></li>
                <li>• Custom Tenant Branding: <strong>{targetPlan === "basic" ? "❌ Disabled" : "✅ Enabled"}</strong></li>
              </ul>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-[var(--color-border)]">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={savingPlan}>
                Save & Apply Plan
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChangePlanModal;
