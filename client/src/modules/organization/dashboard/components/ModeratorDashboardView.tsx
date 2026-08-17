import * as React from "react";
import { Users, CalendarCheck, Calendar, AlertTriangle } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTenant } from "@/core/context/tenant-context";
import { StatCard } from "./StatCard";
import { DashboardSkeleton } from "@/core/components/ui/skeleton";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";
import { useDashboardStats } from "../hooks/useDashboardStats";

export function ModeratorDashboardView() {
  const { stats: data, loading } = useDashboardStats();
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Staff & Warden Portal
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] rounded-full border border-[var(--tenant-primary)]/20">
              {organization?.name || "Hostel"}
            </span>
          </div>
          <p className="font-small text-xs text-[var(--text-secondary)] mt-1">
            Mess attendance supervision, leave pass processing, and discipline oversight
          </p>
        </div>

        {/* Page-Specific Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
            { label: "Staff Portal" },
          ]}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={data?.totalStudents ?? data?.students ?? 0}
          icon={Users}
          color="var(--tenant-primary)"
        />
        <StatCard
          label="Today's Meal Scans"
          value={(data?.breakfast ?? 0) + (data?.lunch ?? 0) + (data?.dinner ?? 0)}
          hint={`B: ${data?.breakfast ?? 0} · L: ${data?.lunch ?? 0} · D: ${data?.dinner ?? 0}`}
          icon={CalendarCheck}
          color="var(--tenant-secondary)"
        />
        <StatCard
          label="Pending Leave Passes"
          value={data?.pendingLeaves ?? 0}
          hint={data?.pendingLeaves > 0 ? "Awaiting Review" : "All Processed"}
          icon={Calendar}
          color="var(--color-info)"
        />
        <StatCard
          label="Active Disciplinary Flags"
          value={data?.openFlags ?? data?.activeFlags ?? 0}
          hint={(data?.openFlags ?? data?.activeFlags ?? 0) > 0 ? "Action Required" : "No Open Incidents"}
          icon={AlertTriangle}
          color="var(--color-danger)"
        />
      </div>
    </div>
  );
}

export default ModeratorDashboardView;
