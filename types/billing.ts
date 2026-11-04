export type PlanTier = "starter" | "growth" | "enterprise";
export type BillingCycle = "monthly" | "annual";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "paused";
export type InvoiceStatus = "paid" | "open" | "uncollectible" | "void";

export interface SubscriptionPlan {
  id: number | string;
  name: string;
  tier: PlanTier;
  price_monthly: number;
  price_annual: number;
  currency: string;
  description: string;
  features: string[];
  limits: {
    monthly_service_conversations: number;
    monthly_marketing_messages: number;
    contacts_limit: number;
    team_members_limit: number;
    whatsapp_numbers_limit: number;
  };
  is_popular?: boolean;
  [key: string]: any;
}

export interface SubscriptionOverview {
  id: number | string;
  tenant_id: number | string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle | "monthly" | "yearly";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_ends_at?: string | null;
  payment_method?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  } | null;
  [key: string]: any;
}

export interface QuotaMetric {
  used: number;
  limit: number;
  percentage: number;
  reset_date?: string;
}

export interface QuotaUsageSummary {
  service_conversations: QuotaMetric;
  marketing_broadcasts: QuotaMetric;
  contacts: QuotaMetric;
  team_members: QuotaMetric;
  whatsapp_numbers: QuotaMetric;
  updated_at: string;
  [key: string]: any;
}

export interface SubscriptionLimits {
  monthly_conversations?: number;
  monthly_marketing_messages?: number;
  contacts_limit?: number;
  team_members_limit?: number;
  whatsapp_numbers_limit?: number;
  custom_templates_limit?: number;
  [key: string]: any;
}

export interface SubscriptionHistoryItem {
  id: number | string;
  action?: string;
  description?: string;
  plan_name?: string;
  plan_tier?: string;
  billing_cycle?: string;
  amount?: number;
  currency?: string;
  status?: string;
  invoice_number?: string;
  created_at: string;
  [key: string]: any;
}

export interface Invoice {
  id: number | string;
  invoice_number: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: InvoiceStatus;
  billing_period_start: string;
  billing_period_end: string;
  paid_at?: string | null;
  download_url?: string;
  created_at: string;
}

export interface ChangePlanPayload {
  plan_id: number | string;
  subscription_plan_id?: number | string;
  billing_cycle?: BillingCycle | "monthly" | "yearly" | "annual";
  effective_timing?: "immediate" | "period_end";
  reason?: string;
  [key: string]: any;
}

export interface SelectPlanPayload {
  plan_id?: number | string;
  subscription_plan_id?: number | string;
  billing_cycle?: BillingCycle | "monthly" | "yearly" | "annual";
  [key: string]: any;
}
