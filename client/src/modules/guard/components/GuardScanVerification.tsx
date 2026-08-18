import React, { useState, useCallback } from "react";
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  LogIn,
  Loader2,
  Clock,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Textarea } from "@/core/components/ui/textarea";
import { LiveCameraScanner } from "@/modules/organization/operations/attendance/components/LiveCameraScanner";
import { useCameraScanner } from "@/modules/organization/operations/attendance/hooks/useCameraScanner";
import { useGuard } from "../context/guard-context";
import { toast } from "sonner";

export const GuardScanVerification: React.FC = () => {
  const {
    scannedData,
    loadingScan,
    recordingMovement,
    verifyCode,
    recordMovement,
    clearScannedData,
  } = useGuard();

  const [searchInput, setSearchInput] = useState("");
  const [purpose, setPurpose] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleScanSuccess = useCallback(
    async (extractedUid: string) => {
      setSearchInput(extractedUid);
      await verifyCode(extractedUid);
    },
    [verifyCode]
  );

  const {
    scannerActive,
    setScannerActive,
    availableCameras,
    selectedCameraId,
    setSelectedCameraId,
    cameraError,
  } = useCameraScanner(handleScanSuccess);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) {
      toast.error("Please enter a Reg No or scan Digital ID");
      return;
    }
    verifyCode(searchInput);
  };

  const handleRecord = async (type: "out" | "in") => {
    const success = await recordMovement(type, purpose, remarks);
    if (success) {
      setPurpose("");
      setRemarks("");
      setSearchInput("");
    }
  };

  const student = scannedData?.student;
  const activeLeave = scannedData?.activeLeave;
  const isOut = scannedData?.isCurrentlyOut;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left 5 Cols: Scanner & Manual Verification Input */}
      <div className="space-y-6 lg:col-span-5">
        <Card className="p-5 border-[var(--color-border)] shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-[var(--tenant-primary)]" />
              <h2 className="font-semibold text-sm text-[var(--text-primary)]">Gate Verification</h2>
            </div>
            <Button
              variant={scannerActive ? "destructive" : "outline"}
              size="sm"
              onClick={() => setScannerActive(!scannerActive)}
              className="gap-1.5 text-xs h-8"
            >
              <QrCode className="h-3.5 w-3.5" />
              {scannerActive ? "Stop Camera" : "Live Camera QR"}
            </Button>
          </div>

          {/* Camera Scanner Viewport */}
          {scannerActive && (
            <div className="mb-4">
              <LiveCameraScanner
                scannerActive={scannerActive}
                availableCameras={availableCameras}
                selectedCameraId={selectedCameraId}
                setSelectedCameraId={setSelectedCameraId}
                cameraError={cameraError} setScannerActive={function (active: boolean): void {
                  throw new Error("Function not implemented.");
                }} />
            </div>
          )}

          {/* Manual Input Form */}
          <form onSubmit={handleVerify} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Scan Barcode or Enter Reg No / Hostel UID
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
                  <Input
                    placeholder="e.g. 21B91A0501 or UID"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 text-xs h-9 bg-[var(--color-surface-sunken)] border-[var(--color-border)]"
                    autoFocus
                  />
                </div>
                <Button type="submit" size="sm" disabled={loadingScan} className="h-9 px-4 text-xs">
                  {loadingScan ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify ID"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>

      {/* Right 7 Cols: Verified Student Profile & Movement Actions */}
      <div className="lg:col-span-7">
        {student ? (
          <Card className="p-6 border-[var(--color-border)] shadow-xs bg-[var(--color-surface)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.fullName}
                    className="h-14 w-14 rounded-full object-cover border-2 border-[var(--tenant-primary)] shadow-xs"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] flex items-center justify-center font-bold text-lg border border-[var(--tenant-primary)]/20">
                    {student.fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[var(--text-primary)]">{student.fullName}</h3>
                    <Badge variant={student.status === "active" ? "success" : "danger"} size="sm">
                      {student.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    Reg No: {student.registrationNumber} · UID: {student.hostelUid}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {student.department?.name || "Dept"} · Room: {student.room || "Assigned"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant={isOut ? "warning" : "pro"} size="md" className="gap-1 font-semibold">
                  <Clock className="h-3.5 w-3.5" />
                  {isOut ? "Currently OUT" : "Inside Campus"}
                </Badge>
                {activeLeave && (
                  <Badge variant="success" size="sm" className="gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" /> Approved Leave Pass
                  </Badge>
                )}
              </div>
            </div>

            {/* Outing / Movement Form */}
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-secondary)]">Outing Purpose</label>
                  <Input
                    placeholder="e.g. Market, Medical, Home Visit"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="text-xs h-8 bg-[var(--color-surface-sunken)] border-[var(--color-border)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-secondary)]">Guard Remarks (Optional)</label>
                  <Input
                    placeholder="e.g. With Parent / Emergency"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="text-xs h-8 bg-[var(--color-surface-sunken)] border-[var(--color-border)]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={clearScannedData} className="text-xs">
                  Clear
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => handleRecord("out")}
                    disabled={recordingMovement}
                    className="gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10 font-semibold"
                  >
                    {recordingMovement ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    Log Gate OUT
                  </Button>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleRecord("in")}
                    disabled={recordingMovement}
                    className="gap-1.5 font-semibold shadow-xs"
                  >
                    {recordingMovement ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="h-4 w-4" />
                    )}
                    Log Gate IN
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50">
            <ShieldCheck className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
            <h3 className="font-semibold text-sm text-[var(--text-primary)]">No Student Scanned</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-1">
              Use the live barcode scanner or enter a Registration Number / UID on the left to verify active permissions.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GuardScanVerification;
