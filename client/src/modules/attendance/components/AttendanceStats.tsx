import { AttendanceStatsData } from "../types";

interface AttendanceStatsProps {
  counts: AttendanceStatsData;
}

export function AttendanceStats({ counts }: AttendanceStatsProps) {
  return (
    <div className="flex gap-2 text-sm font-medium">
      <span className="rounded-md border bg-card px-3 py-1.5">
        Breakfast: <b className="text-primary">{counts.breakfast}</b>
      </span>
      <span className="rounded-md border bg-card px-3 py-1.5">
        Lunch: <b className="text-primary">{counts.lunch}</b>
      </span>
      <span className="rounded-md border bg-card px-3 py-1.5">
        Dinner: <b className="text-primary">{counts.dinner}</b>
      </span>
    </div>
  );
}
