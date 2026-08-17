import * as React from "react";
import { useEffect, useState } from "react";
import { Clock, ShieldCheck, LogOut, LogIn } from "lucide-react";
import { api } from "@/core/lib/api";
import { Badge } from "@/core/components/ui/badge";

export function StudentOutingStatusCard() {
  const [outingData, setOutingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/outings/my-status")
      .then(setOutingData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const isOut = outingData?.isCurrentlyOut;
  const lastLog = outingData?.lastLog;
  const history = outingData?.history || [];

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--tenant-primary)]" />
          <h3 className="font-h3 text-[var(--text-primary)]">Gate Pass & Outing Status</h3>
        </div>
        <Badge variant={isOut ? "warning" : "success"} dot>
          {isOut ? "Currently Outside Campus" : "Inside Campus"}
        </Badge>
      </div>

      {lastLog && (
        <div className="p-3 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-xs">
          <p className="font-semibold text-[var(--text-primary)] mb-0.5">Last Gate Activity</p>
          <p className="text-[var(--text-secondary)]">
            {lastLog.type === "out" ? "Exited Hostel Gate" : "Entered Hostel Gate"} on{" "}
            <span className="font-mono text-[var(--text-primary)]">
              {new Date(lastLog.timestamp).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>{" "}
            · Verified by {lastLog.guard?.fullName || "Security Staff"}
          </p>
        </div>
      )}

      <div>
        <h4 className="font-label text-xs text-[var(--text-primary)] mb-2">Recent Gate Movement History</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--text-muted)] font-caption uppercase text-[10px]">
                <th className="py-2 px-3">Date & Time</th>
                <th className="py-2 px-3">Movement</th>
                <th className="py-2 px-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-[var(--text-muted)] py-4">
                    No gate movement records found.
                  </td>
                </tr>
              ) : (
                history.slice(0, 5).map((log: any) => (
                  <tr key={log._id} className="hover:bg-[var(--color-surface-muted)]/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[var(--text-primary)]">
                      {new Date(log.timestamp).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={log.type === "out" ? "warning" : "success"} size="sm">
                        {log.type === "out" ? "Gate Exit (OUT)" : "Gate Entry (IN)"}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)] truncate max-w-[240px]">
                      {log.purpose || "General Movement"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
