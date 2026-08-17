import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import { api } from "@/core/lib/api";
import { StudentDashboardData } from "../types/student.types";

interface StudentContextValue {
  data: StudentDashboardData | null;
  loading: boolean;
  error: string | null;
  fetchStudentData: (force?: boolean) => Promise<void>;
  refreshStudentData: () => Promise<void>;
}

const StudentContext = createContext<StudentContextValue | null>(null);

export const StudentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFetchedRef = useRef(false);
  const inFlightRequestRef = useRef<Promise<any> | null>(null);

  const fetchStudentData = useCallback(async (force = false) => {
    if (isFetchedRef.current && !force) return;
    if (inFlightRequestRef.current) return inFlightRequestRef.current;

    setLoading(true);
    setError(null);

    const request = api
      .get<StudentDashboardData>("/stats/dashboard")
      .then((res) => {
        setData(res || null);
        isFetchedRef.current = true;
      })
      .catch((err) => {
        setError(err.message || "Failed to load student portal data");
        console.error("Student portal error:", err);
      })
      .finally(() => {
        setLoading(false);
        inFlightRequestRef.current = null;
      });

    inFlightRequestRef.current = request;
    return request;
  }, []);

  const refreshStudentData = useCallback(async () => {
    await fetchStudentData(true);
  }, [fetchStudentData]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const value = useMemo(
    () => ({
      data,
      loading,
      error,
      fetchStudentData,
      refreshStudentData,
    }),
    [data, loading, error, fetchStudentData, refreshStudentData]
  );

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
};

export default StudentContext;
