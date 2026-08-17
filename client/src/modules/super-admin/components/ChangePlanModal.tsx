import React, { useState, useEffect } from "react";
import { Layers } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Label } from "@/core/components/ui/label";
import { Badge } from "@/core/components/ui/badge";
import { Organization } from "../types/organization.types";
import { toast } from "sonner";
import { api } from "@/core/lib/api";

import { useSuperAdmin } from "../context/super-admin-context";

interface ChangePlanModalProps {
  organization: Organization | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePlanModal: React.FC<ChangePlanModalProps> = ({
  organization,
  onClose,
  onSuccess,
}) => {
  const { updateOrganizationInState } = useSuperAdmin();
  const [targetPlan, setTargetPlan] = useState<string>("PRO");
  const [targetStatus, setTargetStatus] = useState<string>("active");
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    if (organization) {
      setTargetPlan((organization.plan || "PRO").toUpperCase());
      setTargetStatus((organization.subscriptionStatus || "active").toLowerCase());
    }
  }, [organization]);

  if (!organization) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlan(true);
    try {
      await api.patch(`/organizations/${organization._id}`, {
        plan: targetPlan,
        subscriptionStatus: targetStatus,
      });
      updateOrganizationInState(organization._id, {
        plan: targetPlan as any,
        subscriptionStatus: targetStatus as any,
      });
      toast.success(`Plan updated to ${targetPlan} for ${organization.name}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update organization plan");
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 md:p-8 max-w-lg w-full shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--tenant-primary)] flex items-center justify-center text-white font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-h3 text-base text-[var(--text-primary)]">Manage Organization Plan</h3>
              <p className="font-small text-xs text-[var(--text-muted)]">
                {organization.name} ({organization.slug})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg font-bold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="font-label text-xs text-[var(--text-primary)]">Subscription Plan Tier</Label>
            <select
              value={targetPlan}
              onChange={(e) => setTargetPlan(e.target.value)}
              className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[var(--text-primary)] text-xs px-3 focus:outline-none focus:border-[var(--tenant-primary)]"
            >
              <option value="BASIC">Basic Tier (Single Block, 500 Students, 2 Staff)</option>
              <option value="PRO">Pro Tier (Multi-Block, 1000 Students, 10 Staff, Billing, Discipline, Bulk Import)</option>
              <option value="ENTERPRISE">Enterprise Tier (Full Campus, Unlimited, SSO, API, Custom Domains)</option>
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
              <Badge variant={targetPlan === "ENTERPRISE" ? "enterprise" : targetPlan === "PRO" ? "pro" : "basic"} size="sm">
                {targetPlan}
              </Badge>
            </div>
            <ul className="text-[11px] text-[var(--text-secondary)] space-y-1">
              <li>• Max Students: <strong>{targetPlan === "ENTERPRISE" ? "Unlimited" : targetPlan === "PRO" ? "1,000" : "500"}</strong></li>
              <li>• Max Moderator/Staff Seats: <strong>{targetPlan === "ENTERPRISE" ? "Unlimited" : targetPlan === "PRO" ? "10" : "2"}</strong></li>
              <li>• Hostel Blocks: <strong>{targetPlan === "BASIC" ? "1 Block" : "Unlimited"}</strong></li>
              <li>• Monthly Billing & Online Payments: <strong>{targetPlan === "BASIC" ? "❌ Disabled" : "✅ Enabled"}</strong></li>
              <li>• Discipline Flags & Incident Workflows: <strong>{targetPlan === "BASIC" ? "❌ Disabled" : "✅ Enabled"}</strong></li>
              <li>• CSV Bulk Import: <strong>{targetPlan === "BASIC" ? "❌ Disabled" : "✅ Enabled"}</strong></li>
              <li>• Custom Tenant Branding: <strong>{targetPlan === "BASIC" ? "❌ Disabled" : "✅ Enabled"}</strong></li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={savingPlan}>
              Save & Apply Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePlanModal;
