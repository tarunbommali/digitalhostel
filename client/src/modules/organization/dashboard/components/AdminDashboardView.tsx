import * as React from "react";
import {
  Users,
  DoorOpen,
  Receipt,
  Utensils,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  CalendarCheck,
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
import { useTenant } from "@/core/context/tenant-context";
import { StatCard } from "./StatCard";
import { LookupManager } from "@/core/components/LookupManager";
import { DashboardSkeleton } from "@/core/components/ui/skeleton";
import { Button } from "@/core/components/ui/button";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";
import { useDashboardStats } from "../hooks/useDashboardStats";

export function AdminDashboardView() {
  const { stats: data, loading } = useDashboardStats();
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";

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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Zone 1: Standard Header Band */}
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                Admin Dashboard
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] rounded-full border border-[var(--tenant-primary)]/20">
                {organization?.name || "Campus Stay"}
              </span>
            </div>
            <p className="font-small text-xs text-[var(--text-secondary)] mt-1">
              Operational overview, capacity metrics, meal attendance, and hostel lookups
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button asChild variant="outline" size="md" className="gap-1.5">
              <Link to={`${basePath}/attendance`}>
                <CalendarCheck className="w-4 h-4" />
                <span>Mark Attendance</span>
              </Link>
            </Button>
            <Button asChild variant="primary" size="md" className="gap-1.5 shadow-xs font-semibold">
              <Link to={`${basePath}/students/new`}>
                <Plus className="w-4 h-4" />
                <span>Register Student</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Page-Specific Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
            { label: "Dashboard" },
          ]}
        />
      </div>

      {/* Zone 2: KPI Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={data?.totalStudents ?? 0}
          hint={`${data?.activeStudents ?? 0} active enrollment`}
          trend={{ value: "+4.2%", isUp: true }}
          icon={Users}
          color="var(--tenant-primary)"
        />
        <StatCard
          label="Room Occupancy"
          value={`${occupancyRate}%`}
          hint={`${data?.allocatedBeds ?? 0} of ${totalBeds} beds assigned`}
          trend={{ value: `${data?.allocatedBeds ?? 0} Beds Occupied`, isUp: true }}
          icon={DoorOpen}
          color="var(--tenant-secondary)"
        />
        <StatCard
          label="Unpaid Invoices"
          value={data?.unpaidBillsCount ?? 0}
          hint={`₹${(data?.totalUnpaidAmount ?? 0).toLocaleString("en-IN")} pending collection`}
          trend={{ value: `${data?.unpaidBillsCount ?? 0} Pending`, isUp: false }}
          icon={Receipt}
          color="var(--color-danger)"
        />
        <StatCard
          label="Today's Meals Served"
          value={(data?.breakfast ?? 0) + (data?.lunch ?? 0) + (data?.dinner ?? 0)}
          hint={`${data?.lunch ?? 0} lunches recorded`}
          trend={{ value: "Live Feed", isUp: true }}
          icon={Utensils}
          color="var(--color-success)"
        />
      </div>

      {/* Zone 3: Analytics Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Sub-Zone: Meal Distribution Bar Chart */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
            <div>
              <h3 className="font-h3 text-sm text-[var(--text-primary)]">Today's Meal Headcount</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Verified barcode scans per meal session</p>
            </div>
            <Link
              to={`${basePath}/attendance`}
              className="text-xs text-[var(--tenant-primary)] hover:underline flex items-center gap-1 font-medium"
            >
              <span>View Roster</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                    color: "var(--text-primary)",
                  }}
                  cursor={{ fill: "var(--color-surface-sunken)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)] text-xs text-[var(--text-muted)]">
            <span>Breakfast: {data?.breakfast ?? 0}</span>
            <span>Lunch: {data?.lunch ?? 0}</span>
            <span>Dinner: {data?.dinner ?? 0}</span>
          </div>
        </div>

        {/* Sub-Zone: Occupancy Donut Chart */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-2">
            <div>
              <h3 className="font-h3 text-sm text-[var(--text-primary)]">Hostel Capacity</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Live bed allocation overview</p>
            </div>
            <Link
              to={`${basePath}/rooms`}
              className="text-xs text-[var(--tenant-primary)] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Rooms</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
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

export default AdminDashboardView;
