import { Utensils } from "lucide-react";
import { AttendanceStatsData } from "../types";
import { AttendanceStats } from "./AttendanceStats";

interface AttendanceHeaderProps {
  counts: AttendanceStatsData;
}

export function AttendanceHeader({ counts }: AttendanceHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Utensils className="h-6 w-6 text-primary" /> Mess Attendance
        </h1>
        <p className="text-sm text-muted-foreground">
          Scan Digital ID QR Code or enter 6-digit Hostel UID
        </p>
      </div>

      <AttendanceStats counts={counts} />
    </div>
  );
}
