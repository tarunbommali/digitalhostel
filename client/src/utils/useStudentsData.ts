import { useState, useEffect, useCallback } from "react";
import { api } from "@/core/lib/api";
import { toast } from "sonner";
import { useDebounce } from "./useDebounce";
import { API_ENDPOINTS } from "./constants";

export function useStudentsData() {
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

  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

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
      .get<any>(`${API_ENDPOINTS.STUDENTS}?${params.toString()}`)
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
  }, [
    page,
    debouncedQ,
    selectedDept,
    selectedYear,
    selectedProgram,
    selectedGender,
    duesFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    q,
    setQ,
    selectedDept,
    setSelectedDept,
    selectedYear,
    setSelectedYear,
    selectedProgram,
    setSelectedProgram,
    selectedGender,
    setSelectedGender,
    duesFilter,
    setDuesFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    students,
    departments,
    academicYears,
    total,
    totalPages,
    loading,
    fetchStudents,
  };
}

export default useStudentsData;
