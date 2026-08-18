import * as React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, AlertCircle, ArrowRight } from "lucide-react";

export interface AttentionItem {
  label: string;
  count: number;
  severity: "warning" | "danger";
  href: string;
  description?: string;
}

export interface AttentionPanelProps {
  title?: string;
  items: AttentionItem[];
  className?: string;
}

export function AttentionPanel({
  title = "Needs attention",
  items,
  className = "",
}: AttentionPanelProps) {
  // Only render if items exist and at least one item has count > 0
  const activeItems = (items || []).filter((item) => item && item.count > 0);

  if (activeItems.length === 0) {
    return null;
  }

  const totalCount = activeItems.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-danger)] animate-pulse" />
          <h3 className="font-h3 text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger-border)]">
          {totalCount} {totalCount === 1 ? "action item" : "action items"}
        </span>
      </div>

      <div className="space-y-2">
        {activeItems.map((item, idx) => {
          const isDanger = item.severity === "danger";
          return (
            <Link
              key={idx}
              to={item.href}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-150 group hover:shadow-xs ${
                isDanger
                  ? "border-l-4 border-l-[var(--color-danger)] border-[var(--color-border)] bg-[var(--color-surface-sunken)]/60 hover:bg-[var(--color-surface-sunken)]"
                  : "border-l-4 border-l-[var(--color-warning)] border-[var(--color-border)] bg-[var(--color-surface-sunken)]/60 hover:bg-[var(--color-surface-sunken)]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isDanger ? (
                  <AlertCircle className="w-4 h-4 text-[var(--color-danger)] shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[var(--color-warning)] shrink-0" />
                )}
                <div className="truncate">
                  <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--tenant-primary)] transition-colors">
                    {item.count} {item.label}
                  </span>
                  {item.description && (
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-medium text-[var(--tenant-primary)] shrink-0 group-hover:translate-x-0.5 transition-transform">
                <span>Resolve</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default AttentionPanel;
