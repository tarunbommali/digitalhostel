import * as React from "react";
import { Users, CalendarCheck, Calendar, AlertTriangle } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTenant } from "@/core/context/tenant-context";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { MetricCard } from "@/core/components/ui/MetricCard";
import { DashboardSkeleton } from "@/core/components/ui/skeleton";
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
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHeader
        eyebrow="Staff Portal"
        title="Staff & Warden Dashboard"
        description="Mess attendance supervision, leave pass processing, and discipline oversight"
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Staff Portal" },
        ]}
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Students"
          value={data?.totalStudents ?? data?.students ?? 0}
          supportingText="Enrolled hostel residents"
          icon={Users}
          tone="default"
        />
        <MetricCard
          label="Today's Meal Scans"
          value={(data?.breakfast ?? 0) + (data?.lunch ?? 0) + (data?.dinner ?? 0)}
          supportingText={`B: ${data?.breakfast ?? 0} · L: ${data?.lunch ?? 0} · D: ${data?.dinner ?? 0}`}
          icon={CalendarCheck}
          tone="success"
        />
        <MetricCard
          label="Pending Leave Passes"
          value={data?.pendingLeaves ?? 0}
          supportingText={(data?.pendingLeaves ?? 0) > 0 ? "Awaiting warden review" : "All requests processed"}
          icon={Calendar}
          tone={(data?.pendingLeaves ?? 0) > 0 ? "warning" : "default"}
        />
        <MetricCard
          label="Active Disciplinary Flags"
          value={data?.openFlags ?? data?.activeFlags ?? 0}
          supportingText={(data?.openFlags ?? data?.activeFlags ?? 0) > 0 ? "Incident reports open" : "No open incidents"}
          icon={AlertTriangle}
          tone={(data?.openFlags ?? data?.activeFlags ?? 0) > 0 ? "danger" : "default"}
        />
      </div>
    </div>
  );
}

export default ModeratorDashboardView;
