import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  CalendarCheck,
  FileText,
  CreditCard,
  Flag,
  Settings,
  Compass,
} from "lucide-react";
import { type AppRole } from "@/core/context/auth-context";

// API Endpoint Constants
export const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  STUDENTS: `${API_BASE_URL}/students`,
  ROOMS: `${API_BASE_URL}/rooms`,
  ATTENDANCE: `${API_BASE_URL}/attendance`,
  OUTINGS: `${API_BASE_URL}/outings`,
  LEAVES: `${API_BASE_URL}/leaves`,
  BILLS: `${API_BASE_URL}/bills`,
  PAYMENTS: `${API_BASE_URL}/payments`,
  FLAGS: `${API_BASE_URL}/flags`,
  ORGANIZATIONS: `${API_BASE_URL}/organizations`,
};

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: AppRole[];
}

export const NAV: NavItem[] = [
  {
    to: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "moderator", "student", "security_guard"],
  },
  {
    to: "outings",
    label: "Outing Logbook",
    icon: Compass,
    roles: ["admin", "moderator", "student", "security_guard"],
  },
  {
    to: "students",
    label: "Students",
    icon: Users,
    roles: ["admin", "moderator"],
  },
  {
    to: "moderators",
    label: "Moderators & Security",
    icon: UserCheck,
    roles: ["admin"],
  },
  {
    to: "rooms",
    label: "Rooms & Beds",
    icon: Building2,
    roles: ["admin"],
  },
  {
    to: "attendance",
    label: "Mess Attendance",
    icon: CalendarCheck,
    roles: ["admin", "moderator"],
  },
  {
    to: "leaves",
    label: "Leave Applications",
    icon: FileText,
    roles: ["admin", "moderator", "student"],
  },
  {
    to: "bills",
    label: "Monthly Bills",
    icon: CreditCard,
    roles: ["admin", "student"],
  },
  {
    to: "payments",
    label: "Payments",
    icon: CreditCard,
    roles: ["admin", "student"],
  },
  {
    to: "flags",
    label: "Discipline Flags",
    icon: Flag,
    roles: ["admin", "moderator", "student"],
  },
  {
    to: "settings",
    label: "Settings",
    icon: Settings,
    roles: ["admin"],
  },
];
