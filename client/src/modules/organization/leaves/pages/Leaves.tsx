import * as React from "react";
import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/core/lib/api";
import { useAuth } from "@/core/context/auth-context";
import { API_ENDPOINTS } from "@/utils/constants";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/core/components/ui/dialog";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";

function StaffLeaves() {
  const { role } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Decision Dialog State
  const [activeDialog, setActiveDialog] = useState<{
    open: boolean;
    leaveId: string;
    studentName: string;
    action: "approve" | "reject";
    daysCount: number;
  }>({
    open: false,
    leaveId: "",
    studentName: "",
    action: "approve",
    daysCount: 1,
  });

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

  const handleConfirmDecision = async () => {
    const { leaveId, action } = activeDialog;
    setBusyId(leaveId);
    try {
      await api.post("/leaves/decide", { leaveId, action });
      toast.success(`Leave request ${action}d successfully`);
      setActiveDialog((prev) => ({ ...prev, open: false }));
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} leave request`);
    } finally {
      setBusyId(null);
    }
  };

  const filteredLeaves =
    statusFilter === "all" ? leaves : leaves.filter((l) => l.status === statusFilter);

  const pendingCount = leaves.filter((l) => l.status === "pending").length;
  const approvedCount = leaves.filter((l) => l.status === "approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header Band */}
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-h1 text-[var(--text-primary)]">Leave Applications</h1>
            <p className="font-small text-[var(--text-secondary)] mt-0.5">
              Process student leave passes and calculate mess rebate eligibility
            </p>
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList variant="segmented">
              <TabsTrigger value="all">All ({leaves.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Breadcrumbs />
      </div>

      {/* Leave Requests Table */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--text-muted)] font-caption uppercase text-[10px] bg-[var(--color-surface-sunken)]/50">
                <th className="py-3 px-4">Student & UID</th>
                <th className="py-3 px-4">Date Interval</th>
                <th className="py-3 px-4">Days (Inclusive)</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[var(--text-muted)]">
                    Loading leave requests…
                  </td>
                </tr>
              )}
              {!loading && filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[var(--text-muted)]">
                    No leave requests found for this filter.
                  </td>
                </tr>
              )}
              {!loading &&
                filteredLeaves.map((l: any) => {
                  const isRebateEligible = l.daysCount >= 3;
                  return (
                    <tr key={l._id} className="hover:bg-[var(--color-surface-muted)]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-body-medium text-xs text-[var(--text-primary)]">
                          {l.student?.fullName}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--tenant-primary)] mt-0.5">
                          {l.student?.hostelUid}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">
                        {new Date(l.fromDate).toLocaleDateString("en-IN", { dateStyle: "medium" })} →{" "}
                        {new Date(l.toDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[var(--text-primary)]">{l.daysCount} Days</span>
                          {isRebateEligible && (
                            <Badge variant="success" size="sm">
                              Rebate Eligible
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] max-w-xs truncate">
                        {l.reason || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            l.status === "approved"
                              ? "success"
                              : l.status === "rejected"
                              ? "danger"
                              : "warning"
                          }
                          size="sm"
                          dot
                        >
                          {l.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {l.status === "pending" && (role === "admin" || l.daysCount <= 10) ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setActiveDialog({
                                  open: true,
                                  leaveId: l._id,
                                  studentName: l.student?.fullName || "Student",
                                  action: "reject",
                                  daysCount: l.daysCount,
                                })
                              }
                              className="text-xs h-7 text-[var(--color-danger)]"
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() =>
                                setActiveDialog({
                                  open: true,
                                  leaveId: l._id,
                                  studentName: l.student?.fullName || "Student",
                                  action: "approve",
                                  daysCount: l.daysCount,
                                })
                              }
                              className="text-xs h-7 bg-[var(--color-success)] hover:bg-emerald-600"
                            >
                              Approve
                            </Button>
                          </div>
                        ) : l.status === "pending" ? (
                          <span className="text-[11px] text-[var(--text-muted)] italic">
                            Admin approval required (&gt;10d)
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--text-muted)] capitalize">
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={activeDialog.open}
        onOpenChange={(open) => setActiveDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>
              {activeDialog.action === "approve" ? "Approve Leave Pass" : "Reject Leave Pass"}
            </DialogTitle>
            <DialogDescription>
              {activeDialog.action === "approve"
                ? `Confirm approval of ${activeDialog.daysCount} days leave pass for ${activeDialog.studentName}.`
                : `Are you sure you want to reject the leave pass for ${activeDialog.studentName}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveDialog((prev) => ({ ...prev, open: false }))}
            >
              Cancel
            </Button>
            <Button
              variant={activeDialog.action === "approve" ? "primary" : "destructive"}
              size="sm"
              loading={busyId !== null}
              onClick={handleConfirmDecision}
            >
              {activeDialog.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      toast.success("Leave pass submitted successfully");
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
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-h1 text-[var(--text-primary)]">My Leave Applications</h1>
          <p className="font-small text-[var(--text-secondary)] mt-0.5">
            Apply for hostel leave passes and track Warden approvals
          </p>
        </div>
        <Breadcrumbs />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Application Form */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
          <h3 className="font-h3 text-[var(--text-primary)]">Apply for Leave</h3>
          <form onSubmit={submit} className="space-y-3 text-xs">
            <div>
              <label className="font-label text-[var(--text-primary)] block mb-1">
                From Date <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                required
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
              />
            </div>
            <div>
              <label className="font-label text-[var(--text-primary)] block mb-1">
                To Date <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                required
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
              />
            </div>
            <div>
              <label className="font-label text-[var(--text-primary)] block mb-1">
                Reason / Destination <span className="text-[var(--color-danger)]">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Reason for leave and emergency contact info"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] p-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
              />
            </div>
            <Button type="submit" variant="primary" loading={busy} className="w-full mt-2">
              Submit Leave Request
            </Button>
          </form>
        </div>

        {/* History List */}
        <div className="md:col-span-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h3 className="font-h3 text-[var(--text-primary)] mb-3">My Leave History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--text-muted)] font-caption uppercase text-[10px]">
                  <th className="py-2.5 px-3">Interval</th>
                  <th className="py-2.5 px-3">Days</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {loading && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-[var(--text-muted)]">
                      Loading history…
                    </td>
                  </tr>
                )}
                {!loading && leaves.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-[var(--text-muted)]">
                      No leave requests filed yet.
                    </td>
                  </tr>
                )}
                {!loading &&
                  leaves.map((l: any) => (
                    <tr key={l._id} className="hover:bg-[var(--color-surface-muted)]/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[var(--text-primary)]">
                        {new Date(l.fromDate).toLocaleDateString("en-IN", { dateStyle: "short" })} →{" "}
                        {new Date(l.toDate).toLocaleDateString("en-IN", { dateStyle: "short" })}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">{l.daysCount}d</td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={
                            l.status === "approved"
                              ? "success"
                              : l.status === "rejected"
                              ? "danger"
                              : "warning"
                          }
                          size="sm"
                          dot
                        >
                          {l.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-[var(--text-secondary)] truncate max-w-[180px]">
                        {l.reason}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeavesPage() {
  const { role } = useAuth();
  if (role === "student") return <StudentLeaves />;
  return <StaffLeaves />;
}

export default LeavesPage;
