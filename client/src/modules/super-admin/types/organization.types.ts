export interface Organization {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  location: string;
  plan: 'Basic' | 'Pro' | 'Enterprise' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  subscriptionStatus: 'Active' | 'Trial' | 'Expired' | 'Inactive' | 'Cancelled' | 'active' | 'trial' | 'expired' | 'inactive' | 'cancelled';
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
