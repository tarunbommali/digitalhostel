/**
 * Client-Side Plan Tiers, Quotas, and Feature Matrix Specification
 * Directly aligned with PricingComparison.tsx and server/src/config/plans.js
 */

export type PlanTier = "BASIC" | "PRO" | "ENTERPRISE" | "Basic" | "Pro" | "Enterprise";

export type PlanFeatureKey =
  | "studentProfiles"
  | "bulkImport"
  | "digitalIdCards"
  | "academicYearsDepartments"
  | "roomManagement"
  | "bedTransfer"
  | "visualBedMap"
  | "messAttendance"
  | "gatePassScanner"
  | "overdueAlerts"
  | "leaveWorkflow"
  | "rebateCalculation"
  | "monthlyBilling"
  | "onlinePayments"
  | "paymentReconciliation"
  | "customFeeStructures"
  | "incidentReporting"
  | "disciplineWorkflow"
  | "customBranding"
  | "customDomain"
  | "ssoAuth"
  | "standardReports"
  | "crossBlockAnalytics"
  | "customReportBuilder"
  | "apiAccess"
  | "backupDrSla"
  | "prioritySupport";

export type PlanLimitKey = "maxStudents" | "maxModerators" | "maxBlocks" | "auditLogRetentionDays";

export interface FeatureMetadata {
  title: string;
  description: string;
  section: string;
  minPlan: "BASIC" | "PRO" | "ENTERPRISE";
}

