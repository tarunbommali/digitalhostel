import { Card } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { User } from "lucide-react";

export function StudentProfileCard({ s, bed }: { s: any; bed: any }) {
  if (!s) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 font-semibold text-base border-b pb-3 mb-4">
        <User className="h-5 w-5 text-primary" />
        <span>Read-Only Profile Information</span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-sm">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Full Name
          </p>
          <p className="font-medium text-base mt-0.5">{s.fullName}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Hostel 6-Digit UID
          </p>
          <p className="font-mono font-bold text-primary mt-0.5">
            {s.hostelUid}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Registration Number
          </p>
          <p className="font-mono font-medium mt-0.5">
            {s.registrationNumber || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Email Address
          </p>
          <p className="font-medium mt-0.5">{s.email}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Phone Number
          </p>
          <p className="font-medium mt-0.5">{s.phone || "+91 (Not Provided)"}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Program Type
          </p>
          <Badge variant="outline" className="mt-0.5">
            {s.programType || "UG"}
          </Badge>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Department
          </p>
          <p className="font-medium mt-0.5">{s.department?.name || "—"}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Academic Batch
          </p>
          <p className="font-medium mt-0.5">{s.academicYear?.name || "—"}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Room Allocation
          </p>
          <p className="font-medium mt-0.5">
            {bed
              ? `${bed.rooms?.hostelBlocks?.name || "Block"} · Room ${
                  bed.rooms?.roomNumber
                } (Bed ${bed.bedNumber})`
              : "No Active Room Allocated"}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t flex items-center justify-between">
        <span className="text-xs text-muted-foreground italic">
          Managed by Hostel Administration
        </span>
        <Badge variant="default" className="capitalize">
          {s.status || "Active"}
        </Badge>
      </div>
    </Card>
  );
}
