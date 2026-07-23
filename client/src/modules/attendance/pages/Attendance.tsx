import { useCallback } from "react";
import { useMealWindow } from "../hooks/useMealWindow";
import { useAttendanceStats } from "../hooks/useAttendanceStats";
import { useAttendance } from "../hooks/useAttendance";
import { useCameraScanner } from "../hooks/useCameraScanner";
import { AttendanceHeader } from "../components/AttendanceHeader";
import { MealTimingBanner } from "../components/MealTimingBanner";
import { AttendanceAlertBanner } from "../components/AttendanceAlertBanner";
import { ManualUidForm } from "../components/ManualUidForm";
import { LiveCameraScanner } from "../components/LiveCameraScanner";

export function AttendancePage() {
  const { meal, setMeal, timeStatus } = useMealWindow();
  const { counts, refetchStats } = useAttendanceStats();

  const {
    uid,
    setUid,
    busy,
    alertState,
    setAlertState,
    processAttendance,
  } = useAttendance(refetchStats);

  const handleScanSuccess = useCallback(
    async (extractedUid: string) => {
      setUid(extractedUid);
      await processAttendance(extractedUid, meal);
    },
    [meal, processAttendance, setUid]
  );

  const handleInvalidCode = useCallback((msg: string) => {
    setAlertState({ type: "invalid", message: msg });
  }, [setAlertState]);

  const {
    scannerActive,
    setScannerActive,
    availableCameras,
    selectedCameraId,
    setSelectedCameraId,
    cameraError,
  } = useCameraScanner(handleScanSuccess, handleInvalidCode);

  return (
    <div className="space-y-6 max-w-4xl">
      <AttendanceHeader counts={counts} />

      <MealTimingBanner meal={meal} setMeal={setMeal} timeStatus={timeStatus} />

      <AttendanceAlertBanner
        alertState={alertState}
        onDismiss={() => setAlertState(null)}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <ManualUidForm
          uid={uid}
          setUid={setUid}
          busy={busy}
          meal={meal}
          onSubmit={(e) => {
            e.preventDefault();
            processAttendance(uid, meal);
          }}
        />

        <LiveCameraScanner
          scannerActive={scannerActive}
          setScannerActive={setScannerActive}
          availableCameras={availableCameras}
          selectedCameraId={selectedCameraId}
          setSelectedCameraId={setSelectedCameraId}
          cameraError={cameraError}
        />
      </div>
    </div>
  );
}

export default AttendancePage;
