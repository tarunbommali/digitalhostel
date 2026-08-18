import { useState, useMemo, useCallback } from "react";
import { Student } from "../types/student.types";
import { useDebounce } from "@/utils/useDebounce";

export const useStudentFilters = (students: Student[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [duesFilter, setDuesFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string>("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        // Search Filter (Full Name, Email, Registration Number, Hostel UID)
        if (debouncedSearch.trim()) {
          const q = debouncedSearch.toLowerCase().trim();
          const fullName = (
            student.fullName || `${student.firstName || ""} ${student.lastName || ""}`
          ).toLowerCase();
          const matchesName = fullName.includes(q);
          const matchesEmail = (student.email || "").toLowerCase().includes(q);
          const matchesReg = (student.registrationNumber || "").toLowerCase().includes(q);
          const matchesUid = (student.hostelUid || "").toLowerCase().includes(q);
          if (!matchesName && !matchesEmail && !matchesReg && !matchesUid) return false;
        }

        // Department filter
        if (departmentFilter !== "all") {
          const deptId =
            typeof student.department === "object" && student.department !== null
              ? student.department._id
              : student.department;
          if (deptId !== departmentFilter) return false;
        }

        // Academic Year filter
        if (yearFilter !== "all") {
          const yearId =
            typeof student.academicYear === "object" && student.academicYear !== null
              ? student.academicYear._id
              : student.academicYear;
          if (yearId !== yearFilter) return false;
        }

        // Program filter
        if (programFilter !== "all" && student.programType !== programFilter) {
          return false;
        }

        // Gender filter
        if (genderFilter !== "all" && (student.gender || "").toLowerCase() !== genderFilter.toLowerCase()) {
          return false;
        }

        // Dues filter
        if (duesFilter === "with_dues" && (student.dues || 0) <= 0) return false;
        if (duesFilter === "no_dues" && (student.dues || 0) > 0) return false;

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "fullName": {
            const nameA = (a.fullName || `${a.firstName || ""} ${a.lastName || ""}`).toLowerCase();
            const nameB = (b.fullName || `${b.firstName || ""} ${b.lastName || ""}`).toLowerCase();
            comparison = nameA.localeCompare(nameB);
            break;
          }
          case "registrationNumber":
            comparison = (a.registrationNumber || "").localeCompare(b.registrationNumber || "");
            break;
          case "dues":
            comparison = (a.dues || 0) - (b.dues || 0);
            break;
          default:
            comparison = 0;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [
    students,
    debouncedSearch,
    departmentFilter,
    yearFilter,
    programFilter,
    genderFilter,
    duesFilter,
    sortBy,
    sortOrder,
  ]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setDepartmentFilter("all");
    setYearFilter("all");
    setProgramFilter("all");
    setGenderFilter("all");
    setDuesFilter("all");
    setSortBy("fullName");
    setSortOrder("asc");
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm !== "" ||
      departmentFilter !== "all" ||
      yearFilter !== "all" ||
      programFilter !== "all" ||
      genderFilter !== "all" ||
      duesFilter !== "all"
    );
  }, [searchTerm, departmentFilter, yearFilter, programFilter, genderFilter, duesFilter]);

  return {
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
    hasActiveFilters,
  };
};

export default useStudentFilters;
