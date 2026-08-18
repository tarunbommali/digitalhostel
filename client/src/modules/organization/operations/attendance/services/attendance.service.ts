import { api } from "@/core/lib/api";
import { Meal, AttendanceResponse, AttendanceStatsData } from "../types";

export const attendanceService = {
  markAttendance(hostelUid: string, mealType: Meal): Promise<AttendanceResponse> {
    return api.post<AttendanceResponse>("/attendance/mark", { hostelUid, mealType });
  },

  getStats(): Promise<AttendanceStatsData> {
    return api.get<AttendanceStatsData>("/attendance/stats");
  },
};
