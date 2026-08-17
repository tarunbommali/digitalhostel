export interface Department {
  _id: string;
  name: string;
  code?: string;
}

export interface AcademicYear {
  _id: string;
  name: string;
  year?: number;
}

export interface Student {
  _id: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  hostelUid?: string;
  registrationNumber: string;
  email: string;
  phone?: string;
  programType?: "UG" | "PG" | string;
  department?: {
    _id: string;
    name: string;
  } | null;
  academicYear?: {
    _id: string;
    name: string;
  } | null;
  bloodGroup?: string;
  gender?: "male" | "female" | "other" | string;
  guardianPhone?: string;
  emergencyContact?: string;
  photoUrl?: string;
  status: "active" | "inactive" | "suspended" | "graduated" | string;
  dues?: number;
  room?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentFilters {
  searchTerm: string;
  department: string;
  year: string;
  program: string;
  gender: string;
  dues: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}
