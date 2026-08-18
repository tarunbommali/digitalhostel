import React, { useState } from "react";
import { ShieldCheck, KeyRound, Clock, Copy, Check, Save } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Switch } from "@/core/components/ui/switch";
import { useTenant } from "@/core/context/tenant-context";
import { toast } from "sonner";

export function SecurityTab() {
  const { organization } = useTenant();
  const [copied, setCopied] = useState(false);

  const [securitySettings, setSecuritySettings] = useState({
    enforceStrongPasswords: true,
    sessionTimeoutMinutes: 60,
    enableAuditLogging: true,
    restrictSimultaneousLogins: false,
    requireStaff2FA: false,
  });
  const [saving, setSaving] = useState(false);

  const handleCopyOrgId = () => {
    if (organization?._id) {
      navigator.clipboard.writeText(organization._id);
      setCopied(true);
      toast.success("Organization ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Security policies updated successfully");
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Organization Credentials & Tenant Identifier */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs space-y-4">
        <div className="border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[var(--tenant-primary)]" />
            <h3 className="font-h3 text-base text-[var(--text-primary)]">Tenant Identifier & API Credentials</h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Unique cryptographic organization identifier used for mobile app scanners and multi-tenant boundary checks.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Organization ObjectId
            </p>
            <p className="text-xs font-mono font-medium text-[var(--text-primary)] mt-0.5">
              {organization?._id || "Not loaded"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyOrgId}
            className="gap-1.5 text-xs shrink-0 self-start sm:self-center"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy ID"}
          </Button>
        </div>
      </div>

      {/* Security Policies */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs space-y-6">
        <div className="border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h3 className="font-h3 text-base text-[var(--text-primary)]">Access Policies & Session Controls</h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Manage authentication requirements, session expiry, and audit trails.
          </p>
        </div>

        <form onSubmit={handleSaveSecurity} className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)]">
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">Enforce Strong Password Complexity</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Require at least 8 characters with lowercase, uppercase, numeric, and special symbols.
                </p>
              </div>
              <Switch
                checked={securitySettings.enforceStrongPasswords}
                onCheckedChange={(checked) =>
                  setSecuritySettings({ ...securitySettings, enforceStrongPasswords: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)]">
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">Automated Audit Trail & Resilience</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Record all resident status updates, staff additions, and financial settlements with non-blocking write resilience.
                </p>
              </div>
              <Switch
                checked={securitySettings.enableAuditLogging}
                onCheckedChange={(checked) =>
                  setSecuritySettings({ ...securitySettings, enableAuditLogging: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)]">
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">Restrict Simultaneous Staff Sessions</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Invalidate previous active sessions when a staff member logs in from a new browser or device.
                </p>
              </div>
              <Switch
                checked={securitySettings.restrictSimultaneousLogins}
                onCheckedChange={(checked) =>
                  setSecuritySettings({ ...securitySettings, restrictSimultaneousLogins: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)]">
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">Session Idle Timeout</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Automatically sign out inactive staff portals after duration.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <select
                  value={securitySettings.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      sessionTimeoutMinutes: parseInt(e.target.value, 10),
                    })
                  }
                  className="h-8 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--tenant-primary)]"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={240}>4 Hours</option>
                  <option value={480}>8 Hours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[var(--color-border)]">
            <Button type="submit" variant="primary" size="sm" disabled={saving} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving Policies..." : "Save Policies"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
