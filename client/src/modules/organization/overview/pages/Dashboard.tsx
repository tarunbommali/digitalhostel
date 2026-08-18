import React from "react";
import { useParams } from "react-router-dom";
import { Receipt, CreditCard, AlertTriangle } from "lucide-react";
import { useAuth } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { PageContainer } from "@/core/components/ui/PageContainer";
import { MetricCard } from "@/core/components/ui/MetricCard";
import { AdminDashboardView } from "../components/AdminDashboardView";
import { ModeratorDashboardView } from "../components/ModeratorDashboardView";
import { StudentProfileCard } from "../components/StudentProfileCard";
import { DigitalIdCard } from "../components/DigitalIdCard";
import { ChangePasswordCard } from "../components/ChangePasswordCard";
import { Skeleton } from "@/core/components/ui/skeleton";
import { StudentOutingStatusCard } from "../components/StudentOutingStatusCard";
import GuardScannerPage from "@/modules/guard/pages/GuardScanner";
import { DashboardProvider, useDashboard } from "../context/dashboard-context";

function StudentDashboard() {
  const { stats: data, loading } = useDashboard();
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        <Skeleton className="h-20 w-full rounded-xl" />
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
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHeader
        eyebrow="Resident Portal"
        title={`Welcome back, ${s?.fullName || "Student"}`}
        description="Digital ID pass, live hostel room allocation, mess dues, and outing history"
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Student Portal" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Mess Monthly Dues"
          value={`₹ ${data?.totalDue?.toLocaleString("en-IN") ?? 0}`}
          supportingText={(data?.totalDue ?? 0) > 0 ? "Pending Payment" : "All Clear"}
          icon={Receipt}
          tone={(data?.totalDue ?? 0) > 0 ? "danger" : "success"}
        />
        <MetricCard
          label="Total Paid"
          value={`₹ ${data?.totalPaid?.toLocaleString("en-IN") ?? 0}`}
          supportingText="Settled transactions"
          icon={CreditCard}
          tone="success"
        />
        <MetricCard
          label="Active Disciplinary Flags"
          value={data?.activeFlags ?? 0}
          supportingText={(data?.activeFlags ?? 0) > 0 ? "Under Review" : "No Flag Reports"}
          icon={AlertTriangle}
          tone={(data?.activeFlags ?? 0) > 0 ? "warning" : "default"}
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
