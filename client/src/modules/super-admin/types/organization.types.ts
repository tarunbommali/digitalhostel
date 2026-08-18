export type OrganizationPlan = 'basic' | 'pro' | 'enterprise';
export type OrganizationSubscriptionStatus = 'active' | 'trial' | 'expired' | 'inactive' | 'cancelled';

export interface Organization {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  location: string;
  plan: OrganizationPlan;
  subscriptionStatus: OrganizationSubscriptionStatus;
  adminName?: string;
  adminEmail: string;
  totalUsers?: number;
  tagline?: string;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    bannerUrl?: string;
    faviconUrl?: string;
    tagline?: string;
  };
  createdAt?: string;
  createdDate?: string;
  isActive?: boolean;
}

export interface OrganizationFormData {
  name: string;
  slug: string;
  location: string;
  plan: string;
  subscriptionStatus: string;
  adminName: string;
  adminEmail: string;
  adminPassword?: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
}

export interface KPIMetrics {
  total: number;
  active: number;
  totalUsers: number;
  enterpriseCount: number;
  proCount: number;
  basicCount: number;
}
