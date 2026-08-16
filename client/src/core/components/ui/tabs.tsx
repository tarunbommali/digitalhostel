import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "segmented" | "underline";
  }
>(({ className, variant = "segmented", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      variant === "segmented"
        ? "inline-flex h-9 items-center justify-center rounded-lg bg-[var(--color-surface-sunken)] p-1 text-[var(--text-muted)] border border-[var(--color-border)]"
        : "inline-flex h-10 items-center justify-start border-b border-[var(--color-border)] text-[var(--text-muted)] w-full gap-4",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "segmented" | "underline";
  }
>(({ className, variant = "segmented", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tenant-primary)] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
      variant === "segmented"
        ? "rounded-md data-[state=active]:bg-[var(--color-surface)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-sm"
        : "border-b-2 border-transparent pb-2 -mb-px data-[state=active]:border-[var(--tenant-primary)] data-[state=active]:text-[var(--text-primary)]",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tenant-primary)]",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
export default Tabs;
