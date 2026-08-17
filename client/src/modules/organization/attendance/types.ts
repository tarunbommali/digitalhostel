export type Meal = "breakfast" | "lunch" | "dinner";

export interface MealWindowStatus {
  activeMeal: Meal;
  isOpen: boolean;
  label: string;
  windowText: string;
}

export interface AttendanceResponse {
  ok: boolean;
  student: {
    fullName: string;
    registrationNumber: string;
    hostelUid: string;
  };
}

export type AttendanceStatsData = Record<Meal, number>;

export interface AlertState {
  type: "success" | "duplicate" | "invalid" | "inactive";
  message: string;
  studentName?: string;
  registrationNumber?: string;
  hostelUid?: string;
}

export interface CameraDevice {
  id: string;
  label: string;
}
