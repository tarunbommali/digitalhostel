import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import {
  Download,
  BookOpen,
  Building,
  Home,
  ShieldCheck,
  UserCheck,
  Phone,
  RotateCw,
  FileCheck2,
} from "lucide-react";
import universityLogo from "@/assets/univeristy_logo.jpg";

interface DigitalIdCardProps {
  s: any;
  bed?: any;
}

// Plain hex palette — used via inline `style`, never Tailwind color classes,
// because Tailwind v4 emits oklch() which html2canvas cannot parse.
const c = {
  ink900: "#0f172a",
  ink800: "#1e293b",
  ink700: "#334155",
  ink600: "#475569",
  ink500: "#64748b",
  ink400: "#94a3b8",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  white: "#ffffff",
  emeraldBg: "#ecfdf5",
  emeraldBorder: "#a7f3d0",
  emeraldDot: "#059669",
  emeraldText: "#065f46",
  redBg: "#fef2f2",
  redBorder: "#fecaca",
  redDot: "#dc2626",
  redText: "#991b1b",
};

export function DigitalIdCard({ s, bed }: DigitalIdCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [downloading, setDownloading] = useState<"front" | "back" | null>(null);

  if (!s) return null;

  const downloadCardSide = async (sideId: string, filenameSuffix: "Front" | "Back") => {
    const cardElement = document.getElementById(sideId);
    if (!cardElement) return;

    setDownloading(filenameSuffix.toLowerCase() as "front" | "back");
    const wasHidden = cardElement.classList.contains("hidden");
    if (wasHidden) cardElement.classList.remove("hidden");

    try {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardElement, {
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = `ID_${filenameSuffix}_${s.registrationNumber || s.hostelUid || "Student"}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      toast.success(`ID card (${filenameSuffix}) downloaded successfully`);
    } catch (err) {
      console.error("ID card render failed:", err);
      toast.error("Failed to render printable ID card image");
    } finally {
      if (wasHidden) cardElement.classList.add("hidden");
      setDownloading(null);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(s.fullName);
  const photoUrl = s.photoUrl || s.avatarUrl || null;

  const hostelBlock = bed?.rooms?.hostelBlocks?.name || "Nagavali";
  const roomNo = bed?.rooms?.roomNumber || "202";
  const bedNumber = bed?.bedNumber || 1;

  const cardNo = `ID-${new Date().getFullYear()}-${s.hostelUid || "100001"}`;
  const academicBatch = s.academicYear?.name || "2024–2028";
  const validUntil = s.cardValidUntil
    ? new Date(s.cardValidUntil).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "31 Jul 2027";
  const programName = s.programType || (s.academicYear?.name?.includes("PG") ? "PG" : "B.Tech");
  const bloodGroup = s.bloodGroup || "B+";
  const studentPhone = s.phone || s.mobileNumber || "+91 9876543210";
  const emergencyContact = s.emergencyContact || s.guardianPhone || "+91 9123456789";
  const isActive = (s.status || "active").toLowerCase() === "active";

  const qrValue = `JNTUGV-PASS::${btoa(
    JSON.stringify({
      hUid: s.hostelUid,
      name: s.fullName,
      regNo: s.registrationNumber,
      dept: s.department?.name,
      hostel: hostelBlock,
      room: roomNo,
      bed: bedNumber,
      year: s.academicYear?.name,
      status: s.status || "active",
      issuer: "JNTUGV-HOSTEL-MANAGEMENT",
      ts: Date.now(),
    }),
  )}`;

  return (
    <div className="space-y-4 max-w-[440px] mx-auto select-none font-sans">
      {/* Toggle Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <ShieldCheck className="h-4 w-4 text-slate-700" />
          <span>Digital Student ID Card</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsFlipped(!isFlipped)}
          className="h-7 text-xs gap-1.5"
        >
          <RotateCw className="h-3.5 w-3.5" />
          {isFlipped ? "Show Front Side" : "Flip to Back Side"}
        </Button>
      </div>

      <div className="relative min-h-[250px]">
        {/* FRONT */}
        <div
          id="pvc-cr80-front"
          className={`${isFlipped ? "hidden" : "block"} w-full aspect-[85.6/53.98] rounded-xl flex flex-col justify-between relative overflow-hidden`}
          style={{ backgroundColor: c.white, border: `1px solid ${c.slate300}` }}
        >
          {/* Header band */}
          <div
            className="px-3.5 py-2 flex items-center justify-between"
            style={{ backgroundColor: c.ink900 }}
          >
            <div className="flex items-center gap-2">
              <img
                src={universityLogo}
                alt="JNTUGV Logo"
                className="h-7 w-7 object-contain rounded-full p-0.5"
                style={{ backgroundColor: c.white, border: `1px solid rgba(255,255,255,0.6)` }}
              />
              <div>
                <h2
                  className="text-[11px] font-bold tracking-tight leading-none uppercase"
                  style={{ color: c.white }}
                >
                  JNTUGV University
                </h2>
                <p className="text-[7px] font-medium tracking-wide mt-0.5" style={{ color: c.slate300 }}>
                  Digital Student Identity Card
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded"
              style={{
                backgroundColor: isActive ? c.emeraldBg : c.redBg,
                border: `1px solid ${isActive ? c.emeraldBorder : c.redBorder}`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: isActive ? c.emeraldDot : c.redDot }}
              />
              <span
                className="text-[7px] font-bold tracking-wide uppercase"
                style={{ color: isActive ? c.emeraldText : c.redText }}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="grid grid-cols-12 gap-2.5 items-center px-3.5 py-2 flex-1">
            {/* Photo */}
            <div className="col-span-3 flex flex-col items-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={s.fullName}
                  className="w-16 h-20 rounded-md object-cover"
                  style={{ border: `1px solid ${c.slate300}` }}
                />
              ) : (
                <div
                  className="w-16 h-20 rounded-md flex flex-col items-center justify-center font-bold text-lg"
                  style={{ backgroundColor: c.slate100, color: c.ink700, border: `1px solid ${c.slate300}` }}
                >
                  <span>{initials}</span>
                  <span className="text-[6px] font-medium mt-0.5" style={{ color: c.ink500 }}>
                    PHOTO
                  </span>
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="col-span-6 min-w-0 space-y-0.5">
              <h3 className="text-[13.5px] font-bold truncate leading-tight" style={{ color: c.ink900 }}>
                {s.fullName}
              </h3>
              <p className="text-[8px] font-semibold flex items-center gap-1" style={{ color: c.ink600 }}>
                <UserCheck className="h-2.5 w-2.5" /> Program: {programName}
              </p>

              <div className="pt-0.5 space-y-0.5 text-[8px]">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-2.5 w-2.5 shrink-0" style={{ color: c.ink500 }} />
                  <span className="uppercase font-bold text-[7px]" style={{ color: c.ink500 }}>
                    Reg:
                  </span>
                  <span className="font-semibold truncate" style={{ color: c.ink800 }}>
                    {s.registrationNumber || "24VV1F0008"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Building className="h-2.5 w-2.5 shrink-0" style={{ color: c.ink500 }} />
                  <span className="uppercase font-bold text-[7px]" style={{ color: c.ink500 }}>
                    Dept:
                  </span>
                  <span className="font-medium truncate" style={{ color: c.ink800 }}>
                    {s.department?.name || "Information Technology"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Home className="h-2.5 w-2.5 shrink-0" style={{ color: c.ink500 }} />
                  <span className="uppercase font-bold text-[7px]" style={{ color: c.ink500 }}>
                    Hostel:
                  </span>
                  <span className="font-medium truncate" style={{ color: c.ink800 }}>
                    {hostelBlock}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="uppercase font-bold text-[7px]" style={{ color: c.ink500 }}>
                    Room:
                  </span>
                  <span className="font-semibold" style={{ color: c.ink800 }}>
                    {roomNo} (Bed-{bedNumber})
                  </span>
                  <span className="uppercase font-bold text-[7px] ml-1" style={{ color: c.ink500 }}>
                    Blood:
                  </span>
                  <span className="font-semibold" style={{ color: c.ink800 }}>
                    {bloodGroup}
                  </span>
                </div>
              </div>
            </div>

            {/* QR */}
            <div className="col-span-3 flex flex-col items-center justify-center text-center">
              <div className="p-1 rounded" style={{ backgroundColor: c.white, border: `1px solid ${c.slate300}` }}>
                <QRCodeCanvas
                  id="student-qr-pass"
                  value={qrValue}
                  size={56}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />
              </div>
              <p className="text-[6.5px] font-semibold mt-1 leading-tight" style={{ color: c.ink600 }}>
                Scan to Verify
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-3.5 py-1.5 flex items-center justify-between text-[7.5px]"
            style={{ borderTop: `1px solid ${c.slate200}`, color: c.ink600 }}
          >
            <div>
              <span className="uppercase" style={{ color: c.ink400 }}>
                Card ID:{" "}
              </span>
              <span className="font-semibold" style={{ color: c.ink800 }}>
                {cardNo}
              </span>
            </div>
            <div>
              <span className="uppercase" style={{ color: c.ink400 }}>
                Batch:{" "}
              </span>
              <span className="font-medium" style={{ color: c.ink800 }}>
                {academicBatch}
              </span>
            </div>
            <div>
              <span className="uppercase" style={{ color: c.ink400 }}>
                Valid:{" "}
              </span>
              <span className="font-semibold" style={{ color: c.ink800 }}>
                {validUntil}
              </span>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          id="pvc-cr80-back"
          className={`${!isFlipped ? "hidden" : "block"} w-full aspect-[85.6/53.98] rounded-xl flex flex-col justify-between relative overflow-hidden`}
          style={{ backgroundColor: c.white, border: `1px solid ${c.slate300}` }}
        >
          <div className="px-3.5 py-2 flex items-center justify-between" style={{ backgroundColor: c.ink900 }}>
            <h3 className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: c.white }}>
              Emergency Contacts & Instructions
            </h3>
            <img
              src={universityLogo}
              alt="JNTUGV Logo"
              className="h-5 w-5 object-contain rounded-full p-0.5"
              style={{ backgroundColor: c.white, border: `1px solid rgba(255,255,255,0.6)` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 px-3.5 py-2 flex-1">
            <div
              className="space-y-1 p-2 rounded text-[8px]"
              style={{ backgroundColor: c.slate50, border: `1px solid ${c.slate200}` }}
            >
              <p
                className="text-[7px] font-bold uppercase tracking-wide flex items-center gap-1"
                style={{ color: c.ink700 }}
              >
                <Phone className="h-2.5 w-2.5" /> Emergency Contacts
              </p>
              <div className="space-y-0.5 text-[7.5px]">
                <p>
                  <span style={{ color: c.ink500 }}>Student: </span>
                  <span className="font-semibold" style={{ color: c.ink800 }}>
                    {studentPhone}
                  </span>
                </p>
                <p>
                  <span style={{ color: c.ink500 }}>Parent/Guardian: </span>
                  <span className="font-semibold" style={{ color: c.ink800 }}>
                    {emergencyContact}
                  </span>
                </p>
                <p>
                  <span style={{ color: c.ink500 }}>Hostel Warden: </span>
                  <span className="font-semibold" style={{ color: c.ink800 }}>
                    +91 8912856000
                  </span>
                </p>
              </div>
            </div>

            <div
              className="space-y-1 p-2 rounded text-[7.5px]"
              style={{ backgroundColor: c.slate50, border: `1px solid ${c.slate200}` }}
            >
              <p
                className="text-[7px] font-bold uppercase tracking-wide flex items-center gap-1"
                style={{ color: c.ink700 }}
              >
                <FileCheck2 className="h-2.5 w-2.5" /> Card Instructions
              </p>
              <ul className="space-y-0.5 list-disc list-inside text-[7px]" style={{ color: c.ink700 }}>
                <li>This card is non-transferable.</li>
                <li>Produce on demand at gate & mess.</li>
                <li>Property of JNTUGV University.</li>
              </ul>
            </div>
          </div>

          <div
            className="px-3.5 py-1.5 flex items-center justify-between"
            style={{ borderTop: `1px solid ${c.slate200}` }}
          >
            <p className="text-[7px]" style={{ color: c.ink500 }}>
              <span className="uppercase" style={{ color: c.ink400 }}>
                Card ID:{" "}
              </span>
              <span className="font-semibold" style={{ color: c.ink800 }}>
                {cardNo}
              </span>
            </p>

            <div className="text-right">
              <div className="w-24 mb-0.5" style={{ borderBottom: `1px dashed ${c.ink400}` }} />
              <p className="text-[6.5px] uppercase" style={{ color: c.ink500 }}>
                Authorized Signature
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Downloads */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => downloadCardSide("pvc-cr80-front", "Front")}
          variant="outline"
          disabled={downloading !== null}
          className="gap-1.5 text-xs font-medium"
        >
          <Download className="h-3.5 w-3.5" />
          {downloading === "front" ? "Rendering..." : "Download Front"}
        </Button>
        <Button
          onClick={() => downloadCardSide("pvc-cr80-back", "Back")}
          variant="outline"
          disabled={downloading !== null}
          className="gap-1.5 text-xs font-medium"
        >
          <Download className="h-3.5 w-3.5" />
          {downloading === "back" ? "Rendering..." : "Download Back"}
        </Button>
      </div>
    </div>
  );
}
