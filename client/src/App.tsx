import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth, type AppRole } from "@/core/context/auth-context";
import { Toaster } from "@/core/components/ui/sonner";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  Utensils,
  CalendarDays,
  Receipt,
  IndianRupee,
  Flag,
  Shield,
  LogOut,
  Menu,
  X,
  Building2,
  UserCog,
  Clock,
} from "lucide-react";

// Feature Modules Pages
import AuthPage from "@/modules/auth/pages/Auth";
import ForgotPasswordPage from "@/modules/auth/pages/ForgotPassword";
import ResetPasswordPage from "@/modules/auth/pages/ResetPassword";
import Dashboard from "@/modules/dashboard/pages/Dashboard";
import StudentsPage from "@/modules/students/pages/Students";
import NewStudent from "@/modules/students/pages/NewStudent";
import ImportStudents from "@/modules/students/pages/ImportStudents";
import ModeratorsPage from "@/modules/moderators/pages/Moderators";
import RoomsPage from "@/modules/rooms/pages/Rooms";
import AttendancePage from "@/modules/attendance/pages/Attendance";
import LeavesPage from "@/modules/leaves/pages/Leaves";
import BillsPage from "@/modules/bills/pages/Bills";
import PaymentsPage from "@/modules/payments/pages/Payments";
import FlagsPage from "@/modules/flags/pages/Flags";
import SettingsPage from "@/modules/settings/pages/Settings";
import OutingsLogPage from "@/modules/outings/pages/OutingsLog";


type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: AppRole[];
};

const NAV: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "moderator", "student", "security_guard"],
  },
  {
    to: "/outings",
    label: "Outing Logbook",
    icon: Clock,
    roles: ["admin", "moderator", "student", "security_guard"],
  },
  {
    to: "/students",
    label: "Students",
    icon: Users,
    roles: ["admin", "moderator"],
  },
  { to: "/moderators", label: "Moderators & Security", icon: UserCog, roles: ["admin"] },
  { to: "/rooms", label: "Rooms & Beds", icon: BedDouble, roles: ["admin"] },
  {
    to: "/attendance",
    label: "Mess Attendance",
    icon: Utensils,
    roles: ["moderator"], // Reserved for attendance_only staff
  },
  {
    to: "/leaves",
    label: "Leaves",
    icon: CalendarDays,
    roles: ["admin", "moderator", "student"],
  },
  {
    to: "/bills",
    label: "Bills",
    icon: Receipt,
    roles: ["admin", "moderator", "student"],
  },
  {
    to: "/payments",
    label: "Payments",
    icon: IndianRupee,
    roles: ["admin", "student"],
  },
  {
    to: "/flags",
    label: "Flags",
    icon: Flag,
    roles: ["admin", "moderator", "student"],
  },
  { to: "/settings", label: "Settings", icon: Shield, roles: ["admin"] },
];

function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: AppRole[];
}) {
  const { user, role, moderatorType, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Security guard restriction
  if (role === "security_guard" && !["/dashboard", "/outings"].includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Mess Attendance is restricted from Admin and Administration Moderator
  if (location.pathname === "/attendance") {
    if (role === "admin" || (role === "moderator" && moderatorType === "administration")) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Access restrictions based on moderatorType
  if (role === "moderator") {
    if (moderatorType === "attendance_only" && location.pathname !== "/attendance") {
      return <Navigate to="/attendance" replace />;
    }
    if (moderatorType === "discipline_monitor" && !["/flags", "/dashboard"].includes(location.pathname)) {
      return <Navigate to="/flags" replace />;
    }
  }

  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, role, moderatorType, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!user || !role) return null;

  const isAttendanceOnly = role === "moderator" && moderatorType === "attendance_only";
  const isDisciplineMonitor = role === "moderator" && moderatorType === "discipline_monitor";
  const isAdministrationMod = role === "moderator" && (moderatorType === "administration" || moderatorType === "full");
  const isSecurityGuard = role === "security_guard" || moderatorType === "security_guard";
  const isAdmin = role === "admin";

  const items = NAV.filter((n) => {
    if (!n.roles.includes(role)) return false;
    // Hide Mess Attendance from Admin and Administration Moderator
    if ((isAdmin || isAdministrationMod) && n.to === "/attendance") return false;
    if (isAttendanceOnly && n.to !== "/attendance") return false;
    if (isDisciplineMonitor && !["/dashboard", "/flags"].includes(n.to)) return false;
    if (isSecurityGuard && n.to !== "/dashboard") return false;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link to={isAttendanceOnly ? "/attendance" : "/dashboard"} className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">JNTUGV</p>
              <p className="text-[10px] opacity-70">Hostel</p>
            </div>
          </Link>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {items.map((n) => {
            const isActive = location.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-sidebar-border p-3 bg-sidebar">
          <div className="mb-2 px-2 text-xs">
            <p className="truncate font-medium">{user.email}</p>
            <p className="opacity-70 font-medium">
              {role === "admin"
                ? "OIH"
                : isSecurityGuard
                ? "Hostel Security Guard"
                : isAttendanceOnly
                ? "Mess Attendance Staff"
                : isDisciplineMonitor
                ? "Discipline Warden"
                : role === "moderator"
                ? "Administration"
                : "Student"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main content container */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background px-4 md:px-6">
          <button className="md:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-sm font-semibold">
            {role === "admin"
              ? "Officer Incharge of Hostel"
              : isSecurityGuard
              ? "Hostel Gate Pass & Digital Scanner"
              : isAttendanceOnly
              ? "Mess Attendance Staff"
              : isDisciplineMonitor
              ? "Discipline Warden"
              : role === "moderator"
              ? "Administration"
              : "Student Portal"}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/students"
            element={
              <RequireAuth roles={["admin", "moderator"]}>
                <AppLayout>
                  <StudentsPage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/students/new"
            element={
              <RequireAuth roles={["admin", "moderator"]}>
                <AppLayout>
                  <NewStudent />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/students/import"
            element={
              <RequireAuth roles={["admin", "moderator"]}>
                <AppLayout>
                  <ImportStudents />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/moderators"
            element={
              <RequireAuth roles={["admin"]}>
                <AppLayout>
                  <ModeratorsPage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/rooms"
            element={
              <RequireAuth roles={["admin"]}>
                <AppLayout>
                  <RoomsPage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/attendance"
            element={
              <RequireAuth roles={["admin", "moderator"]}>
                <AppLayout>
                  <AttendancePage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/outings"
            element={
              <RequireAuth roles={["admin", "moderator", "student", "security_guard"]}>
                <AppLayout>
                  <OutingsLogPage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/leaves"
            element={
              <RequireAuth>
                <AppLayout>
                  <LeavesPage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/bills"
            element={
              <RequireAuth roles={["admin", "student"]}>
                <AppLayout>
                  <BillsPage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/payments"
            element={
              <RequireAuth roles={["admin", "student"]}>
                <AppLayout>
                  <PaymentsPage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/flags"
            element={
              <RequireAuth>
                <AppLayout>
                  <FlagsPage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth roles={["admin"]}>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
