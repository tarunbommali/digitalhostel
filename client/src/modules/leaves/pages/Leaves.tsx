import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/core/context/auth-context";
import { API_ENDPOINTS } from "@/utils/constants";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function StaffLeaves() {
  const { role } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchLeaves = () => {
    setLoading(true);
    api
      .get<any[]>(API_ENDPOINTS.LEAVES)
      .then(setLeaves)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  async function handleDecide(leaveId: string, action: "approve" | "reject") {
    setBusyId(leaveId);
    try {
      await api.post("/leaves/decide", { leaveId, action });
      toast.success(`Request ${action}d`);
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.message || "Failed to process leave request");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Leave requests</h1>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading leave requests…
                </TableCell>
              </TableRow>
            )}
            {!loading && leaves.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground text-sm"
                >
                  No leave requests found.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              leaves.map((l: any) => (
                <TableRow key={l._id}>
                  <TableCell>
                    <div className="font-medium">{l.student?.fullName}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {l.student?.hostelUid}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(l.fromDate).toLocaleDateString()} →{" "}
                    {new Date(l.toDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{l.daysCount}</TableCell>
                  <TableCell className="max-w-xs text-sm text-muted-foreground">
                    {l.reason ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        l.status === "approved"
                          ? "default"
                          : l.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {l.status === "pending" &&
                    (role === "admin" || l.daysCount <= 10) ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === l._id}
                          onClick={() => handleDecide(l._id, "reject")}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          disabled={busyId === l._id}
                          onClick={() => handleDecide(l._id, "approve")}
                        >
                          Approve
                        </Button>
                      </div>
                    ) : l.status === "pending" ? (
                      <span className="text-xs text-muted-foreground">
                        Admin only (&gt;10 days)
                      </span>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function StudentLeaves() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const fetchMyLeaves = () => {
    setLoading(true);
    api
      .get<any[]>("/leaves")
      .then(setLeaves)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const d1 = new Date(from);
    const d2 = new Date(to);
    const days = Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1;
    if (days < 1) {
      toast.error("Invalid date range");
      return;
    }
    setBusy(true);
    try {
      await api.post("/leaves/request", { fromDate: from, toDate: to, reason });
      toast.success("Leave submitted");
      setFrom("");
      setTo("");
      setReason("");
      fetchMyLeaves();
    } catch (err: any) {
      toast.error(err.message || "Failed to request leave");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leaves</h1>
      <Card className="p-6 max-w-2xl">
        <h2 className="font-semibold">Request leave</h2>
        <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label>From</Label>
            <Input
              type="date"
              required
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <Label>To</Label>
            <Input
              type="date"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Reason</Label>
            <Textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit
              request
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b p-4 font-medium">My requests</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading my requests…
                </TableCell>
              </TableRow>
            )}
            {!loading && leaves.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground text-sm"
                >
                  No requests yet.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              leaves.map((l) => (
                <TableRow key={l._id}>
                  <TableCell>
                    {new Date(l.fromDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(l.toDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{l.daysCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {l.reason}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        l.status === "approved"
                          ? "default"
                          : l.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {l.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export function LeavesPage() {
  const { role } = useAuth();
  return role === "student" ? <StudentLeaves /> : <StaffLeaves />;
}

export default LeavesPage;
