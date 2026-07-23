export type HostelGender = "boys" | "girls" | "co-ed";

export interface DepartmentItem {
  _id: string;
  name: string;
  code?: string;
  createdAt?: string;
}

export interface AcademicYearItem {
  _id: string;
  name: string;
  isCompleted?: boolean;
  completedAt?: string;
  createdAt?: string;
}

export interface HostelBlockItem {
  _id: string;
  name: string;
  code?: string;
  gender: HostelGender;
  createdAt?: string;
}

export interface ToggleYearResult {
  ok: boolean;
  result?: {
    updatedStudents: number;
    releasedBeds: number;
  };
}
