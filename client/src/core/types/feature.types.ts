export type FeatureCategory =
  | 'core'
  | 'accommodation'
  | 'operations'
  | 'finance'
  | 'communication'
  | 'facilities'
  | 'analytics';

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  icon: string;
  isCore: boolean; // Cannot be disabled
  dependencies: string[]; // Feature IDs that must be enabled
  defaultConfig: FeatureConfig;
}

export interface FeatureConfig {
  enabled: boolean;
  settings: Record<string, any>;
  access: {
    roles: string[]; // Which roles can access this feature
  };
}

export interface OrganizationFeatureState {
  [featureId: string]: FeatureConfig;
}

// Specific feature configurations
export interface AttendanceFeatureConfig extends FeatureConfig {
  settings: {
    meals: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
    };
    modes: {
      qrScanner: boolean;
      manualUid: boolean;
    };
    lateThreshold: number; // minutes
    studentVisibility: boolean;
  };
}

export interface OutingsFeatureConfig extends FeatureConfig {
  settings: {
    qrScanner: boolean;
    parentNotification: boolean;
    maxOutingsPerDay: number;
    requiresApproval: boolean;
  };
}

export interface FinanceFeatureConfig extends FeatureConfig {
  settings: {
    billing: boolean;
    payments: boolean;
    rebates: boolean;
    lateFee: number;
    currency: string;
  };
}
