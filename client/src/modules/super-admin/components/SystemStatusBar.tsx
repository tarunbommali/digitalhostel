import React from "react";
import { Activity, Database, Users, Clock } from "lucide-react";

export const SystemStatusBar: React.FC = () => {
  return (
    <div className="flex items-center gap-4 px-4 md:px-6 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]/60 backdrop-blur-xs text-[11px] text-[var(--text-muted)]">
      <div className="flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5 text-[var(--color-success)]" />
        <span>
          Platform: <strong className="text-[var(--color-success)] font-medium">Operational</strong>
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-1.5">
        <Database className="w-3.5 h-3.5 text-[var(--tenant-primary)]" />
        <span>
          Multi-Tenant DB: <strong className="text-[var(--text-primary)] font-medium">Connected</strong>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        <span>
          Uptime SLA: <strong className="text-[var(--text-primary)] font-medium">99.9%</strong>
        </span>
      </div>
      <div className="flex items-center gap-1.5 ml-auto">
        <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
        <span className="font-semibold text-[var(--color-success)]">Live Console</span>
      </div>
    </div>
  );
};

export default SystemStatusBar;
