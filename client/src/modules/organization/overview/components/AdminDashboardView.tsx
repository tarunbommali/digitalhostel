import * as React from "react";
import {
  Users,
  DoorOpen,
  Receipt,
  Utensils,
  ArrowRight,
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
import { PageHeader } from "@/core/components/ui/PageHeader";
import { MetricCard } from "@/core/components/ui/MetricCard";
import { AttentionPanel, AttentionItem } from "@/core/components/ui/AttentionPanel";
import { MasterLookupsSummary } from "./MasterLookupsSummary";
import { DashboardSkeleton } from "@/core/components/ui/skeleton";
import { Button } from "@/core/components/ui/button";
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

  // Real attention items queue (only rendered when counts > 0)
  const attentionItems: AttentionItem[] = [
    {
      label: "unpaid hostel invoices",
      count: data?.unpaidBillsCount ?? 0,
      severity: "danger",
      href: `${basePath}/bills`,
      description: `₹${(data?.totalUnpaidAmount ?? 0).toLocaleString("en-IN")} pending collection`,
    },
    {
      label: "active disciplinary flags",
      count: data?.activeFlags ?? 0,
      severity: "warning",
      href: `${basePath}/flags`,
      description: "Incidents requiring administrator review",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Zone 1: Unified PageHeader */}
      <PageHeader
        eyebrow="Hostel Operations"
        title="Admin Dashboard"
        description="Operational overview, capacity metrics, meal attendance, and hostel lookups"
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Dashboard" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to={`${basePath}/attendance`}>
                <CalendarCheck className="w-4 h-4 text-[var(--tenant-primary)]" />
                <span>Mark Attendance</span>
              </Link>
            </Button>
            <Button asChild variant="primary" size="sm" className="gap-1.5 shadow-xs">
              <Link to={`${basePath}/students/new`}>
                <Plus className="w-4 h-4" />
                <span>Register Student</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Zone 2: Attention Panel (Conditionally renders if >0 items) */}
      <AttentionPanel
        title="Requires Admin Attention"
        items={attentionItems}
      />

      {/* Zone 3: Standard MetricCard KPI Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Students"
          value={data?.totalStudents ?? 0}
          supportingText={`${data?.activeStudents ?? 0} active enrollment`}
          icon={Users}
          tone="default"
        />
        <MetricCard
          label="Room Occupancy"
          value={`${occupancyRate}%`}
          supportingText={`${data?.allocatedBeds ?? 0} of ${totalBeds} beds assigned`}
          icon={DoorOpen}
          tone="default"
        />
        <MetricCard
          label="Unpaid Invoices"
          value={data?.unpaidBillsCount ?? 0}
          supportingText={`₹${(data?.totalUnpaidAmount ?? 0).toLocaleString("en-IN")} pending collection`}
          icon={Receipt}
          tone={(data?.unpaidBillsCount ?? 0) > 0 ? "danger" : "default"}
        />
        <MetricCard
          label="Today's Meals Served"
          value={(data?.breakfast ?? 0) + (data?.lunch ?? 0) + (data?.dinner ?? 0)}
          supportingText={`${data?.lunch ?? 0} lunches recorded today`}
          icon={Utensils}
          tone="success"
        />
      </div>

      {/* Zone 4: Analytics Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Sub-Zone: Meal Distribution Bar Chart */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
            <div>
              <h3 className="font-h3 text-sm text-[var(--text-primary)]">Today's Meal Headcount</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Verified meal session attendance scans</p>
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
            <span>Breakfast: <strong>{data?.breakfast ?? 0}</strong></span>
            <span>Lunch: <strong>{data?.lunch ?? 0}</strong></span>
            <span>Dinner: <strong>{data?.dinner ?? 0}</strong></span>
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
              <span className="font-display text-lg font-bold text-[var(--text-primary)]">{occupancyRate}%</span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Occupied</span>
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

      {/* Zone 5: Master Lookup & Setup Summary */}
      <MasterLookupsSummary />
    </div>
  );
}

export default AdminDashboardView;
