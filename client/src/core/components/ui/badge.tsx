import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] border border-[var(--tenant-primary)]/25",
        secondary:
          "bg-[var(--color-surface-muted)] text-[var(--text-secondary)] border border-[var(--color-border)]",
        destructive:
          "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger-border)]",
        outline:
          "border border-[var(--color-border)] text-[var(--text-secondary)] bg-transparent",
        neutral:
          "bg-[var(--color-surface-muted)] text-[var(--text-secondary)] border border-[var(--color-border)]",
        success:
          "bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]",
        warning:
          "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)]",
        danger:
          "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger-border)]",
        info:
          "bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info-border)]",
        brand:
          "bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] border border-[var(--tenant-primary)]/25",
        enterprise:
          "bg-indigo-600 text-white font-semibold shadow-xs border border-indigo-500",
        pro:
          "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30 font-semibold",
        basic:
          "bg-[var(--color-surface-muted)] text-[var(--text-muted)] border border-[var(--color-border)]",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5 font-medium",
        md: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot = false, children, ...props }: BadgeProps) {
  const dotColorClass = {
    default: "bg-[var(--tenant-primary)]",
    secondary: "bg-[var(--text-secondary)]",
    destructive: "bg-[var(--color-danger)]",
    outline: "bg-[var(--text-secondary)]",
    neutral: "bg-[var(--text-secondary)]",
    success: "bg-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]",
    danger: "bg-[var(--color-danger)]",
    info: "bg-[var(--color-info)]",
    brand: "bg-[var(--tenant-primary)]",
    enterprise: "bg-white",
    pro: "bg-indigo-500",
    basic: "bg-[var(--text-muted)]",
  }[variant || "neutral"];

  return (
    <div className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColorClass)} />}
      {children}
    </div>
  );
}

export { badgeVariants };
export default Badge;
