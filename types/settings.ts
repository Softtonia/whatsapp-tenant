export interface BusinessProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  currency?: string;
}

export interface DaySchedule {
  start: string;
  end: string;
  open: boolean;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface WorkspacePreferences {
  timezone: string;
  locale: string;
  date_format: string;
  time_format: string;
  default_whatsapp_account_id?: number | string | null;
  business_hours: BusinessHours;
}

export interface WorkspaceBranding {
  brand_name: string;
  logo_url?: string | null;
  logo_media_id?: number | string | null;
  primary_color: string;
  secondary_color: string;
  support_email: string;
}

export interface NotificationPreferences {
  inbound_message_alerts: boolean;
  campaign_delivery_reports: boolean;
  quota_warning_alerts: boolean;
  email_daily_digest: boolean;
  sound_notifications: boolean;
  security_alerts: boolean;
}

export interface UserSession {
  id: string | number;
  ip_address: string;
  user_agent: string;
  device_name?: string;
  browser?: string;
  location?: string;
  is_current: boolean;
  last_activity_at: string;
}

export interface WorkspaceSettingsOverview {
  profile: BusinessProfile;
  preferences: WorkspacePreferences;
  branding: WorkspaceBranding;
  notification_preferences: NotificationPreferences;
}

