export { default as StudentLayout } from "./components/StudentLayout";
export { default as StudentSidebar } from "./components/StudentSidebar";
export { StudentProvider, useStudent } from "./context/student-context";
export { useStudentData } from "./hooks/useStudentData";

// Student Portal UI Components
export { DigitalIdCard } from "@/modules/organization/dashboard/components/DigitalIdCard";
export { StudentProfileCard } from "@/modules/organization/dashboard/components/StudentProfileCard";
export { StudentOutingStatusCard } from "@/modules/organization/dashboard/components/StudentOutingStatusCard";
export { ChangePasswordCard } from "@/modules/organization/dashboard/components/ChangePasswordCard";

// Page exports
export { Dashboard as StudentDashboard, Dashboard } from "@/modules/organization/dashboard/pages/Dashboard";
export { OutingsLogPage as StudentOutings } from "@/modules/organization/outings/pages/OutingsLog";
export { LeavesPage as StudentLeaves } from "@/modules/organization/leaves/pages/Leaves";
export { AttendancePage as StudentAttendance } from "@/modules/organization/attendance/pages/Attendance";
export { BillsPage as StudentBills } from "@/modules/organization/bills/pages/Bills";
export { PaymentsPage as StudentPayments } from "@/modules/organization/payments/pages/Payments";
export { FlagsPage as StudentFlags } from "@/modules/organization/flags/pages/Flags";
