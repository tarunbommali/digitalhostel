import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { Student, StudentFilters, Department, AcademicYear } from "../types/student.types";
import { api } from "@/core/lib/api";
import { toast } from "sonner";

interface StudentsContextValue {
  students: Student[];
  total: number;
  totalPages: number;
  loading: boolean;
  departments: Department[];
  academicYears: AcademicYear[];
  filters: StudentFilters;
  setFilters: (filters: Partial<StudentFilters>) => void;
  fetchStudents: (force?: boolean) => Promise<void>;
  fetchLookups: () => Promise<void>;
  addStudent: (data: any) => Promise<Student>;
  updateStudent: (id: string, data: any) => Promise<Student>;
  deleteStudent: (id: string) => Promise<void>;
  toggleStudentStatus: (id: string, currentStatus: boolean) => Promise<void>;
  renewStudentPass: (id: string, name: string) => Promise<void>;
  importStudents: (file: File) => Promise<any>;
  clearCache: () => void;
}

const defaultFilters: StudentFilters = {
  searchTerm: "",
  department: "all",
  year: "all",
  program: "all",
  gender: "all",
  dues: "all",
  sortBy: "fullName",
  sortOrder: "asc",
  page: 1,
  limit: 100,
};

const StudentsContext = createContext<StudentsContextValue | null>(null);

export const StudentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [filters, setFiltersState] = useState<StudentFilters>(defaultFilters);

  const inFlightRequestRef = useRef<Promise<any> | null>(null);
  const isFetchedRef = useRef(false);

  const setFilters = useCallback((newFilters: Partial<StudentFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const fetchLookups = useCallback(async () => {
    try {
      const [depts, years] = await Promise.all([
        api.get<Department[]>("/lookups/departments"),
        api.get<AcademicYear[]>("/lookups/academic-years"),
      ]);
      setDepartments(depts || []);
      setAcademicYears(years || []);
    } catch (err: any) {
      console.error("Failed to load departments or academic years:", err);
    }
  }, []);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  const fetchStudents = useCallback(async (force = false) => {
    if (inFlightRequestRef.current) {
      return inFlightRequestRef.current;
    }

    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", filters.page.toString());
    params.set("limit", filters.limit.toString());
    if (filters.searchTerm.trim()) params.set("search", filters.searchTerm.trim());
    if (filters.department && filters.department !== "all") params.set("department", filters.department);
    if (filters.year && filters.year !== "all") params.set("academicYear", filters.year);
    if (filters.program && filters.program !== "all") params.set("programType", filters.program);
    if (filters.gender && filters.gender !== "all") params.set("gender", filters.gender);
    if (filters.dues && filters.dues !== "all") params.set("dues", filters.dues);
    params.set("sortBy", filters.sortBy);
    params.set("sortOrder", filters.sortOrder);

    const request = api
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
        isFetchedRef.current = true;
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load students");
      })
      .finally(() => {
        setLoading(false);
        inFlightRequestRef.current = null;
      });

    inFlightRequestRef.current = request;
    return request;
  }, [filters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const addStudent = useCallback(async (data: any) => {
    const response = await api.post<Student>("/students", data);
    setStudents((prev) => [response, ...prev]);
    setTotal((prev) => prev + 1);
    toast.success("Student registered successfully!");
    return response;
  }, []);

  const updateStudent = useCallback(async (id: string, data: any) => {
    const response = await api.put<Student>(`/students/${id}`, data);
    setStudents((prev) => prev.map((s) => (s._id === id ? response : s)));
    toast.success("Student updated successfully!");
    return response;
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    await api.delete(`/students/${id}`);
    setStudents((prev) => prev.filter((s) => s._id !== id));
    setTotal((prev) => prev - 1);
    toast.success("Student removed successfully");
  }, []);

  const toggleStudentStatus = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/students/${id}/status`, { active: !currentStatus });
      setStudents((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, status: !currentStatus ? "active" : "inactive" } : s
        )
      );
      toast.success(`Student ${!currentStatus ? "enabled" : "disabled"} successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
      throw err;
    }
  }, []);

  const renewStudentPass = useCallback(
    async (id: string, name: string) => {
      try {
        const res: any = await api.put(`/students/${id}/renew-pass`, {});
        const dateStr = new Date(res.validUntil).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        toast.success(`Digital ID card for ${name} renewed until ${dateStr}`);
        await fetchStudents(true);
      } catch (err: any) {
        toast.error(err.message || "Failed to renew ID pass");
        throw err;
      }
    },
    [fetchStudents]
  );

  const importStudents = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post<{ imported: number; errors?: string[] }>(
        "/students/bulk",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.errors?.length) {
        toast.warning(`Imported ${response.imported} students with ${response.errors.length} errors`);
      } else {
        toast.success(`Successfully imported ${response.imported} students!`);
      }
      await fetchStudents(true);
      return response;
    },
    [fetchStudents]
  );

  const clearCache = useCallback(() => {
    isFetchedRef.current = false;
    setStudents([]);
    setTotal(0);
  }, []);

  const value: StudentsContextValue = useMemo(
    () => ({
      students,
      total,
      totalPages,
      loading,
      departments,
      academicYears,
      filters,
      setFilters,
      fetchStudents,
      fetchLookups,
      addStudent,
      updateStudent,
      deleteStudent,
      toggleStudentStatus,
      renewStudentPass,
      importStudents,
      clearCache,
    }),
    [
      students,
      total,
      totalPages,
      loading,
      departments,
      academicYears,
      filters,
      setFilters,
      fetchStudents,
      fetchLookups,
      addStudent,
      updateStudent,
      deleteStudent,
      toggleStudentStatus,
      renewStudentPass,
      importStudents,
      clearCache,
    ]
  );

  return <StudentsContext.Provider value={value}>{children}</StudentsContext.Provider>;
};

export const useStudents = () => {
  const context = useContext(StudentsContext);
  if (!context) {
    throw new Error("useStudents must be used within StudentsProvider");
  }
  return context;
};

export default StudentsContext;
