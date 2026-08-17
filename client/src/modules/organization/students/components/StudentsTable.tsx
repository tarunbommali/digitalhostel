import * as React from "react";
import { Pencil, UserCheck, UserX, RefreshCw, Eye } from "lucide-react";
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
          <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
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
      <div className="py-12 text-center text-sm text-[var(--text-muted)]">
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
            <tr className="border-b border-[var(--color-border)] text-[var(--text-muted)] font-caption uppercase text-[10px] bg-[var(--color-surface-sunken)]/50">
              <th className="py-3 px-4">UID</th>
              <th className="py-3 px-4">Student & Email</th>
              <th className="py-3 px-4">Reg Number</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Academic Batch</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Dues Balance</th>
              {role === "admin" && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {students.map((s: any) => {
              const isActive = s.user ? s.user.isActive !== false : s.status !== "inactive";
              const hasDues = (s.dues || 0) > 0;

              return (
                <tr key={s._id} className="hover:bg-[var(--color-surface-muted)]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-[var(--tenant-primary)]">
                    {s.hostelUid}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-body-medium text-xs text-[var(--text-primary)] leading-tight">{s.fullName}</p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">{s.registrationNumber || "—"}</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{s.department?.name ?? "—"}</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{s.academicYear?.name ?? "—"}</td>
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
                            className="h-7 w-7 p-0 text-[var(--tenant-primary)]"
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
                          className={`h-7 w-7 p-0 ${isActive ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}
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

          return (
            <div key={s._id} className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body-medium text-sm text-[var(--text-primary)]">{s.fullName}</p>
                  <p className="font-mono text-xs text-[var(--tenant-primary)]">UID: {s.hostelUid}</p>
                </div>
                <Badge variant={isActive ? "success" : "danger"} size="sm" dot>
                  {isActive ? "Active" : "Disabled"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                <div>
                  <span className="text-[var(--text-muted)]">Reg: </span>
                  <span className="font-mono text-[var(--text-primary)]">{s.registrationNumber || "—"}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Dept: </span>
                  <span>{s.department?.name || "—"}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Balance: </span>
                  <span className={hasDues ? "text-[var(--color-danger)] font-medium" : "text-[var(--color-success)]"}>
                    {hasDues ? `₹${s.dues.toLocaleString("en-IN")}` : "Paid"}
                  </span>
                </div>
              </div>

              {role === "admin" && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]/50">
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
