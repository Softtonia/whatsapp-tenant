export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "running"
  | "completed"
  | "paused"
  | "cancelled"
  | "failed";

export interface CampaignAudienceConfig {
  tags?: string[];
  variable_mapping?: Record<string, string>;
  excluded_tags?: string[];
}

export interface Campaign {
  id: number | string;
  tenant_id?: number | string;
  name: string;
  template_id: number | string;
  template_name?: string;
  phone_number_id: number | string;
  sender_number?: string;
  status: CampaignStatus;
  scheduled_at?: string | null;
  audience_config: CampaignAudienceConfig;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  created_at: string;
  updated_at?: string;
}

export interface CampaignAnalytics {
  campaign_id: number | string;
  campaign_name: string;
  total_recipients: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  delivery_rate: number;
  read_rate: number;
  click_rate?: number;
}

export interface CampaignRecipient {
  id: number | string;
  campaign_id: number | string;
  contact_id?: number | string;
  contact_name: string;
  contact_phone: string;
  status: "sent" | "delivered" | "read" | "failed";
  sent_at?: string | null;
  delivered_at?: string | null;
  read_at?: string | null;
  error_message?: string | null;
}

export interface CampaignQueryParams {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

