import { FeatureDefinition, FeatureCategory } from '@/core/types/feature.types';

export const FEATURE_REGISTRY: FeatureDefinition[] = [
  // CORE (Cannot be disabled)
  {
    id: 'students',
    name: 'Student Management',
    description: 'Manage students, enrollment, and resident profiles.',
    category: 'core',
    icon: 'Users',
    isCore: true,
    dependencies: [],
    defaultConfig: {
      enabled: true,
      settings: {},
      access: { roles: ['admin', 'moderator'] }
    }
  },
  {
    id: 'rooms',
    name: 'Room & Bed Management',
    description: 'Manage rooms, beds, and student allocations.',
    category: 'accommodation',
    icon: 'Building2',
    isCore: true,
    dependencies: ['students'],
    defaultConfig: {
      enabled: true,
      settings: {},
      access: { roles: ['admin', 'moderator'] }
    }
  },
  {
    id: 'staff',
    name: 'Staff Management',
    description: 'Manage staff accounts, roles, and permissions.',
    category: 'core',
    icon: 'Shield',
    isCore: true,
    dependencies: [],
    defaultConfig: {
      enabled: true,
      settings: {},
      access: { roles: ['admin'] }
    }
  },

  // OPERATIONS (Can be disabled)
  {
    id: 'attendance',
    name: 'Attendance',
    description: 'Track daily meal and session attendance.',
    category: 'operations',
    icon: 'Calendar',
    isCore: false,
    dependencies: ['students'],
    defaultConfig: {
      enabled: true,
      settings: {
        meals: {
          breakfast: true,
          lunch: true,
          dinner: true
        },
        modes: {
          qrScanner: true,
          manualUid: true
        },
        lateThreshold: 15,
        studentVisibility: true
      },
      access: { roles: ['admin', 'moderator', 'attendance_moderator'] }
    }
  },
  {
    id: 'outings',
    name: 'Outings & Gate Pass',
    description: 'Manage student outings, QR passes, and gate scanning.',
    category: 'operations',
    icon: 'DoorOpen',
    isCore: false,
    dependencies: ['students'],
    defaultConfig: {
      enabled: true,
      settings: {
        qrScanner: true,
        parentNotification: false,
        maxOutingsPerDay: 3,
        requiresApproval: true
      },
      access: { roles: ['admin', 'moderator', 'security_guard'] }
    }
  },
  {
    id: 'leaves',
    name: 'Leave Management',
    description: 'Manage student leave applications and approvals.',
    category: 'operations',
    icon: 'Clock',
    isCore: false,
    dependencies: ['students'],
    defaultConfig: {
      enabled: true,
      settings: {
        rebateIntegration: true,
        maxDaysPerLeave: 30
      },
      access: { roles: ['admin', 'moderator'] }
    }
  },
  {
    id: 'discipline',
    name: 'Discipline & Flags',
    description: 'Manage disciplinary flags, incidents, and resolutions.',
    category: 'operations',
    icon: 'Flag',
    isCore: false,
    dependencies: ['students'],
    defaultConfig: {
      enabled: true,
      settings: {},
      access: { roles: ['admin', 'moderator'] }
    }
  },

  // FINANCE
  {
    id: 'billing',
    name: 'Billing',
    description: 'Generate and manage student bills and invoices.',
    category: 'finance',
    icon: 'FileText',
    isCore: false,
    dependencies: ['students'],
    defaultConfig: {
      enabled: true,
      settings: {
        currency: 'INR',
        lateFee: 100
      },
      access: { roles: ['admin'] }
    }
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'Process and track student payments.',
    category: 'finance',
    icon: 'CreditCard',
    isCore: false,
    dependencies: ['billing'],
    defaultConfig: {
      enabled: true,
      settings: {
        onlinePayments: true,
        paymentMethods: ['UPI', 'Card', 'Bank Transfer']
      },
      access: { roles: ['admin'] }
    }
  },
  {
    id: 'mess',
    name: 'Mess Management',
    description: 'Manage mess operations and meal tracking.',
    category: 'facilities',
    icon: 'Utensils',
    isCore: false,
    dependencies: ['attendance'],
    defaultConfig: {
      enabled: false,
      settings: {
        mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
        dietaryOptions: ['Vegetarian', 'Non-Vegetarian', 'Vegan']
      },
      access: { roles: ['admin', 'moderator'] }
    }
  },
  {
    id: 'maintenance',
    name: 'Maintenance Requests',
    description: 'Track and manage maintenance complaints.',
    category: 'facilities',
    icon: 'Wrench',
    isCore: false,
    dependencies: ['students'],
    defaultConfig: {
      enabled: false,
      settings: {},
      access: { roles: ['admin', 'moderator'] }
    }
  },
  {
    id: 'visitors',
    name: 'Visitor Management',
    description: 'Manage visitor entries and approvals.',
    category: 'facilities',
    icon: 'UserPlus',
    isCore: false,
    dependencies: [],
    defaultConfig: {
      enabled: false,
      settings: {},
      access: { roles: ['admin', 'security_guard'] }
    }
  },

  // COMMUNICATION
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Send and manage notifications for students and parents.',
    category: 'communication',
    icon: 'Bell',
    isCore: false,
    dependencies: [],
    defaultConfig: {
      enabled: true,
      settings: {
        email: true,
        sms: false,
        push: false
      },
      access: { roles: ['admin', 'moderator'] }
    }
  },

  // ANALYTICS
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Generate insights and reports for your organization.',
    category: 'analytics',
    icon: 'TrendingUp',
    isCore: false,
    dependencies: [],
    defaultConfig: {
      enabled: true,
      settings: {},
      access: { roles: ['admin'] }
    }
  }
];

export const getFeatureById = (id: string): FeatureDefinition | undefined => {
  return FEATURE_REGISTRY.find(f => f.id === id);
};

export const getFeaturesByCategory = (category: FeatureCategory): FeatureDefinition[] => {
  return FEATURE_REGISTRY.filter(f => f.category === category);
};

export const getCoreFeatures = (): FeatureDefinition[] => {
  return FEATURE_REGISTRY.filter(f => f.isCore);
};
