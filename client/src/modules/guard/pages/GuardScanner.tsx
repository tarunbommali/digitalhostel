import { useState, useEffect, useCallback } from "react";
import { api } from "@/core/lib/api";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Textarea } from "@/core/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { toast } from "sonner";
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
import { LiveCameraScanner } from "@/modules/attendance/components/LiveCameraScanner";
import { useCameraScanner } from "@/modules/attendance/hooks/useCameraScanner";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";

export function GuardScannerPage() {
  const [searchInput, setSearchInput] = useState("");
  const [scannedData, setScannedData] = useState<any>(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [recording, setRecording] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [remarks, setRemarks] = useState("");
  const [logbook, setLogbook] = useState<any[]>([]);
  const [loadingLogbook, setLoadingLogbook] = useState(true);

  const fetchLogbook = () => {
    setLoadingLogbook(true);
    api
      .get<any[]>("/outings/logbook")
      .then(setLogbook)
      .catch(console.error)
      .finally(() => setLoadingLogbook(false));
  };

  useEffect(() => {
    fetchLogbook();
  }, []);

  const verifyCode = useCallback(async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;
    setLoadingScan(true);
    setScannedData(null);

    try {
      const res: any = await api.post("/outings/verify-scan", { code: codeToVerify.trim() });
      if (res.ok) {
        setScannedData(res);
        toast.success(`Student Verified: ${res.student.fullName}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to verify student Digital ID");
    } finally {
      setLoadingScan(false);
    }
  }, []);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) {
      toast.error("Please enter a Reg No or scan Digital ID");
      return;
    }
    verifyCode(searchInput);
  };

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

  const handleRecordMovement = async (type: "out" | "in") => {
    if (!scannedData || !scannedData.student) return;
    setRecording(true);

    try {
      await api.post("/outings/record", {
        studentId: scannedData.student._id,
        type,
        purpose: purpose.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });

      toast.success(
        `Successfully logged ${type.toUpperCase()} entry for ${scannedData.student.fullName}`
      );
      setPurpose("");
      setRemarks("");
      setSearchInput("");
      setScannedData(null);
      fetchLogbook();
    } catch (err: any) {
      toast.error(err.message || `Failed to record gate movement`);
    } finally {
      setRecording(false);
    }
  };

  const student = scannedData?.student;
  const activeLeave = scannedData?.activeLeave;
  const isOut = scannedData?.isCurrentlyOut;

  return (
    <div className="space-y-6">
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Digital ID Gate Scanner & Outing Logbook
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Scan student Digital ID cards, check active leave passes, and log entry & exit movement at the hostel gate.
          </p>
        </div>
        <Breadcrumbs />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Verification & Scanner Box */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 border-primary/20">
            <div className="flex items-center gap-2 font-semibold text-base border-b pb-3 mb-4">
              <QrCode className="h-5 w-5 text-primary" />
              <span>Verify Digital ID Pass</span>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="Scan QR or Enter Reg No / Hostel UID"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pr-10 font-mono text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-primary"
                  disabled={loadingScan}
                >
                  {loadingScan ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loadingScan || !searchInput.trim()}
              >
                {loadingScan && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify Student Card
              </Button>
            </form>

            {/* Live Camera Scanner */}
            <LiveCameraScanner
              scannerActive={scannerActive}
              setScannerActive={setScannerActive}
              availableCameras={availableCameras}
              selectedCameraId={selectedCameraId}
              setSelectedCameraId={setSelectedCameraId}
              cameraError={cameraError}
            />

            {/* Quick Demo Test Buttons */}
            <div className="mt-4 pt-3 border-t text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">💡 Scan Quick Hint:</p>
              <p className="text-[11px] leading-relaxed">
                You can directly paste or type the Student Registration Number or scan the Digital QR from the student dashboard.
              </p>
            </div>
          </Card>

          {/* Student Verification Result Card */}
          {student && (
            <Card className="p-5 border-2 border-primary/40 bg-card shadow-lg animate-in fade-in-50">
              <div className="flex items-start justify-between border-b pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-lg leading-snug">
                    {student.fullName}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground">
                    Reg No: {student.registrationNumber}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    Hostel UID: {student.hostelUid}
                  </p>
                </div>
                <Badge
                  variant={student.status === "active" ? "default" : "destructive"}
                  className="capitalize"
                >
                  {student.status}
                </Badge>
              </div>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Current Gate State:</span>
                  <Badge variant={isOut ? "destructive" : "secondary"}>
                    {isOut ? "OUTSIDE HOSTEL" : "INSIDE HOSTEL"}
                  </Badge>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Approved Leave Pass:</span>
                  {activeLeave ? (
                    <Badge variant="default" className="bg-emerald-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> APPROVED LEAVE
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      No Active Leave Pass
                    </Badge>
                  )}
                </div>
                {activeLeave && (
                  <div className="p-2 bg-emerald-50 text-emerald-950 rounded border border-emerald-200 text-[11px] space-y-0.5">
                    <p className="font-semibold">Reason: {activeLeave.reason}</p>
                    <p className="text-[10px] text-emerald-800">
                      Valid: {new Date(activeLeave.fromDate).toLocaleDateString()} to{" "}
                      {new Date(activeLeave.toDate).toLocaleDateString()} ({activeLeave.daysCount} Days)
                    </p>
                  </div>
                )}
              </div>

              {/* Movement Actions */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <span className="text-xs font-medium">Outing Purpose / Remarks (Optional):</span>
                  <Input
                    placeholder="e.g. Local Outing / Home Leave"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    onClick={() => handleRecordMovement("out")}
                    variant="destructive"
                    className="w-full bg-[var(--color-warning)] hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 h-10"
                    disabled={recording}
                  >
                    {recording ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    SCAN OUT (Exit)
                  </Button>

                  <Button
                    onClick={() => handleRecordMovement("in")}
                    variant="primary"
                    className="w-full bg-[var(--color-success)] hover:bg-emerald-600 text-white font-semibold gap-1.5 h-10"
                    disabled={recording}
                  >
                    {recording ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="h-4 w-4" />
                    )}
                    SCAN IN (Entry)
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Gate Outing Logbook Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2 font-semibold text-base">
                <Clock className="h-5 w-5 text-primary" />
                <span>Hostel Gate Outing Logbook History</span>
              </div>
              <Button size="sm" variant="outline" onClick={fetchLogbook} disabled={loadingLogbook}>
                {loadingLogbook && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />} Refresh Logbook
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time & Date</TableHead>
                  <TableHead>Student Name & UID</TableHead>
                  <TableHead>Movement</TableHead>
                  <TableHead>Purpose / Pass</TableHead>
                  <TableHead>Security Guard</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingLogbook && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">
                      Loading gate logbook…
                    </TableCell>
                  </TableRow>
                )}
                {!loadingLogbook && logbook.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">
                      No entry/exit logs recorded yet.
                    </TableCell>
                  </TableRow>
                )}
                {!loadingLogbook &&
                  logbook.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="text-xs font-mono">
                        {new Date(log.timestamp).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-xs">
                          {log.student?.fullName || "Student"}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {log.student?.registrationNumber || log.student?.hostelUid}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={log.type === "out" ? "destructive" : "default"}
                          className={
                            log.type === "out"
                              ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-300"
                              : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-300"
                          }
                        >
                          {log.type === "out" ? "OUT (Gate Exit)" : "IN (Gate Entry)"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {log.purpose || log.remarks || "General Gate Entry/Exit"}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {log.guard?.fullName || "Security Guard"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default GuardScannerPage;
