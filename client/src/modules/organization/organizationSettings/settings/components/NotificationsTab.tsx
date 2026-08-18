import React, { useState } from "react";
import { Bell, Mail, MessageSquare, ShieldAlert, Save } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Switch } from "@/core/components/ui/switch";
import { toast } from "sonner";

export function NotificationsTab() {
  const [notifySettings, setNotifySettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    parentOutingNotifications: true,
    leaveApprovalAlerts: true,
    paymentReminders: true,
    disciplineIncidentAlerts: true,
    smsSenderId: "CAMPUS",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Notification preferences saved successfully");
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs space-y-6">
        <div className="border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[var(--tenant-primary)]" />
            <h3 className="font-h3 text-base text-[var(--text-primary)]">Automated Dispatch & Alerts</h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configure automated system broadcasts, parent SMS alerts, and warden email channels.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Email Notification Channel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5 text-[var(--tenant-primary)]" />
              <span>Email Dispatch Channels</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)]">
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">System Email Broadcasts</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Send transactional emails for student onboarding, password recovery, and receipts.
                  </p>
                </div>
                <Switch
                  checked={notifySettings.emailAlerts}
                  onCheckedChange={(checked) => setNotifySettings({ ...notifySettings, emailAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)]">
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">Leave Request Warden Notifications</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Notify duty wardens when a student submits an overnight or emergency leave request.
                  </p>
                </div>
                <Switch
                  checked={notifySettings.leaveApprovalAlerts}
                  onCheckedChange={(checked) => setNotifySettings({ ...notifySettings, leaveApprovalAlerts: checked })}
                />
              </div>
            </div>
          </div>

          {/* SMS Notification Channel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>SMS Gateway & Gate Security Alerts</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)]">
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">Parent Gate Pass SMS Notifications</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Automatically dispatch an SMS to parents when security scans the student QR outpass at the main gate.
                  </p>
                </div>
                <Switch
                  checked={notifySettings.parentOutingNotifications}
                  onCheckedChange={(checked) => setNotifySettings({ ...notifySettings, parentOutingNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)]">
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">Fee Payment & Invoice Overdue Reminders</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Send monthly billing generation notices and unpaid balance reminder SMS alerts.
                  </p>
                </div>
                <Switch
                  checked={notifySettings.paymentReminders}
                  onCheckedChange={(checked) => setNotifySettings({ ...notifySettings, paymentReminders: checked })}
                />
              </div>
            </div>
          </div>

          {/* Discipline Alerts */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Disciplinary & Incident Alerts</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)]">
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">Warden Escalation for High-Risk Incidents</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Immediately alert the Chief Warden and Admin when a student exceeds the active flag threshold.
                </p>
              </div>
              <Switch
                checked={notifySettings.disciplineIncidentAlerts}
                onCheckedChange={(checked) => setNotifySettings({ ...notifySettings, disciplineIncidentAlerts: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[var(--color-border)]">
            <Button type="submit" variant="primary" size="sm" disabled={saving} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving Preferences..." : "Save Preferences"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
