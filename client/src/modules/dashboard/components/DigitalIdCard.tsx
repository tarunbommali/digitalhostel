import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { QrCode, Download } from "lucide-react";

export function DigitalIdCard({ s }: { s: any }) {
  if (!s) return null;

  const downloadQR = () => {
    const canvas = document.getElementById("student-qr-pass") as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `Digital_ID_${s.registrationNumber || s.hostelUid || "Student"}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success("Digital ID downloaded successfully");
  };

  return (
    <Card className="p-6 flex flex-col items-center justify-between text-center bg-gradient-to-b from-card to-accent/20">
      <div className="w-full">
        <div className="flex items-center justify-center gap-2 font-semibold text-base border-b pb-3 mb-4">
          <QrCode className="h-5 w-5 text-primary" />
          <span>Digital ID</span>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-inner border border-primary/20 inline-block mb-3">
          <QRCodeCanvas
            id="student-qr-pass"
            value={`JNTUGV-PASS::${btoa(
              JSON.stringify({
                hUid: s.hostelUid,
                name: s.fullName,
                regNo: s.registrationNumber,
                dept: s.department?.name,
                year: s.academicYear?.name,
                status: s.status || "active",
                issuer: "JNTUGV-HOSTEL-MANAGEMENT",
                ts: Date.now(),
              }),
            )}`}
            size={160}
            level="H"
            includeMargin={true}
          />
        </div>
        <p className="text-xs font-semibold">{s.fullName}</p>
        <p className="text-[11px] font-mono text-muted-foreground">
          Reg No: {s.registrationNumber}
        </p>
      </div>

      <Button
        onClick={downloadQR}
        variant="outline"
        className="w-full mt-4 gap-2"
      >
        <Download className="h-4 w-4" /> Download Digital ID
      </Button>
    </Card>
  );
}
