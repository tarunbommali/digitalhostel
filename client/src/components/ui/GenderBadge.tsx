import { Badge } from "@/core/components/ui/badge";
import { cn } from "@/core/lib/utils";

interface GenderBadgeProps {
  gender: string;
  className?: string;
}

export function GenderBadge({ gender, className }: GenderBadgeProps) {
  const g = (gender || "boys").toLowerCase();

  let label = "Boys";
  if (g === "girls" || g === "female") {
    label = "Girls";
  } else if (g === "co-ed" || g === "coed" || g === "all") {
    label = "Co-Ed";
  }

  return (
    <Badge variant="outline" className={cn("capitalize text-xs font-normal", className)}>
      {label} Hostel
    </Badge>
  );
}

export default GenderBadge;
