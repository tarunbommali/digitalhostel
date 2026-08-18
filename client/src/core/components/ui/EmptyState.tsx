import React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/core/lib/utils";

interface EmptyStateProps {
  message?: string;
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  message,
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  const displayTitle = title || message || "No items found";
  return (
    <div className={cn("flex flex-col items-center justify-center py-6 text-center text-muted-foreground", className)}>
      <Icon className="h-8 w-8 opacity-40 mb-2" />
      <p className="text-sm font-medium">{displayTitle}</p>
      {description && <p className="text-xs opacity-75 mt-0.5 max-w-xs">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export default EmptyState;
