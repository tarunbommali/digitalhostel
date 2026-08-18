export interface OrganizationStats {
  totalStudents?: number;
  activeStudents?: number;
  allocatedBeds?: number;
  availableBeds?: number;
  totalRooms?: number;
  unpaidBillsCount?: number;
  totalUnpaidAmount?: number;
  breakfast?: number;
  lunch?: number;
  dinner?: number;
  openFlags?: number;
  pendingLeaves?: number;
  activeOutings?: number;
  [key: string]: any;
}

export interface OrganizationInfo {
  _id: string;
  name: string;
  slug: string;
  plan: "BASIC" | "PRO" | "ENTERPRISE";
  status: "active" | "suspended" | "pending";
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
  };
  limits?: {
    maxStudents?: number;
    maxRooms?: number;
    maxStaff?: number;
  };
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}
