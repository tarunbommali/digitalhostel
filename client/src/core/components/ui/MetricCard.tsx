import * as React from "react";
import { LucideIcon } from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  supportingText?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  label,
  value,
  supportingText,
  icon: Icon,
  tone = "default",
  className = "",
  onClick,
}: MetricCardProps) {
  const isClickable = Boolean(onClick);

  const toneStyles = {
    default: {
      border: "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
      iconBg: "bg-[var(--color-surface-muted)] text-[var(--text-secondary)]",
    },
    success: {
      border: "border-[var(--color-success-border)]",
      iconBg: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
    },
    warning: {
      border: "border-[var(--color-warning-border)]",
      iconBg: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
    },
    danger: {
      border: "border-[var(--color-danger-border)]",
      iconBg: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
    },
  }[tone];

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-[var(--color-surface)] p-4 sm:p-5 flex flex-col justify-between transition-all duration-150 shadow-xs ${
        toneStyles.border
      } ${
        isClickable
          ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
          : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="font-small text-xs font-medium text-[var(--text-muted)] truncate">
            {label}
          </p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {value}
          </p>
        </div>

        {Icon && (
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${toneStyles.iconBg}`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>

      {supportingText && (
        <div className="mt-3 pt-2.5 border-t border-[var(--color-border)]/60 text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
          <span>{supportingText}</span>
        </div>
      )}
    </div>
  );
}

export default MetricCard;
