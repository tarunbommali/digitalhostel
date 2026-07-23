import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { UserCheck, UserX, ShieldCheck, Utensils, Flag } from "lucide-react";

interface StaffListTableProps {
  loading: boolean;
  mods: any[];
  toggleActive: (id: string, active: boolean) => void;
}

export function StaffListTable({
  loading,
  mods,
  toggleActive,
}: StaffListTableProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <h2 className="font-semibold text-base">
          Staff Members ({mods.length})
        </h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Name & Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Privilege Level / Specific Access</TableHead>
            <TableHead>Account Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-sm text-muted-foreground py-6"
              >
                Loading staff members…
              </TableCell>
            </TableRow>
          )}
          {!loading && mods.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-sm text-muted-foreground py-6"
              >
                No staff members created yet.
              </TableCell>
            </TableRow>
          )}
          {mods.map((m) => {
            const isFull =
              m.moderatorType === "administration" ||
              m.moderatorType === "full";
            const isDiscipline = m.moderatorType === "discipline_monitor";

            return (
              <TableRow key={m._id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{m.fullName || `${m.firstName || ""} ${m.lastName || ""}`.trim()}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-[10px] py-0 font-medium">
                        {m.gender === "female" || m.assignedGenderHostel === "girls"
                          ? "👩 Girls Hostel Warden"
                          : "👨 Boys Hostel Warden"}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-xs">
                  {m.phone || "+91 (Not Provided)"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      isFull
                        ? "default"
                        : isDiscipline
                        ? "destructive"
                        : "secondary"
                    }
                    className="capitalize gap-1 text-xs font-medium"
                  >
                    {isFull ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" /> Administration
                      </>
                    ) : isDiscipline ? (
                      <>
                        <Flag className="h-3.5 w-3.5" /> Discipline Warden
                      </>
                    ) : (
                      <>
                        <Utensils className="h-3.5 w-3.5" /> Attendance Only
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={m.isActive ? "default" : "secondary"}
                    className="capitalize text-xs"
                  >
                    {m.isActive ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(m._id, m.isActive)}
                  >
                    {m.isActive ? (
                      <UserX className="h-4 w-4 text-destructive" />
                    ) : (
                      <UserCheck className="h-4 w-4 text-emerald-600" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
