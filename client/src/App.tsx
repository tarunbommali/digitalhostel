import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/core/context/theme-context";
import { ProtectedRoute } from "@/core/components/ProtectedRoute";
import RootLayout from "@/components/layout/RootLayout";
import { SuperAdminGuard } from "@/components/layout/SuperAdminGuard";
import { PublicGuard } from "@/components/layout/PublicGuard";
import ErrorBoundary from "@/components/layout/ErrorBoundary";

// Public Modules
import LandingPage from "@/modules/landing/pages/LandingPage";
import SuperAdminLoginPage from "@/modules/auth/pages/SuperAdminLoginPage";
import { AuthPage } from "@/modules/auth/pages/Auth";
import { ForgotPasswordPage } from "@/modules/auth/pages/ForgotPassword";
import { ResetPasswordPage } from "@/modules/auth/pages/ResetPassword";

// Tier 1: Platform / Super Admin
import {
  SuperAdminLayout,
  SuperAdminOverview,
  SuperAdminDashboard,
  NewOrganization,
  EditOrganization,
} from "@platform";

// Tier 2: Organization Administration
import {
  OrganizationLayout,
  OrganizationDashboard,
  StudentsPage,
  NewStudent,
  ImportStudents,
  RoomsPage,
  AttendancePage,
  OutingsPage,
  LeavesPage,
  BillsPage,
  PaymentsPage,
  FlagsPage,
  ModeratorsPage,
  SettingsPage,
} from "@organization";

// Tier 3: Student Portal
import {
  StudentLayout,
  StudentDashboard,
  StudentOutings,
  StudentLeaves,
  StudentAttendance,
  StudentBills,
  StudentPayments,
  StudentFlags,
} from "@student";

// Special Role: Security Guard
import { GuardScannerPage } from "@guard";

const appRouter = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      // ============================================
      // PUBLIC & AUTHENTICATION ROUTES
      // ============================================
      {
        element: <PublicGuard />,
        children: [
          { path: "/", element: <LandingPage /> },
          { path: "/super-admin/login", element: <SuperAdminLoginPage /> },
          { path: "/organization/:slug", element: <AuthPage /> },
          { path: "/organization/:slug/login", element: <AuthPage /> },
          { path: "/student/:slug/login", element: <AuthPage /> },
          { path: "/auth", element: <AuthPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
        ],
      },

      // ============================================
      // TIER 1: SUPER ADMIN (Platform Level)
      // ============================================
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

      // ============================================
      // TIER 2: ORGANIZATION (Admin & Staff Level)
      // ============================================
      {
        path: "/organization/:slug",
        element: <OrganizationLayout />,
        children: [
          {
            path: "dashboard",
            element: (
              <ProtectedRoute requireOrganization>
                <OrganizationDashboard />
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
              <ProtectedRoute
                requireOrganization
                allowedRoles={["admin", "moderator"]}
                requiredFeature="bulkImport"
              >
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
              <ProtectedRoute
                requireOrganization
                allowedRoles={["admin", "moderator", "student", "security_guard"]}
              >
                <OutingsPage />
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
              <ProtectedRoute
                requireOrganization
                allowedRoles={["admin", "student"]}
                requiredFeature="monthlyBilling"
              >
                <BillsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "payments",
            element: (
              <ProtectedRoute
                requireOrganization
                allowedRoles={["admin", "student"]}
                requiredFeature="onlinePayments"
              >
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

      // ============================================
      // TIER 3: STUDENT PORTAL
      // ============================================
      {
        path: "/student/:slug",
        element: <StudentLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            element: (
              <ProtectedRoute requireOrganization allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "outings",
            element: (
              <ProtectedRoute requireOrganization allowedRoles={["student"]}>
                <StudentOutings />
              </ProtectedRoute>
            ),
          },
          {
            path: "leaves",
            element: (
              <ProtectedRoute requireOrganization allowedRoles={["student"]}>
                <StudentLeaves />
              </ProtectedRoute>
            ),
          },
          {
            path: "attendance",
            element: (
              <ProtectedRoute requireOrganization allowedRoles={["student"]}>
                <StudentAttendance />
              </ProtectedRoute>
            ),
          },
          {
            path: "bills",
            element: (
              <ProtectedRoute
                requireOrganization
                allowedRoles={["student"]}
                requiredFeature="monthlyBilling"
              >
                <StudentBills />
              </ProtectedRoute>
            ),
          },
          {
            path: "payments",
            element: (
              <ProtectedRoute
                requireOrganization
                allowedRoles={["student"]}
                requiredFeature="onlinePayments"
              >
                <StudentPayments />
              </ProtectedRoute>
            ),
          },
          {
            path: "flags",
            element: (
              <ProtectedRoute
                requireOrganization
                allowedRoles={["student"]}
                requiredFeature="incidentReporting"
              >
                <StudentFlags />
              </ProtectedRoute>
            ),
          },
        ],
      },

      // Fallback
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
