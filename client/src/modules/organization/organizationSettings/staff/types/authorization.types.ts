export type AccessLevel = 'full' | 'limited' | 'none';

export type StaffPreset =
  | 'warden'
  | 'student_admin'
  | 'security_guard'
  | 'mess_supervisor'
  | 'discipline_warden'
  | 'custom';

export interface DomainPermissions {
  residents: {
    level: AccessLevel;
    custom?: {
      viewStudents: boolean;
      createStudents: boolean;
      editStudents: boolean;
      bulkImport: boolean;
      roomAllocation: boolean;
      leaveReview: boolean;
    };
  };
  operations: {
    level: AccessLevel;
    custom?: {
      attendanceMarking: boolean;
      gateScanner: boolean;
      outingsLog: boolean;
      disciplineFlags: boolean;
      leaveApproval: boolean;
    };
  };
  finance: {
    level: AccessLevel;
    custom?: {
      viewBills: boolean;
      generateBills: boolean;
      recordPayments: boolean;
      financialReports: boolean;
    };
  };
}

export const DEFAULT_DOMAIN_PERMISSIONS: DomainPermissions = {
  residents: {
    level: 'full',
    custom: {
      viewStudents: true,
      createStudents: true,
      editStudents: true,
      bulkImport: true,
      roomAllocation: true,
      leaveReview: true,
    },
  },
  operations: {
    level: 'none',
    custom: {
      attendanceMarking: false,
      gateScanner: false,
      outingsLog: false,
      disciplineFlags: false,
      leaveApproval: false,
    },
  },
  finance: {
    level: 'none',
    custom: {
      viewBills: false,
      generateBills: false,
      recordPayments: false,
      financialReports: false,
    },
  },
};

export const STAFF_PRESETS: {
  id: StaffPreset;
  title: string;
  subtitle: string;
  icon: string;
  permissions: DomainPermissions;
  moderatorType: 'full' | 'administration' | 'security_guard' | 'attendance_only' | 'discipline_monitor';
}[] = [
  {
    id: 'warden',
    title: 'Chief Warden',
    subtitle: 'Residents + Operations',
    icon: '👨‍💼',
    moderatorType: 'full',
    permissions: {
      residents: {
        level: 'full',
        custom: {
          viewStudents: true,
          createStudents: true,
          editStudents: true,
          bulkImport: true,
          roomAllocation: true,
          leaveReview: true,
        },
      },
      operations: {
        level: 'full',
        custom: {
          attendanceMarking: true,
          gateScanner: true,
          outingsLog: true,
          disciplineFlags: true,
          leaveApproval: true,
        },
      },
      finance: {
        level: 'none',
        custom: {
          viewBills: false,
          generateBills: false,
          recordPayments: false,
          financialReports: false,
        },
      },
    },
  },
  {
    id: 'student_admin',
    title: 'Student Admin',
    subtitle: 'Residents & Rooms',
    icon: '🏢',
    moderatorType: 'administration',
    permissions: {
      residents: {
        level: 'full',
        custom: {
          viewStudents: true,
          createStudents: true,
          editStudents: true,
          bulkImport: true,
          roomAllocation: true,
          leaveReview: true,
        },
      },
      operations: {
        level: 'none',
        custom: {
          attendanceMarking: false,
          gateScanner: false,
          outingsLog: false,
          disciplineFlags: false,
          leaveApproval: false,
        },
      },
      finance: {
        level: 'none',
        custom: {
          viewBills: false,
          generateBills: false,
          recordPayments: false,
          financialReports: false,
        },
      },
    },
  },
  {
    id: 'security_guard',
    title: 'Gate Security',
    subtitle: 'QR Pass & Outings',
    icon: '🛡️',
    moderatorType: 'security_guard',
    permissions: {
      residents: {
        level: 'none',
        custom: {
          viewStudents: false,
          createStudents: false,
          editStudents: false,
          bulkImport: false,
          roomAllocation: false,
          leaveReview: false,
        },
      },
      operations: {
        level: 'limited',
        custom: {
          attendanceMarking: false,
          gateScanner: true,
          outingsLog: true,
          disciplineFlags: false,
          leaveApproval: false,
        },
      },
      finance: {
        level: 'none',
        custom: {
          viewBills: false,
          generateBills: false,
          recordPayments: false,
          financialReports: false,
        },
      },
    },
  },
  {
    id: 'mess_supervisor',
    title: 'Mess Supervisor',
    subtitle: 'Meal Attendance',
    icon: '🍽️',
    moderatorType: 'attendance_only',
    permissions: {
      residents: {
        level: 'none',
        custom: {
          viewStudents: false,
          createStudents: false,
          editStudents: false,
          bulkImport: false,
          roomAllocation: false,
          leaveReview: false,
        },
      },
      operations: {
        level: 'limited',
        custom: {
          attendanceMarking: true,
          gateScanner: false,
          outingsLog: false,
          disciplineFlags: false,
          leaveApproval: false,
        },
      },
      finance: {
        level: 'none',
        custom: {
          viewBills: false,
          generateBills: false,
          recordPayments: false,
          financialReports: false,
        },
      },
    },
  },
  {
    id: 'discipline_warden',
    title: 'Discipline Warden',
    subtitle: 'Incidents & Leaves',
    icon: '⚖️',
    moderatorType: 'discipline_monitor',
    permissions: {
      residents: {
        level: 'none',
        custom: {
          viewStudents: false,
          createStudents: false,
          editStudents: false,
          bulkImport: false,
          roomAllocation: false,
          leaveReview: false,
        },
      },
      operations: {
        level: 'limited',
        custom: {
          attendanceMarking: false,
          gateScanner: false,
          outingsLog: false,
          disciplineFlags: true,
          leaveApproval: true,
        },
      },
      finance: {
        level: 'none',
        custom: {
          viewBills: false,
          generateBills: false,
          recordPayments: false,
          financialReports: false,
        },
      },
    },
  },
];

/**
 * Resolves DomainPermissions into the canonical backend moderatorType
 */
export function resolveModeratorType(
  perms: DomainPermissions
): 'full' | 'administration' | 'security_guard' | 'attendance_only' | 'discipline_monitor' {
  const { residents, operations } = perms;

  // 1. Full Warden (Both Residents and Operations are active)
  if (residents.level === 'full' && (operations.level === 'full' || operations.level === 'limited')) {
    return 'full';
  }

  // 2. Specific Operations roles
  if (residents.level === 'none' && operations.level === 'limited') {
    if (operations.custom?.gateScanner && !operations.custom?.attendanceMarking && !operations.custom?.disciplineFlags) {
      return 'security_guard';
    }
    if (operations.custom?.attendanceMarking && !operations.custom?.gateScanner && !operations.custom?.disciplineFlags) {
      return 'attendance_only';
    }
    if (operations.custom?.disciplineFlags && !operations.custom?.gateScanner && !operations.custom?.attendanceMarking) {
      return 'discipline_monitor';
    }
  }

  if (residents.level === 'full' || residents.level === 'limited') {
    return 'administration';
  }

  if (operations.level === 'full') {
    return 'full';
  }

  return 'administration';
}
