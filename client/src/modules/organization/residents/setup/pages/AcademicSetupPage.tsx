import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { useHostelLookups } from "@/core/hooks/use-hostel-lookups";
import { DepartmentManager } from "../components/DepartmentManager";
import { AcademicYearManager } from "../components/AcademicYearManager";

export function AcademicSetupPage() {
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";
  const { departments, academicYears, refetch } = useHostelLookups();

  const handleUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      <PageHeader
        eyebrow="Residents & Academic Setup"
        title="Academic Setup"
        description="Configure academic departments, courses, and batch admission years used across student registration and records."
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Academic Setup" },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
        <DepartmentManager departments={departments} onUpdate={handleUpdate} />
        <AcademicYearManager academicYears={academicYears} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}

export default AcademicSetupPage;
