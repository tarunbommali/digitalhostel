export interface LogbookEntry {
  _id: string;
  student?: {
    _id: string;
    fullName: string;
    registrationNumber: string;
    hostelUid?: string;
  };
  type: "out" | "in";
  time: string;
  purpose?: string;
  remarks?: string;
  guard?: {
    name?: string;
    email?: string;
  };
  createdAt?: string;
  [key: string]: any;
}

export interface VerifiedStudentScan {
  ok: boolean;
  canExit?: boolean;
  canEnter?: boolean;
  movementType?: "out" | "in";
  reason?: string;
  activePass?: any;
  student: {
    _id: string;
    fullName: string;
    registrationNumber: string;
    hostelUid?: string;
    phone?: string;
    room?: string;
    photoUrl?: string;
    department?: {
      name?: string;
    };
    academicYear?: {
      name?: string;
    };
    [key: string]: any;
  };
  [key: string]: any;
}
