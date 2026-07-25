import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CameraDevice } from "../types";
import { extractHostelUid } from "../utils/qr";
import { playBeep } from "../utils/audio";

function describeCameraError(err: any): string {
  const name = err?.name || "";
  if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
    return "Camera requires HTTPS (or localhost). This page is served over an insecure origin — the browser blocks camera access here regardless of permissions.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "No camera was found by the browser. Check Windows Settings → Privacy & security → Camera, and ensure 'Let apps access your camera' and 'Let desktop apps access your camera' are both on. Also close any other app (Teams/Zoom/Camera app) that may be holding the camera exclusively.";
  }
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera permission was denied for this site. Click the camera/lock icon in the address bar and set Camera to Allow, then retry.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The camera is in use by another application. Close other apps using the camera (Teams, Zoom, Windows Camera) and retry.";
  }
  return err?.message || String(err) || "Unknown camera error.";
}

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
        const attemptErrors: any[] = [];

        try {
          await new Promise((r) => setTimeout(r, 100));
          if (!isMounted) return;

          if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error(
              "This browser/context does not expose camera APIs. If you're on a non-localhost IP, camera access requires HTTPS."
            );
          }

          // Request permission with a live probe stream, then release it.
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach((t) => t.stop());
          } catch (permErr) {
            throw permErr;
          }

          try {
            const cams = await Html5Qrcode.getCameras();
            if (cams && cams.length > 0) {
              setAvailableCameras(cams);
              if (!selectedCameraId || !cams.some((c) => c.id === selectedCameraId)) {
                setSelectedCameraId(cams[0].id);
              }
            }
          } catch (_) {}

          const instance = new Html5Qrcode("qr-reader");
          scannerInstanceRef.current = instance;

          const cfg = { fps: 10, qrbox: { width: 240, height: 240 } };
          const cb = (t: string) => isMounted && handleRawScan(t);

          if (selectedCameraId && selectedCameraId.trim()) {
            try {
              await instance.start(selectedCameraId, cfg, cb, () => {});
              return;
            } catch (e) {
              attemptErrors.push(e);
            }
          }

          try {
            await instance.start({ facingMode: "user" }, cfg, cb, () => {});
            return;
          } catch (e) {
            attemptErrors.push(e);
          }

          try {
            await instance.start({ facingMode: "environment" }, cfg, cb, () => {});
            return;
          } catch (e) {
            attemptErrors.push(e);
          }

          try {
            await instance.start({ video: true } as any, cfg, cb, () => {});
            return;
          } catch (e) {
            attemptErrors.push(e);
          }

          throw attemptErrors[attemptErrors.length - 1] || new Error("No accessible camera device found.");
        } catch (err: any) {
          if (isMounted) {
            console.error("Camera start failed. Attempts:", attemptErrors, "Final:", err);
            setCameraError(describeCameraError(err));
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
