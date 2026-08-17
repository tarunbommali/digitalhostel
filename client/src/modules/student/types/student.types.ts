export interface StudentProfile {
  _id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  registrationNumber: string;
  hostelUid?: string;
  email: string;
  phone?: string;
  bloodGroup?: string;
  guardianPhone?: string;
  emergencyContact?: string;
  photoUrl?: string;
  status: "active" | "inactive" | "suspended";
  programType?: "UG" | "PG";
  department?: {
    _id: string;
    name: string;
    code?: string;
  };
  academicYear?: {
    _id: string;
    name: string;
    year?: string;
  };
  room?: string;
  bedNumber?: string;
  [key: string]: any;
}

export interface StudentDashboardData {
  stu?: StudentProfile;
  bed?: any;
  totalDue?: number;
  totalPaid?: number;
  activeFlags?: number;
  [key: string]: any;
}
