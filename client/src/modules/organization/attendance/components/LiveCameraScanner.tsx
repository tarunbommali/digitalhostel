import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Camera, ShieldAlert } from "lucide-react";

interface LiveCameraScannerProps {
  scannerActive: boolean;
  setScannerActive: (active: boolean) => void;
  availableCameras: Array<{ id: string; label: string }>;
  selectedCameraId: string;
  setSelectedCameraId: (id: string) => void;
  cameraError: string | null;
}

export function LiveCameraScanner({
  scannerActive,
  setScannerActive,
  availableCameras,
  selectedCameraId,
  setSelectedCameraId,
  cameraError,
}: LiveCameraScannerProps) {
  return (
    <Card className="p-6 flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-3 mb-4">
          <div className="flex items-center gap-2 font-semibold text-base">
            <Camera className="h-5 w-5 text-primary" />
            <span>Live Camera Scanner</span>
          </div>
          <div className="flex items-center gap-2">
            {availableCameras.length > 1 && (
              <Select
                value={selectedCameraId}
                onValueChange={setSelectedCameraId}
              >
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Camera" />
                </SelectTrigger>
                <SelectContent>
                  {availableCameras.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label || "Camera " + c.id.slice(0, 5)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              size="sm"
              variant={scannerActive ? "destructive" : "default"}
              onClick={() => setScannerActive(!scannerActive)}
            >
              {scannerActive ? "Stop Camera" : "Start Camera"}
            </Button>
          </div>
        </div>

        {scannerActive ? (
          <div className="overflow-hidden rounded-lg border bg-black/90">
            <div id="qr-reader" className="w-full" />
          </div>
        ) : cameraError ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-center text-xs space-y-2">
            <ShieldAlert className="h-7 w-7 text-amber-600 mx-auto" />
            <p className="font-semibold text-sm">
              Camera Access Permission Required
            </p>
            <p className="text-muted-foreground leading-relaxed">
              1. Click the <b>Camera/Lock Icon</b> in your browser URL address bar
              (top-left).
              <br />
              2. Switch Camera permission to <b>"Allow"</b>.<br />
              3. Or plug in a <b>USB Barcode / QR Scanner Gun</b> or use{" "}
              <b>Manual 6-Digit UID Entry</b>.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => setScannerActive(true)}
            >
              Retry Camera
            </Button>
          </div>
        ) : (
          <div className="h-44 rounded-lg border border-dashed grid place-items-center text-center p-6 bg-muted/20">
            <div>
              <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Camera Scanner Ready</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Start Camera" to scan student Digital ID QR passes, or
                plug in a USB Barcode Scanner Gun.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
