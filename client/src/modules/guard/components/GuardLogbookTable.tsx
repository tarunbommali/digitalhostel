import React from "react";
import { LogIn, LogOut, Clock, RefreshCw, Shield } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Skeleton } from "@/core/components/ui/skeleton";
import { useGuard } from "../context/guard-context";

export const GuardLogbookTable: React.FC = () => {
  const { logbook, loadingLogbook, fetchLogbook } = useGuard();

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]/40">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[var(--tenant-primary)]" />
          <h2 className="font-semibold text-sm text-[var(--text-primary)]">
            Gate Movement Logbook
          </h2>
          {!loadingLogbook && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] rounded-full border border-[var(--tenant-primary)]/20">
              {logbook.length} Recent Records
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchLogbook()}
          className="h-8 gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingLogbook ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {loadingLogbook ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      ) : logbook.length === 0 ? (
        <div className="py-12 text-center text-xs text-[var(--text-muted)]">
          No gate movement entries recorded today.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--text-muted)] font-caption uppercase text-[10px] bg-[var(--color-surface-sunken)]/50">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Movement</th>
                <th className="py-3 px-4">Student & Reg No</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {logbook.map((entry) => {
                const isOut = entry.type === "out";
                return (
                  <tr
                    key={entry._id}
                    className="hover:bg-[var(--color-surface-sunken)]/50 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-[var(--text-muted)] font-mono text-[11px]">
                      {entry.time
                        ? new Date(entry.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "—"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge
                        variant={isOut ? "warning" : "success"}
                        size="sm"
                        className="gap-1 font-semibold"
                      >
                        {isOut ? <LogOut className="h-3 w-3" /> : <LogIn className="h-3 w-3" />}
                        {isOut ? "EXIT (OUT)" : "ENTRY (IN)"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[var(--text-primary)]">
                        {entry.student?.fullName || "Student"}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] font-mono">
                        {entry.student?.registrationNumber || entry.student?.hostelUid || "—"}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {entry.purpose || "General Outing"}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {entry.remarks || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GuardLogbookTable;
