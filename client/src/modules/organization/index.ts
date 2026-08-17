export { default as OrganizationLayout } from "./components/OrganizationLayout";
export { default as OrganizationSidebar } from "./components/OrganizationSidebar";
export { OrganizationProvider, useOrganization } from "./context/organization-context";
export { useOrganizationData } from "./hooks/useOrganizationData";

// Shared Domain Context & Hooks
export { StudentsProvider, useStudents } from "./students/context/students-context";
export { useStudentFilters } from "./students/hooks/useStudentFilters";

// Shared Components
export { StudentsTable } from "./students/components/StudentsTable";
export { StudentsFilterBar } from "./students/components/StudentsFilterBar";
export { StudentsPagination } from "./students/components/StudentsPagination";
export { EditStudentModal } from "./students/components/EditStudentModal";

// Page exports
export { Dashboard as OrganizationDashboard, Dashboard } from "./dashboard/pages/Dashboard";
export { StudentsPage } from "./students/pages/Students";
export { NewStudent } from "./students/pages/NewStudent";
export { ImportStudents } from "./students/pages/ImportStudents";
export { RoomsPage } from "./rooms/pages/Rooms";
export { AttendancePage } from "./attendance/pages/Attendance";
export { OutingsLogPage as OutingsPage } from "./outings/pages/OutingsLog";
export { LeavesPage } from "./leaves/pages/Leaves";
export { BillsPage } from "./bills/pages/Bills";
export { PaymentsPage } from "./payments/pages/Payments";
export { FlagsPage } from "./flags/pages/Flags";
export { ModeratorsPage } from "./moderators/pages/Moderators";
export { SettingsPage } from "./settings/pages/Settings";
