import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer rounded-md",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--tenant-primary)] text-[var(--tenant-primary-foreground)] hover:bg-[var(--tenant-primary-hover)] active:bg-[var(--tenant-primary-active)] shadow-sm focus-visible:ring-[var(--tenant-primary)]",
        primary:
          "bg-[var(--tenant-primary)] text-[var(--tenant-primary-foreground)] hover:bg-[var(--tenant-primary-hover)] active:bg-[var(--tenant-primary-active)] shadow-sm focus-visible:ring-[var(--tenant-primary)]",
        secondary:
          "bg-[var(--color-surface-muted)] text-[var(--text-primary)] hover:bg-[var(--color-border)] active:bg-[var(--color-border-strong)] border border-[var(--color-border)] shadow-sm",
        outline:
          "border border-[var(--color-border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] hover:border-[var(--color-border-strong)] active:bg-[var(--color-surface)]",
        ghost:
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] active:bg-[var(--color-surface)]",
        destructive:
          "bg-[var(--color-danger)] text-white hover:bg-red-600 active:bg-red-700 shadow-sm focus-visible:ring-red-500",
        link: "text-[var(--tenant-primary)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-9 px-4 py-2 text-sm",
        lg: "h-11 px-6 text-base font-semibold",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
