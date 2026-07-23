import { useEffect, useState } from "react";
import { api } from "@/core/lib/api";
import { Skeleton } from "@/core/components/ui/skeleton";
import { LookupManager } from "@/core/components/LookupManager";
import { StatCard } from "./StatCard";

export function AdminDashboardView() {
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
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          System overview and room bed management
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={data?.totalStudents ?? 0} />
        <StatCard label="Active Students" value={data?.activeStudents ?? 0} />
        <StatCard label="Beds Allocated" value={data?.allocatedBeds ?? 0} />
        <StatCard
          label="Pending Dues"
          value={`₹ ${data?.dueAmount?.toLocaleString("en-IN") ?? 0}`}
          hint={`${data?.dueStudents ?? 0} student(s) with dues`}
        />
        <StatCard label="Breakfast Today" value={data?.breakfast ?? 0} />
        <StatCard label="Lunch Today" value={data?.lunch ?? 0} />
        <StatCard label="Dinner Today" value={data?.dinner ?? 0} />
        <StatCard
          label="Active Flags"
          value={data?.openFlags ?? 0}
          hint={`${data?.flagged ?? 0} flagged student(s)`}
        />
      </div>

      <LookupManager />
    </div>
  );
}
