import React from "react";
import { useParams } from "react-router-dom";
import { Receipt, CreditCard, AlertTriangle } from "lucide-react";
import { useAuth } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import { StatCard } from "../components/StatCard";
import { AdminDashboardView } from "../components/AdminDashboardView";
import { ModeratorDashboardView } from "../components/ModeratorDashboardView";
import { StudentProfileCard } from "../components/StudentProfileCard";
import { DigitalIdCard } from "../components/DigitalIdCard";
import { ChangePasswordCard } from "../components/ChangePasswordCard";
import { Skeleton } from "@/core/components/ui/skeleton";
import { StudentOutingStatusCard } from "../components/StudentOutingStatusCard";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";
import GuardScannerPage from "@/modules/guard/pages/GuardScanner";
import { DashboardProvider, useDashboard } from "../context/dashboard-context";

function StudentDashboard() {
  const { stats: data, loading } = useDashboard();
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
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
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Welcome back, {s?.fullName || "Student"}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] rounded-full border border-[var(--tenant-primary)]/20">
              {organization?.name || "Hostel"}
            </span>
          </div>
          <p className="font-small text-xs text-[var(--text-secondary)] mt-1">
            Student Portal · Digital Pass & Account Overview
          </p>
        </div>

        {/* Page-Specific Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
            { label: "Student Portal" },
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Mess Monthly Dues"
          value={`₹ ${data?.totalDue?.toLocaleString("en-IN") ?? 0}`}
          hint={data?.totalDue > 0 ? "Pending Payment" : "All Clear"}
          icon={Receipt}
          color="var(--color-danger)"
        />
        <StatCard
          label="Total Paid"
          value={`₹ ${data?.totalPaid?.toLocaleString("en-IN") ?? 0}`}
          icon={CreditCard}
          color="var(--color-success)"
        />
        <StatCard
          label="Active Disciplinary Flags"
          value={data?.activeFlags ?? 0}
          hint={data?.activeFlags > 0 ? "Under Review" : "No Flag Reports"}
          icon={AlertTriangle}
          color="var(--color-warning)"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StudentProfileCard s={s} bed={bed} />
        </div>
        <div>
          <DigitalIdCard s={s} bed={bed} />
        </div>
      </div>

      {/* Outing Status & Logbook History Card */}
      <StudentOutingStatusCard />

      <ChangePasswordCard />
    </div>
  );
}

function DashboardContent() {
  const { role } = useAuth();
  if (role === "security_guard") return <GuardScannerPage />;
  if (role === "admin") return <AdminDashboardView />;
  if (role === "moderator") return <ModeratorDashboardView />;
  return <StudentDashboard />;
}

export function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

export default Dashboard;
