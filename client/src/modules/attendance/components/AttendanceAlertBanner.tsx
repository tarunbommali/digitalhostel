import { Button } from "@/core/components/ui/button";
import { CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { AlertState } from "../types";

interface AttendanceAlertBannerProps {
  alertState: AlertState | null;
  onDismiss: () => void;
}

export function AttendanceAlertBanner({
  alertState,
  onDismiss,
}: AttendanceAlertBannerProps) {
  if (!alertState) return null;

  return (
    <div
      className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${
        alertState.type === "success"
          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-200"
          : alertState.type === "duplicate"
          ? "bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-200"
          : "bg-destructive/15 border-destructive/40 text-destructive"
      }`}
    >
      {alertState.type === "success" ? (
        <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
      ) : alertState.type === "duplicate" ? (
        <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
      ) : (
        <ShieldAlert className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
      )}

      <div className="flex-1">
        <h3 className="font-bold text-base leading-snug">{alertState.message}</h3>
        {alertState.studentName && (
          <p className="text-sm font-semibold mt-1">
            {alertState.studentName} · Reg: {alertState.registrationNumber} (UID:{" "}
            {alertState.hostelUid})
          </p>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onDismiss}
        className="text-xs shrink-0"
      >
        Dismiss
      </Button>
    </div>
  );
}
