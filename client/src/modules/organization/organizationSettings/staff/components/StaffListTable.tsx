import React from "react";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { EmptyState } from "@/core/components/ui/EmptyState";
import { formatPhoneNumber } from "@/utils/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { useNavigate, useParams } from "react-router-dom";
import {
  UserCheck,
  UserX,
  ShieldCheck,
  Utensils,
  Edit,
  QrCode,
  ShieldAlert,
  Users,
  DoorOpen,
} from "lucide-react";

interface StaffListTableProps {
  loading: boolean;
  mods: any[];
  toggleActive: (id: string, active: boolean) => void;
  openEditModal?: (staff: any) => void;
}

export function StaffListTable({
  loading,
  mods,
  toggleActive,
  openEditModal,
}: StaffListTableProps) {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";
  const getStaffResponsibilityBadge = (m: any) => {
    switch (m.moderatorType) {
      case "full":
        return (
          <div className="flex flex-wrap gap-1">
            <Badge variant="brand" size="sm" className="gap-1 text-[11px]">
              <Users className="w-3 h-3" /> Residents (Full)
            </Badge>
            <Badge variant="warning" size="sm" className="gap-1 text-[11px]">
              <DoorOpen className="w-3 h-3" /> Operations (Full)
            </Badge>
          </div>
        );
      case "security_guard":
        return (
          <Badge variant="neutral" size="sm" className="gap-1 text-[11px] border-blue-500/30 text-blue-400 bg-blue-500/10">
            <QrCode className="w-3 h-3" /> Gate Scanner & Outpass
          </Badge>
        );
      case "attendance_only":
        return (
          <Badge variant="neutral" size="sm" className="gap-1 text-[11px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            <Utensils className="w-3 h-3" /> Meal Attendance
          </Badge>
        );
      case "discipline_monitor":
        return (
          <Badge variant="danger" size="sm" className="gap-1 text-[11px]">
            <ShieldAlert className="w-3 h-3" /> Discipline & Incidents
          </Badge>
        );
      case "administration":
      default:
        return (
          <Badge variant="neutral" size="sm" className="gap-1 text-[11px]">
            <Users className="w-3 h-3" /> Residents Management
          </Badge>
        );
    }
  };

  return (
    <Card className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4 mb-4">
        <div>
          <h2 className="font-semibold text-sm flex items-center gap-2 text-[var(--text-primary)]">
            <ShieldCheck className="h-4 w-4 text-[var(--tenant-primary)]" />
            Staff Accounts & Active Directory ({mods.length})
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Active staff members, assigned hostel wings, and operational responsibilities.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`${basePath}/settings/staff/new`)}
          className="gap-1.5 text-xs shrink-0 self-start sm:self-center"
        >
          <Users className="w-3.5 h-3.5" />
          Create Moderator
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-[var(--color-border)]">
            <TableHead className="text-xs text-[var(--text-muted)]">Staff Member</TableHead>
            <TableHead className="text-xs text-[var(--text-muted)]">Phone</TableHead>
            <TableHead className="text-xs text-[var(--text-muted)]">Assigned Responsibilities</TableHead>
            <TableHead className="text-xs text-[var(--text-muted)]">Status</TableHead>
            <TableHead className="text-right text-xs text-[var(--text-muted)]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-xs text-[var(--text-muted)] py-8"
              >
                Loading staff members…
              </TableCell>
            </TableRow>
          )}
          {!loading && mods.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8">
                <EmptyState
                  title="No staff members created yet."
                  description="Add new staff accounts and assign operational responsibilities."
                  icon={Users}
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`${basePath}/settings/staff/new`)}
                      className="gap-1.5 text-xs"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Create Moderator
                    </Button>
                  }
                />
              </TableCell>
            </TableRow>
          )}
          {mods.map((m) => {
            return (
              <TableRow key={m._id} className="border-[var(--color-border)]">
                <TableCell>
                  <div>
                    <p className="font-medium text-xs text-[var(--text-primary)]">
                      {m.fullName || `${m.firstName || ""} ${m.lastName || ""}`.trim()}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">{m.email}</p>
                    <div className="mt-1">
                      <Badge variant="neutral" size="sm" className="text-[10px] py-0 font-medium">
                        {m.gender === "female" || m.assignedGenderHostel === "girls"
                          ? "👩 Girls Hostel Access"
                          : "👨 Boys Hostel Access"}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-mono text-[var(--text-secondary)]">
                  {m.phone ? formatPhoneNumber(m.phone) : "—"}
                </TableCell>
                <TableCell>
                  {getStaffResponsibilityBadge(m)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={m.isActive ? "success" : "neutral"}
                    size="sm"
                    className="capitalize text-[11px]"
                  >
                    {m.isActive ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`${basePath}/settings/staff/${m._id}/edit`)}
                    title="Edit Staff Responsibilities"
                    className="h-7 w-7 p-0"
                  >
                    <Edit className="h-3.5 w-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(m._id, !m.isActive)}
                    title={m.isActive ? "Disable Staff Account" : "Enable Staff Account"}
                    className="h-7 w-7 p-0"
                  >
                    {m.isActive ? (
                      <UserX className="h-3.5 w-3.5 text-[var(--color-danger)]" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
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
