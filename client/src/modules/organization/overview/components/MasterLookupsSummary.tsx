import React from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, GraduationCap, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { useHostelLookups } from "@/core/hooks/use-hostel-lookups";

export function MasterLookupsSummary() {
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";
  const { blocks, departments, academicYears, loading } = useHostelLookups();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-h3 text-sm font-semibold text-[var(--text-primary)]">
            Hostel & Academic Setup
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Active structural blocks, academic departments, and enrollment batches
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Card 1: Hostel Blocks */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] grid place-items-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-medium text-xs text-[var(--text-primary)]">
                  Hostel Blocks ({blocks.length})
                </span>
              </div>
              <Link
                to={`${basePath}/hostel-setup`}
                className="text-xs text-[var(--tenant-primary)] hover:underline flex items-center gap-0.5 font-medium"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {loading ? (
                <p className="text-xs text-[var(--text-muted)] italic py-2">Loading blocks…</p>
              ) : blocks.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-[var(--text-muted)] italic">No hostel blocks added yet.</p>
                  <Link
                    to={`${basePath}/hostel-setup`}
                    className="text-[11px] text-[var(--tenant-primary)] hover:underline mt-1 inline-block"
                  >
                    + Add first block
                  </Link>
                </div>
              ) : (
                blocks.map((b: any) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-[var(--text-primary)] truncate">{b.name}</p>
                      {b.code && (
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">{b.code}</p>
                      )}
                    </div>
                    <Badge variant="neutral" size="sm" className="capitalize text-[10px] shrink-0">
                      {b.gender || "boys"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Departments */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] grid place-items-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-medium text-xs text-[var(--text-primary)]">
                  Departments ({departments.length})
                </span>
              </div>
              <Link
                to={`${basePath}/academic-setup`}
                className="text-xs text-[var(--tenant-primary)] hover:underline flex items-center gap-0.5 font-medium"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {loading ? (
                <p className="text-xs text-[var(--text-muted)] italic py-2">Loading departments…</p>
              ) : departments.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-[var(--text-muted)] italic">No departments added yet.</p>
                  <Link
                    to={`${basePath}/academic-setup`}
                    className="text-[11px] text-[var(--tenant-primary)] hover:underline mt-1 inline-block"
                  >
                    + Add first department
                  </Link>
                </div>
              ) : (
                departments.map((d: any) => (
                  <div
                    key={d._id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-xs"
                  >
                    <span className="font-medium text-[var(--text-primary)] truncate">{d.name}</span>
                    {d.code && (
                      <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase shrink-0">
                        {d.code}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Academic Batches */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] grid place-items-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="font-medium text-xs text-[var(--text-primary)]">
                  Academic Batches ({academicYears.length})
                </span>
              </div>
              <Link
                to={`${basePath}/academic-setup`}
                className="text-xs text-[var(--tenant-primary)] hover:underline flex items-center gap-0.5 font-medium"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {loading ? (
                <p className="text-xs text-[var(--text-muted)] italic py-2">Loading batches…</p>
              ) : academicYears.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-[var(--text-muted)] italic">No batches added yet.</p>
                  <Link
                    to={`${basePath}/academic-setup`}
                    className="text-[11px] text-[var(--tenant-primary)] hover:underline mt-1 inline-block"
                  >
                    + Add first batch
                  </Link>
                </div>
              ) : (
                academicYears.map((y: any) => (
                  <div
                    key={y._id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-xs"
                  >
                    <span className="font-medium text-[var(--text-primary)] truncate">{y.name}</span>
                    <Badge
                      variant={y.isCompleted ? "neutral" : "success"}
                      size="sm"
                      className="text-[10px] shrink-0"
                    >
                      {y.isCompleted ? "Completed" : "Active"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasterLookupsSummary;
