import type { Industry, TenantDocument } from "./tenant";
export type { Industry, TenantDocument };

export type OnboardingStepKey =
  | "tenant_registration"
  | "business_information"
  | "subscription_plan"
  | "marketing_compliance"
  | "final_activation";

export interface TenantRegistrationData {
  name: string;
  company_name: string;
  country: string;
  timezone: string;
  preferred_language: string;
  terms_accepted: boolean;
  subdomain?: string;
  workspace_name?: string;
  [key: string]: any;
}

export interface BusinessInformationData {
  legal_business_name: string;
  business_display_name: string;
  business_type: "corporation" | "sole_proprietorship" | "partnership" | "llc" | string;
  industry_id?: number | string;
  business_email: string;
  business_phone: string;
  website_url?: string;
  business_description?: string;
  tax_registration_number?: string;
  registration_number?: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  address_line_1: string;
  address_line_2?: string;
  business_logo?: any;
}

export interface SubscriptionPlanData {
  subscription_plan_id: number;
  billing_cycle: "monthly" | "yearly";
}

export interface MarketingComplianceData {
  marketing_enabled: boolean;
  customer_opt_in_required: boolean;
  opt_in_method: string[];
  privacy_policy_url: string;
  unsubscribe_enabled: boolean;
  unsubscribe_keyword: string;
  default_language: string;
  default_country_code: string;
}

export interface FinalActivationData {
  accepted_terms?: boolean;
  notes?: string;
}

export interface OnboardingProgressData {
  current_step?: string;
  completed_steps?: string[];
  progress_percentage?: number;
  status?: string;
  steps?: Record<string, any>;
  [key: string]: any;
}

// Backward-compat aliases
export interface BusinessProfileData {
  company_name?: string;
  company_email?: string;
  contact_number?: string;
  address?: string;
  country?: string;
  logo_url?: string | null;
  [key: string]: any;
}
export type RegionalPreferencesData = any;
export type WhatsAppConnectionData = any;
export type TeamInvitationsData = any;
export type OnboardingStatusData = any;
