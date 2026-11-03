import type { Conversation } from "./whatsapp";
import type { WhatsAppHealthData } from "./tenant";

export interface KpiMetric {
  value: number;
  previous_value?: number;
  change_pct?: number;
  trend?: "up" | "down" | "neutral";
}

export interface DashboardOverviewData {
  conversations: {
    total: number;
    open: number;
    unresolved: number;
    change_pct: number;
  };
  contacts: {
    total: number;
    new_today: number;
    change_pct: number;
  };
  campaigns: {
    total_sent: number;
    delivery_rate: number;
    read_rate: number;
    change_pct: number;
  };
  response_time: {
    average_minutes: number;
    sla_breaches: number;
    unresolved_sla_count: number;
  };
}

export interface ConversationActivityPoint {
  date: string;
  label: string;
  incoming: number;
  outgoing: number;
  resolved: number;
}

export interface CampaignSummaryItem {
  id: number | string;
  name: string;
  template_name: string;
  status: "scheduled" | "processing" | "completed" | "failed" | "cancelled" | "paused";
  total_recipients: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  delivery_rate: number;
  read_rate: number;
  sent_at?: string;
  created_at: string;
}

export interface QuotaItem {
  used: number;
  limit: number;
  percentage: number;
  unit?: string;
}

export interface UsageSummaryData {
  plan_name: string;
  plan_status: string;
  billing_cycle_end: string;
  conversations: QuotaItem;
  contacts: QuotaItem;
  team_seats: QuotaItem;
  phone_numbers: QuotaItem;
}

export interface DashboardData {
  overview: DashboardOverviewData;
  activity: ConversationActivityPoint[];
  recent_conversations: Conversation[];
  campaigns: CampaignSummaryItem[];
  whatsapp_health: WhatsAppHealthData;
  usage: UsageSummaryData;
  is_mock?: boolean;
}

