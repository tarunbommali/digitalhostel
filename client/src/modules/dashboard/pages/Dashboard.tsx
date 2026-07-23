import { useEffect, useState } from "react";
import { api } from "@/core/lib/api";
import { useAuth } from "@/core/context/auth-context";
import { StatCard } from "../components/StatCard";
import { AdminDashboardView } from "../components/AdminDashboardView";
import { ModeratorDashboardView } from "../components/ModeratorDashboardView";
import { StudentProfileCard } from "../components/StudentProfileCard";
import { DigitalIdCard } from "../components/DigitalIdCard";
import { ChangePasswordCard } from "../components/ChangePasswordCard";
import { Skeleton } from "@/core/components/ui/skeleton";

function StudentDashboard() {
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
        <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const s = data?.stu;
  const bed = data?.bed;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {s?.fullName || "Student"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Student Portal · Digital Pass & Account Overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Mess Monthly Dues"
          value={`₹ ${data?.totalDue?.toLocaleString("en-IN") ?? 0}`}
          hint={data?.totalDue > 0 ? "Pending Payment" : "All Clear"}
        />
        <StatCard
          label="Total Paid"
          value={`₹ ${data?.totalPaid?.toLocaleString("en-IN") ?? 0}`}
        />
        <StatCard
          label="Active Disciplinary Flags"
          value={data?.activeFlags ?? 0}
          hint={data?.activeFlags > 0 ? "Under Review" : "No Flag Reports"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StudentProfileCard s={s} bed={bed} />
        </div>
        <div>
          <DigitalIdCard s={s} />
        </div>
      </div>

      <ChangePasswordCard />
    </div>
  );
}

export function Dashboard() {
  const { role } = useAuth();
  if (role === "admin") return <AdminDashboardView />;
  if (role === "moderator") return <ModeratorDashboardView />;
  return <StudentDashboard />;
}

export default Dashboard;
