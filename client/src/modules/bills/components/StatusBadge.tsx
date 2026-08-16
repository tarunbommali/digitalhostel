import * as React from "react";
import { Badge } from "@/core/components/ui/badge";

export function StatusBadge({ s }: { s: string }) {
  const variant =
    s === "paid"
      ? "success"
      : s === "partially_paid"
      ? "warning"
      : "danger";

  return (
    <Badge variant={variant} size="sm" dot>
      {s.replace("_", " ")}
    </Badge>
  );
}
