/**
 * Digital Hostel Platform - Single Source of Truth for Plan Tiers, Quotas, and Feature Matrices
 * Aligned with PricingComparison specifications.
 */

const PLAN_TIERS = {
  BASIC: 'BASIC',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE',
};

const PLAN_LIMITS = {
  BASIC: {
    maxStudents: 500,
    maxModerators: 2,
    maxBlocks: 1,
    auditLogRetentionDays: 7,
  },
  PRO: {
    maxStudents: 1000,
    maxModerators: 10,
    maxBlocks: Infinity,
    auditLogRetentionDays: 90,
  },
  ENTERPRISE: {
    maxStudents: Infinity,
    maxModerators: Infinity,
    maxBlocks: Infinity,
    auditLogRetentionDays: 365,
  },
};

const PLAN_FEATURES = {
  BASIC: {
    // Core & Student
    studentProfiles: true,
    bulkImport: false,
    digitalIdCards: true,
    academicYearsDepartments: true,

    // Rooms
    roomManagement: true,
    bedTransfer: true,
    visualBedMap: false,

    // Attendance & Gate
    messAttendance: true,
    gatePassScanner: true,
    overdueAlerts: false,

    // Leaves
    leaveWorkflow: true,
    rebateCalculation: false,

    // Billing & Payments
    monthlyBilling: false,
    onlinePayments: false,
    paymentReconciliation: false,
    customFeeStructures: false,

    // Discipline
    incidentReporting: false,
    disciplineWorkflow: false,

    // Branding & Access
    customBranding: false,
    customDomain: false,
    ssoAuth: false,

    // Reporting & Ops
    standardReports: true,
    crossBlockAnalytics: false,
    customReportBuilder: false,
    apiAccess: false,
    backupDrSla: false,
    prioritySupport: false,
  },
  PRO: {
    // Core & Student
    studentProfiles: true,
    bulkImport: true,
    digitalIdCards: true,
    academicYearsDepartments: true,

    // Rooms
    roomManagement: true,
    bedTransfer: true,
    visualBedMap: true,

    // Attendance & Gate
    messAttendance: true,
    gatePassScanner: true,
    overdueAlerts: true,

    // Leaves
    leaveWorkflow: true,
    rebateCalculation: true,

    // Billing & Payments
    monthlyBilling: true,
    onlinePayments: true,
    paymentReconciliation: true,
    customFeeStructures: false,

    // Discipline
    incidentReporting: true,
    disciplineWorkflow: true,

    // Branding & Access
    customBranding: true,
    customDomain: false,
    ssoAuth: false,

    // Reporting & Ops
    standardReports: true,
    crossBlockAnalytics: true,
    customReportBuilder: false,
    apiAccess: false,
    backupDrSla: false,
    prioritySupport: 'Email',
  },
  ENTERPRISE: {
    // Core & Student
    studentProfiles: true,
    bulkImport: true,
    digitalIdCards: true,
    academicYearsDepartments: true,

    // Rooms
    roomManagement: true,
    bedTransfer: true,
    visualBedMap: true,

    // Attendance & Gate
    messAttendance: true,
    gatePassScanner: true,
    overdueAlerts: true,

    // Leaves
    leaveWorkflow: true,
    rebateCalculation: true,

    // Billing & Payments
    monthlyBilling: true,
    onlinePayments: true,
    paymentReconciliation: true,
    customFeeStructures: true,

    // Discipline
    incidentReporting: true,
    disciplineWorkflow: true,

    // Branding & Access
    customBranding: true,
    customDomain: true,
    ssoAuth: true,

    // Reporting & Ops
    standardReports: true,
    crossBlockAnalytics: true,
    customReportBuilder: true,
    apiAccess: true,
    backupDrSla: true,
    prioritySupport: 'Email + phone, dedicated',
  },
};

const normalizePlan = (plan) => {
  if (!plan) return PLAN_TIERS.BASIC;
  const upper = String(plan).toUpperCase();
  if (upper.includes('ENTERPRISE')) return PLAN_TIERS.ENTERPRISE;
  if (upper.includes('PRO')) return PLAN_TIERS.PRO;
  return PLAN_TIERS.BASIC;
};

const isFeatureEnabled = (plan, featureKey) => {
  const normalized = normalizePlan(plan);
  return Boolean(PLAN_FEATURES[normalized]?.[featureKey]);
};

const getPlanLimit = (plan, limitKey) => {
  const normalized = normalizePlan(plan);
  return PLAN_LIMITS[normalized]?.[limitKey] ?? Infinity;
};

const getMinimumPlanForFeature = (featureKey) => {
  if (PLAN_FEATURES.BASIC[featureKey]) return 'BASIC';
  if (PLAN_FEATURES.PRO[featureKey]) return 'PRO';
  if (PLAN_FEATURES.ENTERPRISE[featureKey]) return 'ENTERPRISE';
  return 'ENTERPRISE';
};

module.exports = {
  PLAN_TIERS,
  PLAN_LIMITS,
  PLAN_FEATURES,
  normalizePlan,
  isFeatureEnabled,
  getPlanLimit,
  getMinimumPlanForFeature,
};
