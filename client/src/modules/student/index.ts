export { default as StudentLayout } from "./components/StudentLayout";
export { default as StudentSidebar } from "./components/StudentSidebar";
export { StudentProvider, useStudent } from "./context/student-context";
export { useStudentData } from "./hooks/useStudentData";

// Student Portal UI Components
export {
  DigitalIdCard,
  StudentProfileCard,
  StudentOutingStatusCard,
  ChangePasswordCard,
  Dashboard as StudentDashboard,
  Dashboard,
  OutingsPage as StudentOutings,
  LeavesPage as StudentLeaves,
  AttendancePage as StudentAttendance,
  BillsPage as StudentBills,
  PaymentsPage as StudentPayments,
  FlagsPage as StudentFlags,
} from "@organization";
