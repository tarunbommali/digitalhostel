import { useState, useEffect, useCallback } from "react";
import { AttendanceStatsData } from "../types";
import { attendanceService } from "../services/attendance.service";

export function useAttendanceStats() {
  const [counts, setCounts] = useState<AttendanceStatsData>({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(() => {
    setLoading(true);
    attendanceService
      .getStats()
      .then((data) => {
        if (data) setCounts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    counts,
    loading,
    refetchStats: fetchStats,
  };
}
