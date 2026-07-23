import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Skeleton } from "@/core/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { Pencil, UserCheck, UserX } from "lucide-react";

interface StudentsTableProps {
  loading: boolean;
  students: any[];
  role: string | null;
  openEditModal: (student: any) => void;
  toggleStatus: (id: string, currentActive: boolean) => void;
}

export function StudentsTable({
  loading,
  students,
  role,
  openEditModal,
  toggleStatus,
}: StudentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">UID</TableHead>
          <TableHead>Student Name & Email</TableHead>
          <TableHead>Reg Number</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Academic Batch</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Pending Dues</TableHead>
          {role === "admin" && (
            <TableHead className="text-right">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading &&
          Array.from({ length: 6 }).map((_, idx) => (
            <TableRow key={idx} className="animate-pulse">
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              {role === "admin" && (
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                </TableCell>
              )}
            </TableRow>
          ))}
        {!loading && students.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={role === "admin" ? 8 : 7}
              className="text-center text-sm text-muted-foreground py-8"
            >
              No matching student records found.
            </TableCell>
          </TableRow>
        )}
        {students.map((s: any) => {
          const isActive = s.user
            ? s.user.isActive !== false
            : s.status !== "inactive";
          const hasDues = (s.dues || 0) > 0;

          return (
            <TableRow key={s._id}>
              <TableCell className="font-mono font-semibold">
                {s.hostelUid}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium leading-tight">{s.fullName}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {s.registrationNumber}
              </TableCell>
              <TableCell>{s.department?.name ?? "—"}</TableCell>
              <TableCell>{s.academicYear?.name ?? "—"}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    s.status === "graduated"
                      ? "outline"
                      : isActive
                      ? "default"
                      : "secondary"
                  }
                  className="capitalize"
                >
                  {s.status === "graduated"
                    ? "Graduated"
                    : isActive
                    ? "Active"
                    : "Disabled"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={hasDues ? "destructive" : "secondary"}
                  className="font-medium"
                >
                  {hasDues
                    ? `₹ ${s.dues.toLocaleString("en-IN")} Dues`
                    : "₹ 0 Paid"}
                </Badge>
              </TableCell>
              {role === "admin" && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModal(s)}
                      title="Edit Student Profile"
                    >
                      <Pencil className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleStatus(s._id, isActive)}
                      title={isActive ? "Disable Account" : "Enable Account"}
                    >
                      {isActive ? (
                        <UserX className="h-4 w-4 text-destructive" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
