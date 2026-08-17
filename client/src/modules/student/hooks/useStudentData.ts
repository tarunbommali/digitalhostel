import { useStudent } from "../context/student-context";
import { useTenant } from "@/core/context/tenant-context";
import { useAuth } from "@/core/context/auth-context";

export const useStudentData = () => {
  const { user } = useAuth();
  const { organization } = useTenant();
  const { data, loading, error, refreshStudentData } = useStudent();

  return {
    user,
    organization,
    student: data?.stu,
    bed: data?.bed,
    totalDue: data?.totalDue || 0,
    totalPaid: data?.totalPaid || 0,
    activeFlags: data?.activeFlags || 0,
    loading,
    error,
    refresh: refreshStudentData,
  };
};

export default useStudentData;
