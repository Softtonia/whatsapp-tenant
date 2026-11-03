import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type {
  OnboardingStatusData,
  BusinessProfileData,
  RegionalPreferencesData,
  WhatsAppConnectionData,
  TeamInvitationsData,
} from "@/types/onboarding";

export async function fetchOnboardingStatus(): Promise<OnboardingStatusData> {
  const response = await apiClient.get<OnboardingStatusData>(API_ENDPOINTS.ONBOARDING.STATUS);
  return response.data;
}

export async function saveBusinessProfile(data: BusinessProfileData): Promise<OnboardingStatusData> {
  const response = await apiClient.post<OnboardingStatusData>(API_ENDPOINTS.ONBOARDING.STATUS, {
    step: "business_profile",
    ...data,
  });
  return response.data;
}

export async function saveRegionalPreferences(data: RegionalPreferencesData): Promise<OnboardingStatusData> {
  const response = await apiClient.patch<OnboardingStatusData>(API_ENDPOINTS.ONBOARDING.STATUS, {
    step: "regional_preferences",
    ...data,
  });
  return response.data;
}

export async function saveWhatsAppConnection(data: WhatsAppConnectionData): Promise<OnboardingStatusData> {
  const response = await apiClient.patch<OnboardingStatusData>(API_ENDPOINTS.ONBOARDING.STATUS, {
    step: "whatsapp_connection",
    ...data,
  });
  return response.data;
}

export async function saveTeamInvitations(data: TeamInvitationsData): Promise<OnboardingStatusData> {
  const response = await apiClient.patch<OnboardingStatusData>(API_ENDPOINTS.ONBOARDING.STATUS, {
    step: "team_invitations",
    ...data,
  });
  return response.data;
}

export async function completeOnboarding(): Promise<OnboardingStatusData> {
  const response = await apiClient.patch<OnboardingStatusData>(API_ENDPOINTS.ONBOARDING.STATUS, {
    step: "complete",
    is_completed: true,
  });
  return response.data;
}

