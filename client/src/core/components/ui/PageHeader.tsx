import * as React from "react";
import { Breadcrumbs } from "./Breadcrumbs";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumbs,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`space-y-3 pb-5 border-b border-[var(--color-border)] ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--tenant-primary)] mb-1">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="font-small text-xs md:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}
    </div>
  );
}

export default PageHeader;
