import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, Upload, Lock } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useTenant } from "@/core/context/tenant-context";
import { useAuth } from "@/core/context/auth-context";
import { usePlanFeature } from "@/core/hooks/usePlanFeature";
import { useStudents } from "../context/students-context";
import { useStudentFilters } from "../hooks/useStudentFilters";
import { StudentsTable } from "../components/StudentsTable";
import { StudentsFilterBar } from "../components/StudentsFilterBar";
import { StudentsPagination } from "../components/StudentsPagination";
import { EditStudentModal } from "../components/EditStudentModal";
import { toast } from "sonner";

export function StudentsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { organization } = useTenant();
  const { role } = useAuth();
  const { isAllowed: canBulkImport } = usePlanFeature("bulkImport");

  const {
    students,
    total,
    totalPages,
    loading,
    departments,
    academicYears,
    filters,
    setFilters,
    updateStudent,
    toggleStudentStatus,
    renewStudentPass,
  } = useStudents();

  const {
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    yearFilter,
    setYearFilter,
    programFilter,
    setProgramFilter,
    genderFilter,
    setGenderFilter,
    duesFilter,
    setDuesFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredStudents,
    resetFilters,
  } = useStudentFilters(students);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editCountryCode, setEditCountryCode] = useState("+91");
  const [editPhoneDigits, setEditPhoneDigits] = useState("");
  const [editGuardianCountryCode, setEditGuardianCountryCode] = useState("+91");
  const [editGuardianPhoneDigits, setEditGuardianPhoneDigits] = useState("");
  const [busyEdit, setBusyEdit] = useState(false);

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

  useEffect(() => {
    document.title = `Students Directory | ${organization?.name || "Campus Stay"}`;
  }, [organization]);

  const openEditModal = (student: any) => {
    setEditingStudentId(student._id);

    const nameParts = (student.fullName || "").trim().split(" ");
    const fName = student.firstName || nameParts[0] || "";
    const lName = student.lastName || nameParts.slice(1).join(" ") || "";

    const rawPhone = student.phone || "";
    const digitsOnly = rawPhone.replace(/\D/g, "");
    setEditCountryCode("+91");
    setEditPhoneDigits(digitsOnly.slice(-10));

    const rawGPhone = student.guardianPhone || student.emergencyContact || "";
    const gDigitsOnly = rawGPhone.replace(/\D/g, "");
    setEditGuardianCountryCode("+91");
    setEditGuardianPhoneDigits(gDigitsOnly.slice(-10));

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
      await updateStudent(editingStudentId, {
        ...editForm,
        phone: fullPhone,
        guardianPhone: fullGuardianPhone,
        emergencyContact: fullGuardianPhone,
      });
      setEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update student profile");
    } finally {
      setBusyEdit(false);
    }
  };

  const handleRenewPass = async (id: string, name: string) => {
    await renewStudentPass(id, name);
  };

  const isAdminOrModerator = role === "admin" || role === "moderator";

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Standard Page Header */}
      <PageHeader
        eyebrow="Residents"
        title="Students Directory"
        description="Manage resident profiles, departments, fee dues, active status, and digital pass verification"
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `/organization/${slug}/dashboard` },
          { label: "Students Directory" },
        ]}
        actions={
          isAdminOrModerator ? (
            <div className="flex items-center gap-2.5">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link to="import">
                  {canBulkImport ? (
                    <Upload className="w-4 h-4" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>Bulk Import {!canBulkImport && "(PRO)"}</span>
                </Link>
              </Button>
              <Button asChild variant="primary" size="sm" className="gap-1.5 shadow-xs">
                <Link to="new">
                  <Plus className="w-4 h-4" />
                  <span>Register Student</span>
                </Link>
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Filter Controls */}
      <StudentsFilterBar
        q={searchTerm}
        setQ={setSearchTerm}
        selectedGender={genderFilter}
        setSelectedGender={setGenderFilter}
        selectedProgram={programFilter}
        setSelectedProgram={setProgramFilter}
        selectedDept={departmentFilter}
        setSelectedDept={setDepartmentFilter}
        selectedYear={yearFilter}
        setSelectedYear={setYearFilter}
        duesFilter={duesFilter}
        setDuesFilter={setDuesFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        toggleSortOrder={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        departments={departments}
        academicYears={academicYears}
        setPage={(page) => setFilters({ page })}
      />

      {/* Data Table */}
      <Card>
        <StudentsTable
          loading={loading}
          students={filteredStudents}
          role={role}
          openEditModal={openEditModal}
          toggleStatus={(id, currentActive) => toggleStudentStatus(id, currentActive)}
          renewPass={handleRenewPass}
        />
        <StudentsPagination
          total={total}
          page={filters.page}
          limit={filters.limit}
          totalPages={totalPages}
          loading={loading}
          setPage={(page) => setFilters({ page })}
        />
      </Card>

      {/* Edit Student Modal */}
      <EditStudentModal
        editModalOpen={editModalOpen}
        setEditModalOpen={setEditModalOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        editCountryCode={editCountryCode}
        setEditCountryCode={setEditCountryCode}
        editPhoneDigits={editPhoneDigits}
        setEditPhoneDigits={setEditPhoneDigits}
        editGuardianCountryCode={editGuardianCountryCode}
        setEditGuardianCountryCode={setEditGuardianCountryCode}
        editGuardianPhoneDigits={editGuardianPhoneDigits}
        setEditGuardianPhoneDigits={setEditGuardianPhoneDigits}
        departments={departments}
        academicYears={academicYears}
        busyEdit={busyEdit}
        handleUpdateStudent={handleUpdateStudent}
        onRenewPass={
          editingStudentId
            ? () => handleRenewPass(editingStudentId, editForm.fullName)
            : undefined
        }
      />
    </div>
  );
}

export default StudentsPage;
