import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { type AppRole } from "@/core/context/auth-context";
import { ThemeProvider } from "@/core/context/theme-context";
import { ProtectedRoute } from "@/core/components/ProtectedRoute";
import RootLayout from "@/components/layout/RootLayout";
import AppLayout from "@/components/layout/AppLayout";
import { SuperAdminGuard } from "@/components/layout/SuperAdminGuard";
import { PublicGuard } from "@/components/layout/PublicGuard";
import ErrorBoundary from "@/components/layout/ErrorBoundary";

import LandingPage from "@/modules/landing/pages/LandingPage";
import SuperAdminLoginPage from "@/modules/auth/pages/SuperAdminLoginPage";
import SuperAdminLayout from "@/modules/super-admin/components/SuperAdminLayout";
import SuperAdminOverview from "@/modules/super-admin/pages/SuperAdminOverview";
import SuperAdminDashboard from "@/modules/super-admin/pages/SuperAdminDashboard";
import NewOrganization from "@/modules/super-admin/pages/NewOrganization";
import EditOrganization from "@/modules/super-admin/pages/EditOrganization";
import { AuthPage } from "@/modules/auth/pages/Auth";
import { ForgotPasswordPage } from "@/modules/auth/pages/ForgotPassword";
import { ResetPasswordPage } from "@/modules/auth/pages/ResetPassword";

import { Dashboard } from "@/modules/dashboard/pages/Dashboard";
import { StudentsPage } from "@/modules/students/pages/Students";
import { NewStudent } from "@/modules/students/pages/NewStudent";
import { ImportStudents } from "@/modules/students/pages/ImportStudents";
import { ModeratorsPage } from "@/modules/moderators/pages/Moderators";
import { RoomsPage } from "@/modules/rooms/pages/Rooms";
import { AttendancePage } from "@/modules/attendance/pages/Attendance";
import { OutingsLogPage } from "@/modules/outings/pages/OutingsLog";
import { LeavesPage } from "@/modules/leaves/pages/Leaves";
import { BillsPage } from "@/modules/bills/pages/Bills";
import { PaymentsPage } from "@/modules/payments/pages/Payments";
import { FlagsPage } from "@/modules/flags/pages/Flags";
import { SettingsPage } from "@/modules/settings/pages/Settings";

const appRouter = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <PublicGuard />,
        children: [
          { path: "/", element: <LandingPage /> },
          { path: "/super-admin/login", element: <SuperAdminLoginPage /> },
          { path: "/organization/:slug", element: <AuthPage /> },
          { path: "/organization/:slug/login", element: <AuthPage /> },
          { path: "/auth", element: <AuthPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
        ],
      },
      {
        path: "/super-admin",
        element: (
          <SuperAdminGuard>
            <ProtectedRoute superAdminOnly>
              <SuperAdminLayout />
            </ProtectedRoute>
          </SuperAdminGuard>
        ),
        children: [
          { index: true, element: <SuperAdminOverview /> },
          { path: "dashboard", element: <SuperAdminOverview /> },
          { path: "organizations", element: <SuperAdminDashboard /> },
          { path: "organizations/new", element: <NewOrganization /> },
          { path: "organizations/:id/edit", element: <EditOrganization /> },
        ],
      },
          {
            path: "/organization/:slug",
            element: <AppLayout />,
            children: [
              {
                path: "dashboard",
                element: (
                  <ProtectedRoute requireOrganization>
                    <Dashboard />
                  </ProtectedRoute>
                ),
              },
              {
                path: "students",
                element: (
                  <ProtectedRoute requireOrganization allowedRoles={["admin", "moderator"]}>
                    <StudentsPage />
                  </ProtectedRoute>
                ),
              },
              {
                path: "students/new",
                element: (
                  <ProtectedRoute requireOrganization allowedRoles={["admin", "moderator"]}>
                    <NewStudent />
                  </ProtectedRoute>
                ),
              },
              {
                path: "students/import",
                element: (
                  <ProtectedRoute requireOrganization allowedRoles={["admin", "moderator"]} requiredFeature="bulkImport">
                    <ImportStudents />
                  </ProtectedRoute>
                ),
              },
              {
                path: "moderators",
                element: (
                  <ProtectedRoute requireOrganization allowedRoles={["admin"]}>
                    <ModeratorsPage />
                  </ProtectedRoute>
                ),
              },
              {
                path: "rooms",
                element: (
                  <ProtectedRoute requireOrganization allowedRoles={["admin"]}>
                    <RoomsPage />
                  </ProtectedRoute>
                ),
              },
              {
                path: "attendance",
                element: (
                  <ProtectedRoute requireOrganization allowedRoles={["admin", "moderator"]}>
                    <AttendancePage />
                  </ProtectedRoute>
                ),
              },
              {
                path: "outings",
                element: (
                  <ProtectedRoute requireOrganization allowedRoles={["admin", "moderator", "student", "security_guard"]}>
                    <OutingsLogPage />
                  </ProtectedRoute>
                ),
              },
              {
                path: "leaves",
                element: (
                  <ProtectedRoute requireOrganization>
                    <LeavesPage />
                  </ProtectedRoute>
                ),
              },
              {
                path: "bills",
                element: (
                  <ProtectedRoute requireOrganization allowedRoles={["admin", "student"]} requiredFeature="monthlyBilling">
                    <BillsPage />
                  </ProtectedRoute>
                ),
              },
              {
                path: "payments",
                element: (
                  <ProtectedRoute requireOrganization allowedRoles={["admin", "student"]} requiredFeature="onlinePayments">
                    <PaymentsPage />
                  </ProtectedRoute>
                ),
              },
              {
                path: "flags",
                element: (
                  <ProtectedRoute requireOrganization requiredFeature="incidentReporting">
                    <FlagsPage />
                  </ProtectedRoute>
                ),
              },
              {
                path: "settings",
                element: (
                  <ProtectedRoute requireOrganization allowedRoles={["admin"]}>
                    <SettingsPage />
                  </ProtectedRoute>
                ),
              },
            ],
          },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ]);

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={appRouter} />
    </ThemeProvider>
  );
}

export default App;
