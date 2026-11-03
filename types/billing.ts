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
}

export interface SubscriptionOverview {
  id: number | string;
  tenant_id: number | string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
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
  billing_cycle?: BillingCycle;
  effective_timing?: "immediate" | "period_end";
  reason?: string;
}

