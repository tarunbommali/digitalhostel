import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "@/core/lib/api";
import { useAuth } from "@/core/context/auth-context";
import { useDebounce } from "@/utils/useDebounce";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { StudentsFilterBar } from "../components/StudentsFilterBar";
import { StudentsTable } from "../components/StudentsTable";
import { EditStudentModal } from "../components/EditStudentModal";
import { StudentsPagination } from "../components/StudentsPagination";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";

export function StudentsPage() {
  const { role } = useAuth();

  // Filter & Pagination States
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [duesFilter, setDuesFilter] = useState("all");
  const [sortBy, setSortBy] = useState("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const limit = 100;

  // Data states
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editCountryCode, setEditCountryCode] = useState("+91");
  const [editPhoneDigits, setEditPhoneDigits] = useState("");
  const [editGuardianCountryCode, setEditGuardianCountryCode] = useState("+91");
  const [editGuardianPhoneDigits, setEditGuardianPhoneDigits] = useState("");

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
    registrationNumber: "",
    email: "",
    phone: "",
    programType: "UG",
    departmentId: "",
    academicYearId: "",
    bloodGroup: "B+",
    guardianPhone: "",
    emergencyContact: "",
    photoUrl: "",
    status: "active",
  });
  const [busyEdit, setBusyEdit] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<any[]>("/lookups/departments"),
      api.get<any[]>("/lookups/academic-years"),
    ])
      .then(([depts, years]) => {
        setDepartments(depts);
        setAcademicYears(years);
      })
      .catch(console.error);
  }, []);

  const fetchStudents = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (debouncedQ.trim()) params.set("search", debouncedQ.trim());
    if (selectedDept !== "all") params.set("department", selectedDept);
    if (selectedYear !== "all") params.set("academicYear", selectedYear);
    if (selectedProgram !== "all") params.set("programType", selectedProgram);
    if (selectedGender !== "all") params.set("gender", selectedGender);
    if (duesFilter !== "all") params.set("dues", duesFilter);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    api
      .get<any>(`/students?${params.toString()}`)
      .then((res) => {
        if (res && res.students) {
          setStudents(res.students);
          setTotal(res.total || 0);
          setTotalPages(res.totalPages || 1);
        } else if (Array.isArray(res)) {
          setStudents(res);
          setTotal(res.length);
          setTotalPages(1);
        }
      })
      .catch((err) => toast.error(err.message || "Failed to load students"))
      .finally(() => setLoading(false));
  }, [page, debouncedQ, selectedDept, selectedYear, selectedProgram, selectedGender, duesFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const openEditModal = (student: any) => {
    setEditingStudentId(student._id);
    const rawPhone = student.phone || "";
    const digitsOnly = rawPhone.replace(/\D/g, "");
    setEditCountryCode("+91");
    setEditPhoneDigits(digitsOnly.slice(-10));

    const rawGuardianPhone = student.guardianPhone || student.emergencyContact || "";
    const gDigitsOnly = rawGuardianPhone.replace(/\D/g, "");
    setEditGuardianCountryCode("+91");
    setEditGuardianPhoneDigits(gDigitsOnly.slice(-10));

    const fName = student.firstName || (student.fullName || "").split(" ")[0] || "";
    const lName = student.lastName || (student.fullName || "").split(" ").slice(1).join(" ") || "";

    setEditForm({
      firstName: fName,
      lastName: lName,
      fullName: student.fullName || `${fName} ${lName}`,
      registrationNumber: student.registrationNumber || "",
      email: student.email || "",
      phone: student.phone || "",
      programType: student.programType || "UG",
      departmentId: student.department?._id || student.department || "",
      academicYearId: student.academicYear?._id || student.academicYear || "",
      bloodGroup: student.bloodGroup || "B+",
      guardianPhone: student.guardianPhone || student.emergencyContact || "",
      emergencyContact: student.emergencyContact || student.guardianPhone || "",
      photoUrl: student.photoUrl || "",
      status: student.status || "active",
    });
    setEditModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentId) return;
    setBusyEdit(true);

    const fullPhone = editPhoneDigits.trim()
      ? `${editCountryCode} ${editPhoneDigits.trim()}`
      : "";

    const fullGuardianPhone = editGuardianPhoneDigits.trim()
      ? `${editGuardianCountryCode} ${editGuardianPhoneDigits.trim()}`
      : "";

    try {
      await api.put(`/students/${editingStudentId}`, {
        ...editForm,
        phone: fullPhone,
        guardianPhone: fullGuardianPhone,
        emergencyContact: fullGuardianPhone,
      });
      toast.success("Student profile updated successfully");
      setEditModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to update student profile");
    } finally {
      setBusyEdit(false);
    }
  };

  const handleRenewPass = async (id: string, name: string) => {
    try {
      const res: any = await api.put(`/students/${id}/renew-pass`, {});
      const dateStr = new Date(res.validUntil).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      toast.success(`Digital ID card for ${name} renewed until ${dateStr}`);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to renew ID pass");
    }
  };

  const toggleStatus = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/students/${id}/status`, { active: !currentActive });
      toast.success(`Student ${!currentActive ? "enabled" : "disabled"} successfully`);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Students Directory</h1>
            <p className="text-sm text-muted-foreground">
              Manage student registrations, departments, dues, and statuses ({total} total)
            </p>
          </div>
          {(role === "admin" || role === "moderator") && (
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="import"><Plus className="mr-2 h-4 w-4" /> Import CSV</Link>
              </Button>
              <Button asChild>
                <Link to="new"><Plus className="mr-2 h-4 w-4" /> New Student</Link>
              </Button>
            </div>
          )}
        </div>
        <Breadcrumbs />
      </div>

      <StudentsFilterBar
        q={q} setQ={setQ}
        selectedGender={selectedGender} setSelectedGender={setSelectedGender}
        selectedProgram={selectedProgram} setSelectedProgram={setSelectedProgram}
        selectedDept={selectedDept} setSelectedDept={setSelectedDept}
        selectedYear={selectedYear} setSelectedYear={setSelectedYear}
        duesFilter={duesFilter} setDuesFilter={setDuesFilter}
        sortBy={sortBy} setSortBy={setSortBy}
        sortOrder={sortOrder} toggleSortOrder={() => { setSortOrder((p) => (p === "asc" ? "desc" : "asc")); setPage(1); }}
        departments={departments} academicYears={academicYears} setPage={setPage}
      />

      <Card>
        <StudentsTable loading={loading} students={students} role={role} openEditModal={openEditModal} toggleStatus={toggleStatus} />
        <StudentsPagination total={total} page={page} limit={limit} totalPages={totalPages} loading={loading} setPage={setPage} />
      </Card>

      <EditStudentModal
        editModalOpen={editModalOpen} setEditModalOpen={setEditModalOpen}
        editForm={editForm} setEditForm={setEditForm}
        editCountryCode={editCountryCode} setEditCountryCode={setEditCountryCode}
        editPhoneDigits={editPhoneDigits} setEditPhoneDigits={setEditPhoneDigits}
        editGuardianCountryCode={editGuardianCountryCode} setEditGuardianCountryCode={setEditGuardianCountryCode}
        editGuardianPhoneDigits={editGuardianPhoneDigits} setEditGuardianPhoneDigits={setEditGuardianPhoneDigits}
        departments={departments} academicYears={academicYears}
        busyEdit={busyEdit} handleUpdateStudent={handleUpdateStudent}
        onRenewPass={() => editingStudentId && handleRenewPass(editingStudentId, editForm.fullName)}
      />
    </div>
  );
}

export default StudentsPage;
