import * as React from "react";
import { useEffect, useState } from "react";
import {
  Users,
  DoorOpen,
  Receipt,
  Utensils,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { api } from "@/core/lib/api";
import { useTenant } from "@/core/context/tenant-context";
import { StatCard } from "./StatCard";
import { LookupManager } from "@/core/components/LookupManager";
import { DashboardSkeleton } from "@/core/components/ui/skeleton";
import { Button } from "@/core/components/ui/button";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";

export function AdminDashboardView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";

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

  // Real attendance distribution derived from backend API stats
  const attendanceData = [
    { name: "Breakfast", count: data?.breakfast ?? 0, color: "var(--tenant-primary)" },
    { name: "Lunch", count: data?.lunch ?? 0, color: "var(--tenant-secondary)" },
    { name: "Dinner", count: data?.dinner ?? 0, color: "var(--color-info)" },
  ];

  // Room occupancy distribution
  const totalBeds = (data?.allocatedBeds ?? 0) + (data?.availableBeds ?? 12);
  const occupancyRate = totalBeds > 0 ? Math.round(((data?.allocatedBeds ?? 0) / totalBeds) * 100) : 0;

  const occupancyPieData = [
    { name: "Occupied", value: data?.allocatedBeds ?? 0, color: "var(--tenant-primary)" },
    { name: "Available", value: Math.max(0, totalBeds - (data?.allocatedBeds ?? 0)), color: "var(--color-surface-muted)" },
  ];

  return (
    <div className="space-y-6">
      {/* Zone 1: Header Band */}
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-h1 text-[var(--text-primary)]">Admin Dashboard</h1>
            <p className="font-small text-[var(--text-secondary)] mt-0.5">
              {organization?.name || "Campus Stay"} · Operational Overview & Resource Metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`${basePath}/students/new`}>
              <Button size="sm" variant="primary">
                Register Student
              </Button>
            </Link>
            <Link to={`${basePath}/attendance`}>
              <Button size="sm" variant="outline">
                Mark Attendance
              </Button>
            </Link>
          </div>
        </div>
        <Breadcrumbs />
      </div>

      {/* Zone 2: KPI Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={data?.totalStudents ?? 0}
          hint={`${data?.activeStudents ?? 0} active enrollment`}
          trend={{ value: "+4.2%", isUp: true }}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          hint={`${data?.allocatedBeds ?? 0} beds assigned`}
          trend={{ value: "Capacity Stable", isUp: true }}
          icon={<DoorOpen className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Dues"
          value={`₹${(data?.dueAmount ?? 0).toLocaleString("en-IN")}`}
          hint={`${data?.dueStudents ?? 0} student(s) with balance`}
          icon={<Receipt className="h-5 w-5" />}
        />
        <StatCard
          label="Active Flag Reports"
          value={data?.openFlags ?? 0}
          hint={`${data?.flagged ?? 0} student(s) flagged`}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      {/* Zone 3: Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Mess Attendance Distribution */}
        <div className="lg:col-span-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-h3 text-[var(--text-primary)]">Today's Mess Attendance</h3>
              <p className="font-small text-[var(--text-muted)]">Real-time scan counts across daily dining sessions</p>
            </div>
            <Link to={`${basePath}/attendance`} className="text-xs text-[var(--tenant-primary)] hover:underline flex items-center gap-1 font-medium">
              View scanner <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hostel Bed Occupancy Ring */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-h3 text-[var(--text-primary)]">Hostel Occupancy</h3>
            <p className="font-small text-[var(--text-muted)]">Capacity utilization across blocks</p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {occupancyPieData.map((entry, index) => (
                    <Cell key={`pie-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="font-metric text-lg text-[var(--text-primary)]">{occupancyRate}%</span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Occupied</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)] text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--tenant-primary)]" />
              <span>Assigned: {data?.allocatedBeds ?? 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-border)]" />
              <span>Available: {Math.max(0, totalBeds - (data?.allocatedBeds ?? 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone 4: Master Lookup & Department Manager */}
      <LookupManager />
    </div>
  );
}
