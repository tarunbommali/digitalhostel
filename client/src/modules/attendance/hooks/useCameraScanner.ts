import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CameraDevice } from "../types";
import { extractHostelUid } from "../utils/qr";
import { playBeep } from "../utils/audio";

export function useCameraScanner(
  onScanSuccess: (extractedUid: string) => Promise<void>,
  onInvalidCode?: (msg: string) => void
) {
  const [scannerActive, setScannerActive] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const lastScannedTime = useRef<number>(0);

  // Fetch available camera devices on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((cams) => {
        if (cams && cams.length > 0) {
          setAvailableCameras(cams);
          setSelectedCameraId(cams[0].id);
        }
      })
      .catch((e) => console.log("Camera query notice:", e));
  }, []);

  const handleRawScan = useCallback(
    async (text: string) => {
      const now = Date.now();
      if (now - lastScannedTime.current < 2500) return;
      lastScannedTime.current = now;

      const extractedUid = extractHostelUid(text);
      if (!extractedUid) {
        playBeep("error");
        if (onInvalidCode) onInvalidCode("INVALID DIGITAL ID QR CODE!");
        return;
      }
      await onScanSuccess(extractedUid);
    },
    [onScanSuccess, onInvalidCode]
  );

  useEffect(() => {
    let isMounted = true;
    if (scannerActive) {
      const startCamera = async () => {
        setCameraError(null);
        try {
          await new Promise((r) => setTimeout(r, 100));
          if (!isMounted) return;

          if (navigator.mediaDevices?.getUserMedia) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              stream.getTracks().forEach((t) => t.stop());
            } catch (_) {}
          }

          const instance = new Html5Qrcode("qr-reader");
          scannerInstanceRef.current = instance;

          const cfg = { fps: 10, qrbox: { width: 240, height: 240 } };
          const cb = (t: string) => isMounted && handleRawScan(t);

          if (selectedCameraId) {
            try {
              await instance.start(selectedCameraId, cfg, cb, () => {});
              return;
            } catch (_) {}
          }

          try {
            await instance.start({ facingMode: "user" }, cfg, cb, () => {});
            return;
          } catch (_) {}

          try {
            await instance.start({ facingMode: "environment" }, cfg, cb, () => {});
            return;
          } catch (_) {}

          throw new Error("No accessible camera device found.");
        } catch (err: any) {
          if (isMounted) {
            setCameraError(err?.message || String(err));
            setScannerActive(false);
          }
        }
      };

      startCamera();
    }

    return () => {
      isMounted = false;
      const instance = scannerInstanceRef.current;
      scannerInstanceRef.current = null;
      if (instance) {
        try {
          if (instance.isScanning) {
            instance.stop().catch(() => {}).finally(() => instance.clear());
          } else {
            instance.clear();
          }
        } catch (_) {}
      }
    };
  }, [scannerActive, selectedCameraId, handleRawScan]);

  return {
    scannerActive,
    setScannerActive,
    availableCameras,
    selectedCameraId,
    setSelectedCameraId,
    cameraError,
  };
}
