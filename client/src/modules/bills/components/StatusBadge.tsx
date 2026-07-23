import { Badge } from "@/core/components/ui/badge";

export function StatusBadge({ s }: { s: string }) {
  const v =
    s === "paid"
      ? "default"
      : s === "partially_paid"
      ? "secondary"
      : "destructive";
  return (
    <Badge variant={v as any} className="capitalize">
      {s.replace("_", " ")}
    </Badge>
  );
}
