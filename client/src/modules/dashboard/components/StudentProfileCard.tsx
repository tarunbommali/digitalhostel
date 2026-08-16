import * as React from "react";
import { User, ShieldCheck } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";

export function StudentProfileCard({ s, bed }: { s: any; bed: any }) {
  if (!s) return null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-5">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-[var(--tenant-primary)]" />
          <h3 className="font-h3 text-[var(--text-primary)]">Student Profile</h3>
        </div>
        <Badge variant={s.status === "active" ? "success" : "neutral"} dot>
          {s.status || "Active"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs">
        <div>
          <p className="font-caption uppercase text-[var(--text-muted)] font-semibold">Full Name</p>
          <p className="font-body-medium text-sm text-[var(--text-primary)] mt-0.5">{s.fullName}</p>
        </div>

        <div>
          <p className="font-caption uppercase text-[var(--text-muted)] font-semibold">Hostel UID</p>
          <p className="font-mono font-bold text-sm text-[var(--tenant-primary)] mt-0.5">{s.hostelUid}</p>
        </div>

        <div>
          <p className="font-caption uppercase text-[var(--text-muted)] font-semibold">Registration No</p>
          <p className="font-mono text-sm text-[var(--text-primary)] mt-0.5">{s.registrationNumber || "—"}</p>
        </div>

        <div>
          <p className="font-caption uppercase text-[var(--text-muted)] font-semibold">Email Address</p>
          <p className="font-body text-[var(--text-secondary)] mt-0.5 truncate">{s.email}</p>
        </div>

        <div>
          <p className="font-caption uppercase text-[var(--text-muted)] font-semibold">Phone Number</p>
          <p className="font-body text-[var(--text-secondary)] mt-0.5">{s.phone || "+91 (Not Provided)"}</p>
        </div>

        <div>
          <p className="font-caption uppercase text-[var(--text-muted)] font-semibold">Program & Batch</p>
          <p className="font-body text-[var(--text-secondary)] mt-0.5">
            {s.department?.name || "Dept"} · {s.academicYear?.name || "Batch"}
          </p>
        </div>

        <div className="sm:col-span-2 lg:col-span-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
          <div>
            <p className="font-caption uppercase text-[var(--text-muted)] font-semibold">Room & Bed Allocation</p>
            <p className="font-body-medium text-sm text-[var(--text-primary)] mt-0.5">
              {bed
                ? `${bed.rooms?.hostelBlocks?.name || "Block"} · Room ${bed.rooms?.roomNumber} (Bed ${bed.bedNumber})`
                : "No Active Bed Allocated"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
            <span>Verified Record</span>
          </div>
        </div>
      </div>
    </div>
  );
}
