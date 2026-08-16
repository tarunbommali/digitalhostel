import * as React from "react";
import { useEffect, useState } from "react";
import { Users, CalendarCheck, Calendar, AlertTriangle } from "lucide-react";
import { api } from "@/core/lib/api";
import { StatCard } from "./StatCard";
import { DashboardSkeleton } from "@/core/components/ui/skeleton";

export function ModeratorDashboardView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/stats/dashboard")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="font-h1 text-[var(--text-primary)]">Staff & Warden Portal</h1>
        <p className="font-small text-[var(--text-secondary)] mt-0.5">
          Mess attendance supervision, leave pass processing, and discipline oversight
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Students"
          value={data?.students ?? 0}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Today's Meal Scans"
          value={(data?.breakfast ?? 0) + (data?.lunch ?? 0) + (data?.dinner ?? 0)}
          hint={`B: ${data?.breakfast ?? 0} · L: ${data?.lunch ?? 0} · D: ${data?.dinner ?? 0}`}
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Leave Passes"
          value={data?.pendingLeaves ?? 0}
          hint={data?.pendingLeaves > 0 ? "Awaiting Review" : "All Processed"}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          label="Active Disciplinary Flags"
          value={data?.openFlags ?? 0}
          hint={data?.openFlags > 0 ? "Action Required" : "No Open Incidents"}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}
