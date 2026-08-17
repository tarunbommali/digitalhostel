import React from "react";
import { Building2, CheckCircle2, Users, Layers } from "lucide-react";
import { KPIMetrics } from "../types/organization.types";

interface KPICardsProps {
  kpis: KPIMetrics;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Hostels */}
      <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 shadow-xs flex items-center justify-between">
        <div>
          <p className="font-caption text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">
            Total Hostels
          </p>
          <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1">
            {kpis.total}
          </h3>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Registered Workspaces</p>
        </div>
        <div className="h-10 w-10 rounded-lg bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] grid place-items-center">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      {/* Active Tenants */}
      <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 shadow-xs flex items-center justify-between">
        <div>
          <p className="font-caption text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">
            Active Tenants
          </p>
          <h3 className="font-display text-2xl font-bold text-[var(--color-success)] mt-1">
            {kpis.active}
          </h3>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {kpis.total > 0 ? `${Math.round((kpis.active / kpis.total) * 100)}% active rate` : "No tenants"}
          </p>
        </div>
        <div className="h-10 w-10 rounded-lg bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)] grid place-items-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Platform Users */}
      <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 shadow-xs flex items-center justify-between">
        <div>
          <p className="font-caption text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">
            Platform Users
          </p>
          <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1">
            {kpis.totalUsers}
          </h3>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Admins & Residents</p>
        </div>
        <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 grid place-items-center">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Tier Breakdown */}
      <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 shadow-xs flex items-center justify-between">
        <div>
          <p className="font-caption text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">
            Tier Breakdown
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-600 text-white">
              {kpis.enterpriseCount} Ent
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/30">
              {kpis.proCount} Pro
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] text-[var(--text-muted)] border border-[var(--color-border)]">
              {kpis.basicCount} Basic
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Tier Distribution</p>
        </div>
        <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 grid place-items-center">
          <Layers className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default KPICards;
