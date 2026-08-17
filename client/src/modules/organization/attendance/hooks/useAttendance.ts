import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Meal, AlertState } from "../types";
import { attendanceService } from "../services/attendance.service";
import { playBeep } from "../utils/audio";

export function useAttendance(onSuccess?: () => void) {
  const [uid, setUid] = useState("");
  const [busy, setBusy] = useState(false);
  const [alertState, setAlertState] = useState<AlertState | null>(null);

  const processAttendance = useCallback(
    async (hostelUid: string, targetMeal: Meal) => {
      if (!hostelUid.trim()) return;
      setBusy(true);
      try {
        const response = await attendanceService.markAttendance(hostelUid, targetMeal);
        playBeep("success");
        setAlertState({
          type: "success",
          message: `${targetMeal.toUpperCase()} Attendance Recorded Successfully!`,
          studentName: response.student?.fullName,
          registrationNumber: response.student?.registrationNumber,
          hostelUid,
        });
        toast.success(`${targetMeal} marked for ${response.student?.fullName}`);
        setUid("");
        if (onSuccess) onSuccess();
      } catch (err: any) {
        const msg = err.message || "Failed to mark attendance";
        const lower = msg.toLowerCase();

        if (lower.includes("already marked")) {
          playBeep("duplicate");
          setAlertState({
            type: "duplicate",
            message: "DUPLICATE ATTENDANCE DETECTED!",
            hostelUid,
          });
        } else if (lower.includes("inactive")) {
          playBeep("error");
          setAlertState({
            type: "inactive",
            message: "STUDENT PROFILE INACTIVE!",
            hostelUid,
          });
        } else {
          playBeep("error");
          setAlertState({
            type: "invalid",
            message: msg,
            hostelUid,
          });
        }
      } finally {
        setBusy(false);
      }
    },
    [onSuccess]
  );

  return {
    uid,
    setUid,
    busy,
    alertState,
    setAlertState,
    processAttendance,
  };
}
