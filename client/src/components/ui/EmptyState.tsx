import * as React from "react";
import { FolderOpen } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface-sunken)]/50 my-4",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--text-muted)] mb-4 border border-[var(--color-border)]">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h3 className="font-h3 text-[var(--text-primary)] mb-1">{title}</h3>
      {description && (
        <p className="font-small text-[var(--text-secondary)] max-w-sm mb-5">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
