import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { useHostelLookups } from "@/core/hooks/use-hostel-lookups";
import { HostelBlockManager } from "../components/HostelBlockManager";

export function HostelSetupPage() {
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";
  const { blocks, refetch } = useHostelLookups();

  const handleUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      <PageHeader
        eyebrow="Residents & Housing Setup"
        title="Hostel Setup"
        description="Configure hostel blocks, wings, and gender allocations used for room structuring and student housing."
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Hostel Setup" },
        ]}
      />

      <div className="max-w-3xl">
        <HostelBlockManager blocks={blocks} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}

export default HostelSetupPage;
