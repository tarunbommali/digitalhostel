import React from "react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { PhoneInput } from "@/core/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Pencil, Loader2, RefreshCw } from "lucide-react";

interface EditStudentModalProps {
  editModalOpen: boolean;
  setEditModalOpen: (open: boolean) => void;
  editForm: any;
  setEditForm: (form: any) => void;
  editCountryCode: string;
  setEditCountryCode: (code: string) => void;
  editPhoneDigits: string;
  setEditPhoneDigits: (digits: string) => void;
  editGuardianCountryCode: string;
  setEditGuardianCountryCode: (code: string) => void;
  editGuardianPhoneDigits: string;
  setEditGuardianPhoneDigits: (digits: string) => void;
  departments: any[];
  academicYears: any[];
  busyEdit: boolean;
  handleUpdateStudent: (e: React.FormEvent) => void;
  onRenewPass?: () => void;
}

export function EditStudentModal({
  editModalOpen,
  setEditModalOpen,
  editForm,
  setEditForm,
  editCountryCode,
  setEditCountryCode,
  editPhoneDigits,
  setEditPhoneDigits,
  editGuardianCountryCode,
  setEditGuardianCountryCode,
  editGuardianPhoneDigits,
  setEditGuardianPhoneDigits,
  departments,
  academicYears,
  busyEdit,
  handleUpdateStudent,
  onRenewPass,
}: EditStudentModalProps) {
  return (
    <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" /> Edit Student Profile
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleUpdateStudent}
          className="grid gap-4 md:grid-cols-2 pt-2"
        >
          <div className="space-y-1.5">
            <Label>First Name</Label>
            <Input
              required
              value={editForm.firstName}
              onChange={(e) =>
                setEditForm({ ...editForm, firstName: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Last Name</Label>
            <Input
              required
              value={editForm.lastName}
              onChange={(e) =>
                setEditForm({ ...editForm, lastName: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Registration Number</Label>
            <Input
              required
              value={editForm.registrationNumber}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  registrationNumber: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Student Phone Number</Label>
            <PhoneInput
              countryCode={editCountryCode}
              setCountryCode={setEditCountryCode}
              phoneDigits={editPhoneDigits}
              setPhoneDigits={setEditPhoneDigits}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Parent / Guardian Emergency Contact</Label>
            <PhoneInput
              countryCode={editGuardianCountryCode}
              setCountryCode={setEditGuardianCountryCode}
              phoneDigits={editGuardianPhoneDigits}
              setPhoneDigits={setEditGuardianPhoneDigits}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Blood Group</Label>
            <Select
              value={editForm.bloodGroup || "B+"}
              onValueChange={(v) => setEditForm({ ...editForm, bloodGroup: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                  <SelectItem key={bg} value={bg}>
                    {bg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Student Photo URL (Optional)</Label>
            <Input
              placeholder="https://example.com/photo.jpg"
              value={editForm.photoUrl || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, photoUrl: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label>Email Address</Label>
            <Input
              required
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Program</Label>
            <Select
              value={editForm.programType}
              onValueChange={(v) =>
                setEditForm({ ...editForm, programType: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UG">Undergraduate (UG)</SelectItem>
                <SelectItem value="PG">Postgraduate (PG)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Account Status</Label>
            <Select
              value={editForm.status}
              onValueChange={(v) => setEditForm({ ...editForm, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select
              value={editForm.departmentId}
              onValueChange={(v) =>
                setEditForm({ ...editForm, departmentId: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Academic Batch</Label>
            <Select
              value={editForm.academicYearId}
              onValueChange={(v) =>
                setEditForm({ ...editForm, academicYearId: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((y) => (
                  <SelectItem key={y._id} value={y._id}>
                    {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 pt-3 flex items-center justify-between">
            {onRenewPass && (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                onClick={onRenewPass}
              >
                <RefreshCw className="h-4 w-4" /> Renew ID Card (1 Year)
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busyEdit}>
                {busyEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
