import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, CheckCircle2, Search, User, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/core/lib/api";
import { useAuth } from "@/core/context/auth-context";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/core/components/ui/dialog";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";

const TYPES = ["discipline", "billing", "attendance", "other"] as const;

export function FlagsPage() {
  const { role } = useAuth();
  const isStaff = role === "admin" || role === "moderator";

  const [flags, setFlags] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [type, setType] = useState<(typeof TYPES)[number]>("discipline");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  // Resolve Dialog State
  const [resolveDialog, setResolveDialog] = useState<{
    open: boolean;
    flagId: string;
    studentName: string;
  }>({
    open: false,
    flagId: "",
    studentName: "",
  });
  const [resolving, setResolving] = useState(false);

  const refreshData = useCallback(() => {
    setLoading(true);
    const promises = [api.get<any>("/flags")];
    if (isStaff) {
      promises.push(api.get<any>("/students?limit=1000"));
    }

    Promise.all(promises)
      .then(([flagsData, studentsData]) => {
        setFlags(Array.isArray(flagsData) ? flagsData : flagsData?.flags || []);
        if (studentsData) {
          setStudents(Array.isArray(studentsData) ? studentsData : studentsData?.students || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isStaff]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  async function createFlag(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error("Please search and select a student first");
      return;
    }
    setBusy(true);
    try {
      await api.post("/flags", {
        studentId: selectedStudent?._id,
        flagType: type,
        description: desc,
      });
      toast.success("Disciplinary flag raised successfully");
      setDesc("");
      setSelectedStudent(null);
      setStudentSearch("");
      refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit flag");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmResolve() {
    if (!resolveDialog.flagId) return;
    setResolving(true);
    try {
      await api.put(`/flags/${resolveDialog.flagId}/resolve`);
      toast.success("Flag marked as resolved");
      setResolveDialog((prev) => ({ ...prev, open: false }));
      refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve flag");
    } finally {
      setResolving(false);
    }
  }

  // Search matches
  const searchMatches = students
    .filter((s) => {
      if (!studentSearch.trim()) return false;
      const term = studentSearch.toLowerCase();
      return (
        s.fullName?.toLowerCase().includes(term) ||
        s.hostelUid?.toLowerCase().includes(term) ||
        s.registrationNumber?.toLowerCase().includes(term)
      );
    })
    .slice(0, 5);

  const getFlagVariant = (status: string) => {
    return status === "resolved" ? "success" : "danger";
  };

  return (
    <div className="space-y-6">
      {/* Header Band */}
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-h1 text-[var(--text-primary)]">Discipline & Incident Reports</h1>
          <p className="font-small text-[var(--text-secondary)] mt-0.5">
            Student incident flags, disciplinary records, and Warden resolution tracking
          </p>
        </div>
        <Breadcrumbs />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flag Creation Form (Staff Only) */}
        {isStaff && (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[var(--color-danger)]" />
              <h3 className="font-h3 text-[var(--text-primary)]">Report Incident</h3>
            </div>

            <form onSubmit={createFlag} className="space-y-3 text-xs">
              {/* Student Search */}
              <div>
                <label className="font-label text-[var(--text-primary)] block mb-1">
                  Select Student <span className="text-[var(--color-danger)]">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    placeholder="Search name, UID, or reg no…"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] pl-9 pr-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {studentSearch && !selectedStudent && (
                  <div className="mt-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden divide-y divide-[var(--color-border)]">
                    {searchMatches.length === 0 ? (
                      <p className="p-2.5 text-center text-xs text-[var(--text-muted)]">No students found</p>
                    ) : (
                      searchMatches.map((s) => (
                        <div
                          key={s._id}
                          onClick={() => {
                            setSelectedStudent(s);
                            setStudentSearch(`${s.fullName} (${s.hostelUid})`);
                          }}
                          className="p-2.5 hover:bg-[var(--color-surface-muted)] cursor-pointer transition-colors"
                        >
                          <p className="font-body-medium text-xs text-[var(--text-primary)]">{s.fullName}</p>
                          <p className="font-mono text-[11px] text-[var(--tenant-primary)]">
                            UID: {s.hostelUid} · Reg: {s.registrationNumber || "—"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Incident Category */}
              <div>
                <label className="font-label text-[var(--text-primary)] block mb-1">Category</label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger className="h-9 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)] text-xs text-[var(--text-primary)]">
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <label className="font-label text-[var(--text-primary)] block mb-1">
                  Incident Description <span className="text-[var(--color-danger)]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the infraction, location, and timestamps…"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] p-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
                />
              </div>

              <Button type="submit" variant="destructive" loading={busy} className="w-full mt-2">
                Raise Incident Flag
              </Button>
            </form>
          </div>
        )}

        {/* Flag Reports Table */}
        <div className={`${isStaff ? "lg:col-span-2" : "col-span-3"} rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm`}>
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
            <h3 className="font-h3 text-[var(--text-primary)]">Active & Historical Flags ({flags.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--text-muted)] font-caption uppercase text-[10px]">
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  {isStaff && <th className="py-2.5 px-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[var(--text-muted)]">
                      Loading flags…
                    </td>
                  </tr>
                )}
                {!loading && flags.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[var(--text-muted)]">
                      No disciplinary flags recorded.
                    </td>
                  </tr>
                )}
                {!loading &&
                  flags.map((f: any) => (
                    <tr key={f._id} className="hover:bg-[var(--color-surface-muted)]/50 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-body-medium text-xs text-[var(--text-primary)]">{f.student?.fullName}</p>
                        <p className="font-mono text-[11px] text-[var(--tenant-primary)]">{f.student?.hostelUid}</p>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="neutral" size="sm" className="capitalize">
                          {f.flagType || "discipline"}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-[var(--text-secondary)] max-w-xs truncate">
                        {f.description}
                      </td>
                      <td className="py-3 px-3 font-mono text-[var(--text-muted)] text-[11px]">
                        {new Date(f.createdAt).toLocaleDateString("en-IN", { dateStyle: "short" })}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={getFlagVariant(f.status)} size="sm" dot>
                          {f.status}
                        </Badge>
                      </td>
                      {isStaff && (
                        <td className="py-3 px-3 text-right">
                          {f.status !== "resolved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setResolveDialog({
                                  open: true,
                                  flagId: f._id,
                                  studentName: f.student?.fullName || "Student",
                                })
                              }
                              className="text-xs h-7 text-[var(--color-success)]"
                            >
                              Resolve
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Resolve Confirmation Modal */}
      <Dialog
        open={resolveDialog.open}
        onOpenChange={(open) => setResolveDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Resolve Incident Flag</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this disciplinary incident as resolved for {resolveDialog.studentName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResolveDialog((prev) => ({ ...prev, open: false }))}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={resolving}
              onClick={handleConfirmResolve}
              className="bg-[var(--color-success)] hover:bg-emerald-600"
            >
              Confirm Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FlagsPage;
