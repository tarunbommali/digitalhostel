import { useEffect, useState } from "react";
import { api } from "@/core/lib/api";
import { Skeleton } from "@/core/components/ui/skeleton";
import { StatCard } from "./StatCard";

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
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Moderator Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff / Warden Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Attendance tracking and discipline management
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Students" value={data?.students ?? 0} />
        <StatCard label="Breakfast Today" value={data?.breakfast ?? 0} />
        <StatCard label="Lunch Today" value={data?.lunch ?? 0} />
        <StatCard label="Dinner Today" value={data?.dinner ?? 0} />
        <StatCard label="Pending Leaves" value={data?.pendingLeaves ?? 0} />
        <StatCard label="Open Flag Reports" value={data?.openFlags ?? 0} />
      </div>
    </div>
  );
}
