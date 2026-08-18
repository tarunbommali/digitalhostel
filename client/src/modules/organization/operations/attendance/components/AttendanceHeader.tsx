import { AttendanceStatsData } from "../types";
import { AttendanceStats } from "./AttendanceStats";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { useParams } from "react-router-dom";

interface AttendanceHeaderProps {
  counts: AttendanceStatsData;
}

export function AttendanceHeader({ counts }: AttendanceHeaderProps) {
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";

  return (
    <PageHeader
      eyebrow="Operations"
      title="Mess Attendance"
      description="Scan Digital ID QR Code or enter 6-digit resident UID to record meal attendance"
      breadcrumbs={[
        { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
        { label: "Mess Attendance" },
      ]}
      actions={<AttendanceStats counts={counts} />}
    />
  );
}

export default AttendanceHeader;
