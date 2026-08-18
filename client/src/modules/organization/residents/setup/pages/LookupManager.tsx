import { useCallback } from "react";
import { useHostelLookups } from "@/core/hooks/use-hostel-lookups";
import { DepartmentManager } from "../components/DepartmentManager";
import { AcademicYearManager } from "../components/AcademicYearManager";
import { HostelBlockManager } from "../components/HostelBlockManager";

interface LookupManagerProps {
  onUpdate?: () => void;
}

export function LookupManager({ onUpdate }: LookupManagerProps) {
  const { departments, academicYears, blocks, refetch } = useHostelLookups();

  const handleUpdate = useCallback(() => {
    refetch();
    if (onUpdate) onUpdate();
  }, [refetch, onUpdate]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">System Master Lookups</h2>
        <p className="text-sm text-muted-foreground">
          Configure departments, academic year batches, and hostel blocks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <HostelBlockManager blocks={blocks} onUpdate={handleUpdate} />
        <DepartmentManager departments={departments} onUpdate={handleUpdate} />
        <AcademicYearManager academicYears={academicYears} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}

export default LookupManager;
