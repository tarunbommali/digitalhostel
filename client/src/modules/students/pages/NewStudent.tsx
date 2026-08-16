import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/core/components/ui/phone-input";
import { Button } from "@/core/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";

export function NewStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    registrationNumber: "",
    email: "",
    password: "Password#123",
    programType: "UG" as "UG" | "PG",
    departmentId: "",
    academicYearId: "",
    bloodGroup: "B+",
    guardianPhone: "",
    photoUrl: "",
  });

  const [countryCode, setCountryCode] = useState("+91");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [guardianCountryCode, setGuardianCountryCode] = useState("+91");
  const [guardianPhoneDigits, setGuardianPhoneDigits] = useState("");

  const [depts, setDepts] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  // Dialog state for inline creation
  const [newDeptName, setNewDeptName] = useState("");
  const [newYearName, setNewYearName] = useState("");
  const [busyDept, setBusyDept] = useState(false);
  const [busyYear, setBusyYear] = useState(false);
  const [openDeptDialog, setOpenDeptDialog] = useState(false);
  const [openYearDialog, setOpenYearDialog] = useState(false);

  const fetchLookups = useCallback(() => {
    api
      .get<any[]>("/lookups/departments")
      .then(setDepts)
      .catch((err) => toast.error(err.message || "Failed to load departments"));
    api
      .get<any[]>("/lookups/academic-years")
      .then(setYears)
      .catch((err) => toast.error(err.message || "Failed to load academic years"));
  }, []);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  const quickAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setBusyDept(true);
    try {
      const d: any = await api.post("/lookups/departments", { name: newDeptName });
      toast.success(`Department "${d.name}" created`);
      setForm((prev) => ({ ...prev, departmentId: d._id }));
      setNewDeptName("");
      setOpenDeptDialog(false);
      fetchLookups();
    } catch (err: any) {
      toast.error(err.message || "Failed to add department");
    } finally {
      setBusyDept(false);
    }
  };

  const quickAddAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearName.trim()) return;
    setBusyYear(true);
    try {
      const y: any = await api.post("/lookups/academic-years", { name: newYearName });
      toast.success(`Academic Year "${y.name}" created`);
      setForm((prev) => ({ ...prev, academicYearId: y._id }));
      setNewYearName("");
      setOpenYearDialog(false);
      fetchLookups();
    } catch (err: any) {
      toast.error(err.message || "Failed to add academic year");
    } finally {
      setBusyYear(false);
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.departmentId || !form.academicYearId) {
      toast.error("Please select a Department and Academic Year");
      return;
    }
    setBusy(true);
    const fullPhone = phoneDigits.trim() ? `${countryCode} ${phoneDigits.trim()}` : "";
    const fullGuardianPhone = guardianPhoneDigits.trim()
      ? `${guardianCountryCode} ${guardianPhoneDigits.trim()}`
      : "";

    try {
      const r: any = await api.post("/students", {
        ...form,
        phone: fullPhone,
        guardianPhone: fullGuardianPhone,
        emergencyContact: fullGuardianPhone,
      });
      toast.success(`Student created · Hostel UID ${r.student.hostelUid}`);
      navigate("/students");
    } catch (err: any) {
      toast.error(err.message || "Failed to create student");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" /> New Student Registration
          </h1>
          <p className="text-sm text-muted-foreground">
            A unique 6-digit Hostel UID will be generated automatically.
          </p>
        </div>
        <Breadcrumbs />
      </div>

      <Card className="p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label>First Name *</Label>
            <Input
              required
              placeholder="e.g. Rahul"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Last Name *</Label>
            <Input
              required
              placeholder="e.g. Sharma"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Registration Number *</Label>
            <Input
              required
              placeholder="e.g. 21B91A0501"
              value={form.registrationNumber}
              onChange={(e) =>
                setForm({ ...form, registrationNumber: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Student Phone Number</Label>
            <PhoneInput
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              phoneDigits={phoneDigits}
              setPhoneDigits={setPhoneDigits}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Parent / Guardian Emergency Contact</Label>
            <PhoneInput
              countryCode={guardianCountryCode}
              setCountryCode={setGuardianCountryCode}
              phoneDigits={guardianPhoneDigits}
              setPhoneDigits={setGuardianPhoneDigits}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Blood Group</Label>
            <Select
              value={form.bloodGroup}
              onValueChange={(v) => setForm({ ...form, bloodGroup: v })}
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
              value={form.photoUrl}
              onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Email Address *</Label>
            <Input
              required
              type="email"
              placeholder="student@hostel.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Default Password (Visible) *</Label>
            <Input
              required
              type="text"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="font-mono bg-accent/10 border-primary/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Program</Label>
            <Select
              value={form.programType}
              onValueChange={(v) =>
                setForm({ ...form, programType: v as "UG" | "PG" })
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

          {/* Department Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Department</Label>
              <Dialog open={openDeptDialog} onOpenChange={setOpenDeptDialog}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Plus className="h-3 w-3" /> Add New
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Department</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={quickAddDepartment} className="space-y-4 pt-2">
                    <div>
                      <Label>Department Name</Label>
                      <Input
                        required
                        placeholder="e.g. Artificial Intelligence"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpenDeptDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={busyDept}>
                        {busyDept && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Select
              value={form.departmentId}
              onValueChange={(v) => setForm({ ...form, departmentId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department…" />
              </SelectTrigger>
              <SelectContent>
                {depts.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Academic Year Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Academic Year</Label>
              <Dialog open={openYearDialog} onOpenChange={setOpenYearDialog}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Plus className="h-3 w-3" /> Add New
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Academic Year</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={quickAddAcademicYear} className="space-y-4 pt-2">
                    <div>
                      <Label>Academic Year Label</Label>
                      <Input
                        required
                        placeholder="e.g. 2024-2028"
                        value={newYearName}
                        onChange={(e) => setNewYearName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpenYearDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={busyYear}>
                        {busyYear && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Select
              value={form.academicYearId}
              onValueChange={(v) => setForm({ ...form, academicYearId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Academic Year…" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y._id} value={y._id}>
                    {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/students")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy || !form.departmentId || !form.academicYearId}
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Student
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default NewStudent;
