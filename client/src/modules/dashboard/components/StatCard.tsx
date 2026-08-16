import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  icon?: React.ReactNode;
}

export function StatCard({ label, value, hint, trend, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition-all hover:border-[var(--color-border-strong)] flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <p className="font-small text-[var(--text-secondary)] font-medium truncate">{label}</p>
        {icon && <div className="text-[var(--text-muted)] h-5 w-5 shrink-0">{icon}</div>}
      </div>

      <div className="mt-3">
        <p className="font-metric text-[var(--text-primary)] tracking-tight">{value}</p>
      </div>

      {(hint || trend) && (
        <div className="mt-2 flex items-center gap-1.5 font-small text-[var(--text-muted)]">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                trend.isUp ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
              }`}
            >
              {trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}
            </span>
          )}
          {hint && <span className="truncate">{hint}</span>}
        </div>
      )}
    </div>
  );
}
