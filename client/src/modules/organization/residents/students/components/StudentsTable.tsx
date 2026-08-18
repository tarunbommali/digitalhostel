import * as React from "react";
import { Pencil, UserCheck, UserX, RefreshCw } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Skeleton } from "@/core/components/ui/skeleton";

interface StudentsTableProps {
  loading: boolean;
  students: any[];
  role: string | null;
  openEditModal: (student: any) => void;
  toggleStatus: (id: string, currentActive: boolean) => void;
  renewPass?: (id: string, name: string) => void;
}

export function StudentsTable({
  loading,
  students,
  role,
  openEditModal,
  toggleStatus,
  renewPass,
}: StudentsTableProps) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)]">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-[var(--text-muted)]">
        No matching student records found.
      </div>
    );
  }

  return (
    <>
      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider font-semibold bg-[var(--color-surface-sunken)]/60">
              <th className="py-3 px-4">Resident</th>
              <th className="py-3 px-4">UID & Reg Number</th>
              <th className="py-3 px-4">Department & Batch</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Dues Balance</th>
              {role === "admin" && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {students.map((s: any) => {
              const isActive = s.user ? s.user.isActive !== false : s.status !== "inactive";
              const hasDues = (s.dues || 0) > 0;
              const initials = (s.fullName || "Student")
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <tr key={s._id} className="hover:bg-[var(--color-surface-sunken)]/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      {s.photoUrl ? (
                        <img
                          src={s.photoUrl}
                          alt={s.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-[var(--color-border)] shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] flex items-center justify-center font-bold text-xs shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-[var(--text-primary)] leading-tight truncate">
                          {s.fullName}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-xs">
                      <span className="font-semibold text-[var(--tenant-primary)]">{s.hostelUid}</span>
                      <p className="text-[11px] text-[var(--text-secondary)]">{s.registrationNumber || "—"}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-xs text-[var(--text-primary)]">{s.department?.name ?? "—"}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{s.academicYear?.name ?? "—"}</p>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={isActive ? "success" : "danger"} size="sm" dot>
                      {isActive ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={hasDues ? "danger" : "neutral"} size="sm">
                      {hasDues ? `₹${s.dues.toLocaleString("en-IN")} Due` : "₹0 Settled"}
                    </Badge>
                  </td>
                  {role === "admin" && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {renewPass && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => renewPass(s._id, s.fullName)}
                            title="Renew Digital QR Pass"
                            className="h-7 w-7 p-0 text-[var(--tenant-primary)] hover:bg-[var(--tenant-primary)]/10"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(s)}
                          title="Edit Student Profile"
                          className="h-7 w-7 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleStatus(s._id, isActive)}
                          title={isActive ? "Disable Account" : "Enable Account"}
                          className={`h-7 w-7 p-0 ${isActive ? "text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]" : "text-[var(--color-success)] hover:bg-[var(--color-success-bg)]"}`}
                        >
                          {isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (<768px) */}
      <div className="md:hidden divide-y divide-[var(--color-border)]">
        {students.map((s: any) => {
          const isActive = s.user ? s.user.isActive !== false : s.status !== "inactive";
          const hasDues = (s.dues || 0) > 0;
          const initials = (s.fullName || "Student")
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div key={s._id} className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] flex items-center justify-center font-bold text-xs shrink-0">
                    {initials}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-xs text-[var(--text-primary)] truncate">{s.fullName}</p>
                    <p className="font-mono text-[11px] text-[var(--tenant-primary)]">UID: {s.hostelUid}</p>
                  </div>
                </div>
                <Badge variant={isActive ? "success" : "danger"} size="sm" dot>
                  {isActive ? "Active" : "Disabled"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)] bg-[var(--color-surface-sunken)]/40 p-2.5 rounded-lg border border-[var(--color-border)]">
                <div>
                  <span className="text-[var(--text-muted)] text-[11px]">Reg: </span>
                  <span className="font-mono text-[var(--text-primary)]">{s.registrationNumber || "—"}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] text-[11px]">Dept: </span>
                  <span>{s.department?.name || "—"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[var(--text-muted)] text-[11px]">Balance: </span>
                  <span className={hasDues ? "text-[var(--color-danger)] font-semibold" : "text-[var(--color-success)] font-semibold"}>
                    {hasDues ? `₹${s.dues.toLocaleString("en-IN")} Pending` : "Paid in Full"}
                  </span>
                </div>
              </div>

              {role === "admin" && (
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--color-border)]/50">
                  <Button size="sm" variant="outline" onClick={() => openEditModal(s)} className="text-xs h-7">
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={isActive ? "destructive" : "secondary"}
                    onClick={() => toggleStatus(s._id, isActive)}
                    className="text-xs h-7"
                  >
                    {isActive ? "Disable" : "Enable"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default StudentsTable;