export const PLAN_LIMITS: Record<"BASIC" | "PRO" | "ENTERPRISE", Record<PlanLimitKey, number>> = {
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

export const PLAN_FEATURES: Record<"BASIC" | "PRO" | "ENTERPRISE", Record<PlanFeatureKey, boolean | string>> = {
  BASIC: {
    studentProfiles: true,
    bulkImport: false,
    digitalIdCards: true,
    academicYearsDepartments: true,
    roomManagement: true,
    bedTransfer: true,
    visualBedMap: false,
    messAttendance: true,
    gatePassScanner: true,
    overdueAlerts: false,
    leaveWorkflow: true,
    rebateCalculation: false,
    monthlyBilling: false,
    onlinePayments: false,
    paymentReconciliation: false,
    customFeeStructures: false,
    incidentReporting: false,
    disciplineWorkflow: false,
    customBranding: false,
    customDomain: false,
    ssoAuth: false,
    standardReports: true,
    crossBlockAnalytics: false,
    customReportBuilder: false,
    apiAccess: false,
    backupDrSla: false,
    prioritySupport: false,
  },
  PRO: {
    studentProfiles: true,
    bulkImport: true,
    digitalIdCards: true,
    academicYearsDepartments: true,
    roomManagement: true,
    bedTransfer: true,
    visualBedMap: true,
    messAttendance: true,
    gatePassScanner: true,
    overdueAlerts: true,
    leaveWorkflow: true,
    rebateCalculation: true,
    monthlyBilling: true,
    onlinePayments: true,
    paymentReconciliation: true,
    customFeeStructures: false,
    incidentReporting: true,
    disciplineWorkflow: true,
    customBranding: true,
    customDomain: false,
    ssoAuth: false,
    standardReports: true,
    crossBlockAnalytics: true,
    customReportBuilder: false,
    apiAccess: false,
    backupDrSla: false,
    prioritySupport: "Email",
  },
  ENTERPRISE: {
    studentProfiles: true,
    bulkImport: true,
    digitalIdCards: true,
    academicYearsDepartments: true,
    roomManagement: true,
    bedTransfer: true,
    visualBedMap: true,
    messAttendance: true,
    gatePassScanner: true,
    overdueAlerts: true,
    leaveWorkflow: true,
    rebateCalculation: true,
    monthlyBilling: true,
    onlinePayments: true,
    paymentReconciliation: true,
    customFeeStructures: true,
    incidentReporting: true,
    disciplineWorkflow: true,
    customBranding: true,
    customDomain: true,
    ssoAuth: true,
    standardReports: true,
    crossBlockAnalytics: true,
    customReportBuilder: true,
    apiAccess: true,
    backupDrSla: true,
    prioritySupport: "Email + phone, dedicated",
  },
};

export const FEATURE_METADATA: Record<PlanFeatureKey, FeatureMetadata> = {
  studentProfiles: {
    title: "Student Profiles & Directory",
    description: "Full directory and biographical student profiles.",
    section: "Student Management",
    minPlan: "BASIC",
  },
  bulkImport: {
    title: "CSV Bulk Import",
    description: "Import hundreds of resident students via spreadsheet upload.",
    section: "Student Management",
    minPlan: "PRO",
  },
  digitalIdCards: {
    title: "Digital ID Card & Pass",
    description: "Scannable student passes with instant QR verification.",
    section: "Student Management",
    minPlan: "BASIC",
  },
  academicYearsDepartments: {
    title: "Academic Structure",
    description: "Configure terms, years of study, and department hierarchies.",
    section: "Core Operations",
    minPlan: "BASIC",
  },
  roomManagement: {
    title: "Room & Bed Allocation",
    description: "Manage rooms, inventory, and assign residents to beds.",
    section: "Rooms & Allocation",
    minPlan: "BASIC",
  },
  bedTransfer: {
    title: "Bed Transfers & Vacating",
    description: "Transfer students between rooms and record bed vacations.",
    section: "Rooms & Allocation",
    minPlan: "BASIC",
  },
  visualBedMap: {
    title: "Interactive Bed & Floor Map",
    description: "Visual floor-by-floor occupancy map across multiple blocks.",
    section: "Rooms & Allocation",
    minPlan: "PRO",
  },
  messAttendance: {
    title: "Mess QR Attendance",
    description: "Track meal sessions and verify dining entries via barcode/QR scanner.",
    section: "Attendance",
    minPlan: "BASIC",
  },
  gatePassScanner: {
    title: "Gate Outing Passes",
    description: "Real-time gate pass check-out and check-in logging for campus security.",
    section: "Passes & Outings",
    minPlan: "BASIC",
  },
  overdueAlerts: {
    title: "Overdue Return Alerts",
    description: "Automated high-priority alerts for students past gate return deadlines.",
    section: "Passes & Outings",
    minPlan: "PRO",
  },
  leaveWorkflow: {
    title: "Leave Applications & Approvals",
    description: "Multi-stage leave requests, warden approvals, and student history.",
    section: "Leaves",
    minPlan: "BASIC",
  },
  rebateCalculation: {
    title: "Mess Rebate Calculation",
    description: "Automated mess fee deductions calculated during approved leave dates.",
    section: "Leaves",
    minPlan: "PRO",
  },
  monthlyBilling: {
    title: "Monthly Invoicing & Fee Generation",
    description: "Automated monthly rent, mess, and utility bill generation.",
    section: "Billing & Payments",
    minPlan: "PRO",
  },
  onlinePayments: {
    title: "Online Payment Collection & Receipts",
    description: "Digital payment recording, transaction reconciliation, and receipts.",
    section: "Billing & Payments",
    minPlan: "PRO",
  },
  paymentReconciliation: {
    title: "Payment Reconciliation & Dues Ledger",
    description: "Student dues tracking and financial status verification.",
    section: "Billing & Payments",
    minPlan: "PRO",
  },
  customFeeStructures: {
    title: "Custom Multi-Tier Fee Schedules",
    description: "Department-specific and scholar fee customization rules.",
    section: "Billing & Payments",
    minPlan: "ENTERPRISE",
  },
  incidentReporting: {
    title: "Discipline Flags & Incident Reports",
    description: "Record infractions, warden notes, and behavioral flag alerts.",
    section: "Discipline & Governance",
    minPlan: "PRO",
  },
  disciplineWorkflow: {
    title: "Discipline Resolution Workflows",
    description: "Multi-tier escalation, hearing records, and case resolution logging.",
    section: "Discipline & Governance",
    minPlan: "PRO",
  },
  customBranding: {
    title: "Custom Tenant Branding",
    description: "Hostel-specific theme colors, custom logos, banners, and favicons.",
    section: "Branding & Access",
    minPlan: "PRO",
  },
  customDomain: {
    title: "Custom Subdomain & CNAME",
    description: "Host your portal under your own institution domain.",
    section: "Branding & Access",
    minPlan: "ENTERPRISE",
  },
  ssoAuth: {
    title: "SSO & SAML / OAuth Login",
    description: "Single sign-on integration with university directory.",
    section: "Branding & Access",
    minPlan: "ENTERPRISE",
  },
  standardReports: {
    title: "Standard Operational Reports",
    description: "Export roster, occupancy, and attendance logs.",
    section: "Reporting",
    minPlan: "BASIC",
  },
  crossBlockAnalytics: {
    title: "Cross-Block Analytics & Insights",
    description: "Cross-department analytics and comparative hostel metrics.",
    section: "Reporting",
    minPlan: "PRO",
  },
  customReportBuilder: {
    title: "Custom Report Builder & Scheduled Exports",
    description: "Drag-and-drop report constructor with scheduled email dispatches.",
    section: "Reporting",
    minPlan: "ENTERPRISE",
  },
  apiAccess: {
    title: "Developer REST API Access",
    description: "Direct API keys and webhook integration into college ERP.",
    section: "Platform & Ops",
    minPlan: "ENTERPRISE",
  },
  backupDrSla: {
    title: "Dedicated Backup & Disaster Recovery SLA",
    description: "Guaranteed recovery time objective (RTO) and point objective (RPO).",
    section: "Platform & Ops",
    minPlan: "ENTERPRISE",
  },
  prioritySupport: {
    title: "Priority Technical Support",
    description: "Dedicated account manager and 24/7 emergency response hotline.",
    section: "Platform & Ops",
    minPlan: "PRO",
  },
};

export function normalizePlanTier(plan?: string | null): "BASIC" | "PRO" | "ENTERPRISE" {
  if (!plan) return "BASIC";
  const upper = plan.toUpperCase();
  if (upper.includes("ENTERPRISE")) return "ENTERPRISE";
  if (upper.includes("PRO")) return "PRO";
  return "BASIC";
}

export function isPlanFeatureEnabled(plan: string | undefined | null, featureKey: PlanFeatureKey): boolean {
  const tier = normalizePlanTier(plan);
  return Boolean(PLAN_FEATURES[tier]?.[featureKey]);
}

export function getPlanTierLimit(plan: string | undefined | null, limitKey: PlanLimitKey): number {
  const tier = normalizePlanTier(plan);
  return PLAN_LIMITS[tier]?.[limitKey] ?? Infinity;
}

export function getRequiredPlanForFeature(featureKey: PlanFeatureKey): "BASIC" | "PRO" | "ENTERPRISE" {
  return FEATURE_METADATA[featureKey]?.minPlan || "PRO";
}
