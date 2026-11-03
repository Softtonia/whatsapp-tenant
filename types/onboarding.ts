export type OnboardingStepName =
  | "business_profile"
  | "regional_preferences"
  | "whatsapp_connection"
  | "team_invitations"
  | "complete";

export interface BusinessProfileData {
  company_name: string;
  company_email: string;
  contact_number: string;
  address?: string;
  country?: string;
  logo_url?: string | null;
}

export interface RegionalPreferencesData {
  timezone: string;
  currency: string;
}

export interface WhatsAppConnectionData {
  defer_whatsapp?: boolean;
  phone_number?: string;
  waba_id?: string;
}

export interface TeamInvitee {
  email: string;
  role: "admin" | "agent" | "viewer";
}

export interface TeamInvitationsData {
  invitees: TeamInvitee[];
}

export interface OnboardingStatusData {
  current_step: OnboardingStepName;
  is_completed: boolean;
  business_profile?: BusinessProfileData;
  regional_preferences?: RegionalPreferencesData;
  whatsapp_connection?: WhatsAppConnectionData;
  team_invitations?: TeamInvitationsData;
}

