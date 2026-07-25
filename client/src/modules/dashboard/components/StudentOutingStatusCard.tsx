import { useEffect, useState } from "react";
import { api } from "@/core/lib/api";
import { Card } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { LogOut, LogIn, Clock, ShieldCheck } from "lucide-react";

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
    <Card className="p-6 space-y-4 border-primary/20">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2 font-semibold text-base">
          <Clock className="h-5 w-5 text-primary" />
          <span>Outing & Gate Pass Status</span>
        </div>
        <Badge
          variant={isOut ? "destructive" : "default"}
          className={
            isOut
              ? "bg-amber-500/10 text-amber-700 border-amber-300 px-3 py-1 text-xs"
              : "bg-emerald-500/10 text-emerald-700 border-emerald-300 px-3 py-1 text-xs"
          }
        >
          {isOut ? "⚠️ CURRENTLY OUTSIDE HOSTEL" : "✅ INSIDE HOSTEL"}
        </Badge>
      </div>

      {lastLog && (
        <div className="text-xs space-y-1 bg-accent/20 p-3 rounded-lg border">
          <p className="font-semibold text-foreground">
            Last Movement Activity:
          </p>
          <p className="text-muted-foreground">
            {lastLog.type === "out" ? "Exited Hostel Gate" : "Entered Hostel Gate"} on{" "}
            <span className="font-mono font-medium text-foreground">
              {new Date(lastLog.timestamp).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>{" "}
            (Verified by {lastLog.guard?.fullName || "Security Guard"})
          </p>
        </div>
      )}

      <div>
        <h4 className="text-xs font-semibold mb-2">My Gate Entry / Exit History</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Date & Time</TableHead>
              <TableHead className="text-xs">Movement</TableHead>
              <TableHead className="text-xs">Purpose / Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-4">
                  No gate movement records found.
                </TableCell>
              </TableRow>
            )}
            {history.slice(0, 5).map((log: any) => (
              <TableRow key={log._id}>
                <TableCell className="text-xs font-mono">
                  {new Date(log.timestamp).toLocaleString("en-IN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={log.type === "out" ? "destructive" : "default"}
                    className="text-[10px] py-0 font-medium capitalize"
                  >
                    {log.type === "out" ? "OUT (Gate Exit)" : "IN (Gate Entry)"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {log.purpose || "General Gate Movement"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
