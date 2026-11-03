import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOnboardingStatus,
  saveBusinessProfile,
  saveRegionalPreferences,
  saveWhatsAppConnection,
  saveTeamInvitations,
  completeOnboarding,
} from "./api";
import { useTenantStore } from "@/lib/tenant/store";
import type {
  BusinessProfileData,
  RegionalPreferencesData,
  WhatsAppConnectionData,
  TeamInvitationsData,
} from "@/types/onboarding";

export const onboardingKeys = {
  all: ["onboarding"] as const,
  status: () => [...onboardingKeys.all, "status"] as const,
};

export function useOnboardingStatusQuery() {
  return useQuery({
    queryKey: onboardingKeys.status(),
    queryFn: fetchOnboardingStatus,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSaveBusinessProfileMutation() {
  const queryClient = useQueryClient();
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const activeTenant = useTenantStore((s) => s.activeTenant);

  return useMutation({
    mutationFn: (data: BusinessProfileData) => saveBusinessProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(onboardingKeys.status(), data);
      if (activeTenant && data.business_profile) {
        setActiveTenant({
          ...activeTenant,
          name: data.business_profile.company_name,
        });
      }
    },
  });
}

export function useSaveRegionalPreferencesMutation() {
  const queryClient = useQueryClient();
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const activeTenant = useTenantStore((s) => s.activeTenant);

  return useMutation({
    mutationFn: (data: RegionalPreferencesData) => saveRegionalPreferences(data),
    onSuccess: (data) => {
      queryClient.setQueryData(onboardingKeys.status(), data);
      if (activeTenant && data.regional_preferences) {
        setActiveTenant({
          ...activeTenant,
          timezone: data.regional_preferences.timezone,
          currency: data.regional_preferences.currency,
        });
      }
    },
  });
}

export function useSaveWhatsAppConnectionMutation() {
  const queryClient = useQueryClient();
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const activeTenant = useTenantStore((s) => s.activeTenant);

  return useMutation({
    mutationFn: (data: WhatsAppConnectionData) => saveWhatsAppConnection(data),
    onSuccess: (data) => {
      queryClient.setQueryData(onboardingKeys.status(), data);
      if (activeTenant && data.whatsapp_connection?.phone_number) {
        setActiveTenant({
          ...activeTenant,
          default_phone_number: data.whatsapp_connection.phone_number,
          waba_id: data.whatsapp_connection.waba_id ?? activeTenant.waba_id,
        });
      }
    },
  });
}

export function useSaveTeamInvitationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TeamInvitationsData) => saveTeamInvitations(data),
    onSuccess: (data) => {
      queryClient.setQueryData(onboardingKeys.status(), data);
    },
  });
}

export function useCompleteOnboardingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: (data) => {
      queryClient.setQueryData(onboardingKeys.status(), data);
    },
  });
}

