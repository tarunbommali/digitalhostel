import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { GuardProvider } from "../context/guard-context";
import { GuardScanVerification } from "../components/GuardScanVerification";
import { GuardLogbookTable } from "../components/GuardLogbookTable";

function GuardScannerContent() {
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";

  useEffect(() => {
    document.title = `Gate Scanner | ${organization?.name || "Campus Stay"}`;
  }, [organization]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Standard Page Header */}
      <PageHeader
        eyebrow="Security & Access"
        title="Gate Scanner & Outing Logbook"
        description="Scan student Digital ID cards, check active leave passes, and log entry & exit movement at the hostel gate"
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Gate Scanner" },
        ]}
      />

      {/* Verification Scanner Section */}
      <GuardScanVerification />

      {/* Recent Gate Movement Logbook */}
      <GuardLogbookTable />
    </div>
  );
}

export function GuardScannerPage() {
  return (
    <GuardProvider>
      <GuardScannerContent />
    </GuardProvider>
  );
}

export default GuardScannerPage;
