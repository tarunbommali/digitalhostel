import React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/core/lib/utils";

interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function EmptyState({
  message = "No items found",
  description,
  icon: Icon = Inbox,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-6 text-center text-muted-foreground", className)}>
      <Icon className="h-8 w-8 opacity-40 mb-2" />
      <p className="text-sm font-medium">{message}</p>
      {description && <p className="text-xs opacity-75 mt-0.5 max-w-xs">{description}</p>}
    </div>
  );
}

export default EmptyState;
