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
  icon?: React.ElementType | React.ReactNode;
  color?: string;
}

export function StatCard({ label, value, hint, trend, icon, color }: StatCardProps) {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
      const IconComponent = icon as React.ElementType;
      return <IconComponent className="h-4 w-4" style={color ? { color } : undefined} />;
    }
    return icon as React.ReactNode;
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs transition-all hover:border-[var(--color-border-strong)] flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <p className="font-small text-xs text-[var(--text-secondary)] font-medium truncate">{label}</p>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-surface-sunken)]"
            style={color ? { color } : undefined}
          >
            {renderIcon()}
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="font-metric text-2xl font-bold text-[var(--text-primary)] tracking-tight">{value}</p>
      </div>

      {(hint || trend) && (
        <div className="mt-2 flex items-center gap-1.5 font-small text-xs text-[var(--text-muted)]">
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

export default StatCard;
