export interface Industry {
  id: number;
  name: string;
  slug: string;
  code: string;
  description: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Tenant {
  id: number | string;
  name: string;
  slug?: string;
  domain?: string;
  plan?: string;
  timezone?: string;
  currency?: string;
  default_phone_number?: string | null;
  status?: "active" | "inactive" | "suspended" | "trial" | string;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface WhatsAppHealthData {
  status: "healthy" | "connected" | "warning" | "error" | "disconnected" | string;
  quality_rating?: "GREEN" | "YELLOW" | "RED" | "UNKNOWN" | string;
  tier?: string;
  phone_numbers_count?: number;
  last_synced_at?: string;
  display_phone_number?: string;
  verified_name?: string;
  phone_number_id?: string;
  messaging_limit?: string;
  webhook_status?: string;
  [key: string]: any;
}
