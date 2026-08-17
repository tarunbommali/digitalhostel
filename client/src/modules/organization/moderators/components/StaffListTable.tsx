import React from "react";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPhoneNumber } from "@/utils/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { UserCheck, UserX, ShieldCheck, Utensils, Edit, QrCode, ShieldAlert, Users } from "lucide-react";

interface StaffListTableProps {
  loading: boolean;
  mods: any[];
  toggleActive: (id: string, active: boolean) => void;
  openEditModal: (staff: any) => void;
}

export function StaffListTable({
  loading,
  mods,
  toggleActive,
  openEditModal,
}: StaffListTableProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <h2 className="font-semibold text-base flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Staff Accounts & Operational Privileges ({mods.length})
        </h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Name & Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Operational Privileges & Access Level</TableHead>
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
              <TableCell colSpan={5} className="py-6">
                <EmptyState
                  message="No staff members created yet."
                  description="Use the form above to add new staff and configure access privileges."
                  icon={Users}
                />
              </TableCell>
            </TableRow>
          )}
          {mods.map((m) => {
            const isFull =
              m.moderatorType === "administration" ||
              m.moderatorType === "full";
            const isDiscipline = m.moderatorType === "discipline_monitor";
            const isSecurity =
              m.role === "security_guard" || m.moderatorType === "security_guard";

            return (
              <TableRow key={m._id}>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {m.fullName || `${m.firstName || ""} ${m.lastName || ""}`.trim()}
                    </p>
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
                  {m.phone ? formatPhoneNumber(m.phone) : "+91 (Not Provided)"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                    {isFull && (
                      <Badge variant="default" className="gap-1 text-[11px] font-medium">
                        <Users className="h-3 w-3" /> Full Student Operations
                      </Badge>
                    )}
                    {isSecurity && (
                      <Badge variant="outline" className="gap-1 text-[11px] font-medium border-blue-500/30 text-blue-400 bg-blue-500/10">
                        <QrCode className="h-3 w-3" /> Security Gate Outpass
                      </Badge>
                    )}
                    {m.moderatorType === "attendance_only" && (
                      <Badge variant="secondary" className="gap-1 text-[11px] font-medium">
                        <Utensils className="h-3 w-3" /> Mess Attendance
                      </Badge>
                    )}
                    {isDiscipline && (
                      <Badge variant="destructive" className="gap-1 text-[11px] font-medium">
                        <ShieldAlert className="h-3 w-3" /> Discipline & Flags
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={m.isActive ? "default" : "secondary"}
                    className="capitalize text-xs"
                  >
                    {m.isActive ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditModal(m)}
                    title="Edit Staff Privileges"
                  >
                    <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(m._id, !m.isActive)}
                    title={m.isActive ? "Disable Staff Account" : "Enable Staff Account"}
                  >
                    {m.isActive ? (
                      <UserX className="h-4 w-4 text-destructive" />
                    ) : (
                      <UserCheck className="h-4 w-4 text-emerald-500" />
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
