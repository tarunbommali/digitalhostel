import * as React from "react";
import { useState, useEffect } from "react";
import { Sliders, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/core/components/ui/button";
import { LookupManager } from "@/core/components/LookupManager";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";

export function SettingsPage() {
  const [threshold, setThreshold] = useState(5);

  useEffect(() => {
    const saved = localStorage.getItem("flag_threshold");
    if (saved) {
      setThreshold(parseInt(saved, 10));
    }
  }, []);

  function save() {
    localStorage.setItem("flag_threshold", String(threshold));
    toast.success("System configurations saved successfully");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-h1 text-[var(--text-primary)]">System Settings</h1>
          <p className="font-small text-[var(--text-secondary)] mt-0.5">
            Manage system risk thresholds, master lookup tables, and hostel configurations
          </p>
        </div>
        <Breadcrumbs />
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[var(--tenant-primary)]" />
          <h3 className="font-h3 text-[var(--text-primary)]">Disciplinary Risk Threshold</h3>
        </div>
        <p className="font-small text-[var(--text-muted)] max-w-lg">
          Students with this count or more of open flag incidents are highlighted with high-risk priority alerts.
        </p>
        <div className="flex items-end gap-3 max-w-xs pt-1">
          <div className="flex-1">
            <label className="font-label text-[var(--text-primary)] block mb-1">
              Active Flags Limit
            </label>
            <input
              type="number"
              min={1}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
            />
          </div>
          <Button onClick={save} variant="primary" size="md">
            Save Threshold
          </Button>
        </div>
      </div>

      <div className="pt-2">
        <LookupManager />
      </div>
    </div>
  );
}

export default SettingsPage;
