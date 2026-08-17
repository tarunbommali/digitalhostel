import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Standard Page Header */}
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Gate Scanner & Outing Logbook
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] rounded-full border border-[var(--tenant-primary)]/20">
              {organization?.name || "Hostel Gate"}
            </span>
          </div>
          <p className="font-small text-xs text-[var(--text-secondary)] mt-1">
            Scan student Digital ID cards, check active leave passes, and log entry & exit movement at the hostel gate
          </p>
        </div>

        {/* Page-Specific Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
            { label: "Gate Scanner" },
          ]}
        />
      </div>

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
