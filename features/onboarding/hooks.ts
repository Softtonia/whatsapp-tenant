import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOnboardingOverview,
  fetchOnboardingSteps,
  fetchOnboardingProgress,
  fetchOnboardingRequirements,
  saveTenantRegistration,
  completeTenantRegistration,
  saveBusinessInformation,
  completeBusinessInformation,
  completeSubscriptionPlan,
  completeMarketingCompliance,
  completeFinalActivation,
  submitOnboarding,
  fetchOnboardingStatus,
  saveBusinessProfile,
  saveRegionalPreferences,
  saveWhatsAppConnection,
  saveTeamInvitations,
  completeOnboarding,
  fetchTenantIndustries,
  uploadTenantDocument,
  fetchTenantDocuments,
  fetchTenantDocument,
  updateTenantDocument,
  replaceTenantDocument,
  fetchTenantDocumentStatus,
  downloadTenantDocument,
  deleteTenantDocument,
  isOnboardingComplete,
} from "./api";
import type { TenantDocument } from "@/types/onboarding";
import { useTenantStore } from "@/lib/tenant/store";
import type {
  TenantRegistrationData,
  BusinessInformationData,
  SubscriptionPlanData,
  MarketingComplianceData,
  FinalActivationData,
  BusinessProfileData,
  RegionalPreferencesData,
  WhatsAppConnectionData,
  TeamInvitationsData,
} from "@/types/onboarding";

export const onboardingKeys = {
  all: ["onboarding"] as const,
  overview: () => [...onboardingKeys.all, "overview"] as const,
  steps: () => [...onboardingKeys.all, "steps"] as const,
  progress: () => [...onboardingKeys.all, "progress"] as const,
  requirements: () => [...onboardingKeys.all, "requirements"] as const,
  status: () => [...onboardingKeys.all, "status"] as const,
};

export function useOnboardingOverviewQuery() {
  return useQuery({
    queryKey: onboardingKeys.overview(),
    queryFn: fetchOnboardingOverview,
    staleTime: 1000 * 60 * 2,
  });
}

export function useOnboardingStepsQuery() {
  return useQuery({
    queryKey: onboardingKeys.steps(),
    queryFn: fetchOnboardingSteps,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOnboardingProgressQuery() {
  return useQuery({
    queryKey: onboardingKeys.progress(),
    queryFn: fetchOnboardingProgress,
    staleTime: 1000 * 30,
  });
}

export function useOnboardingRequirementsQuery() {
  return useQuery({
    queryKey: onboardingKeys.requirements(),
    queryFn: fetchOnboardingRequirements,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTenantIndustriesQuery(tenantId?: string | number) {
  return useQuery({
    queryKey: ["tenant", "industries", tenantId],
    queryFn: () => fetchTenantIndustries(tenantId),
    staleTime: 1000 * 60 * 30,
  });
}

export function useTenantDocumentsQuery(tenantId?: string | number) {
  return useQuery({
    queryKey: ["tenant", "documents", tenantId],
    queryFn: () => fetchTenantDocuments(tenantId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUploadTenantDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      file: File | FormData;
      document_type?: string;
      tenantId?: string | number;
    }) =>
      uploadTenantDocument(variables.file, {
        document_type: variables.document_type || "logo",
        tenantId: variables.tenantId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "documents"] });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.steps() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.progress() });
    },
  });
}

export function useTenantDocumentQuery(
  documentId?: string | number | null,
  tenantId?: string | number
) {
  return useQuery({
    queryKey: ["tenant", "documents", documentId, tenantId],
    queryFn: () => (documentId ? fetchTenantDocument(documentId, tenantId) : null),
    enabled: Boolean(documentId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTenantDocumentStatusQuery(
  documentId?: string | number | null,
  tenantId?: string | number
) {
  return useQuery({
    queryKey: ["tenant", "documents", documentId, "status", tenantId],
    queryFn: () => (documentId ? fetchTenantDocumentStatus(documentId, tenantId) : null),
    enabled: Boolean(documentId),
    staleTime: 1000 * 30, // 30s
  });
}

export function useUpdateTenantDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      documentId: string | number;
      data: Partial<TenantDocument>;
      tenantId?: string | number;
    }) => updateTenantDocument(variables.documentId, variables.data, variables.tenantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tenant", "documents", variables.documentId],
      });
    },
  });
}

export function useReplaceTenantDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      documentId: string | number;
      file: File | FormData;
      name?: string;
      title?: string;
      document_type?: string;
      tenantId?: string | number;
    }) =>
      replaceTenantDocument(variables.documentId, variables.file, {
        name: variables.name,
        title: variables.title,
        document_type: variables.document_type,
        tenantId: variables.tenantId,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tenant", "documents"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tenant", "documents", variables.documentId],
      });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.steps() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.progress() });
    },
  });
}

export function useDownloadTenantDocumentMutation() {
  return useMutation({
    mutationFn: (variables: {
      documentId: string | number;
      tenantId?: string | number;
    }) => downloadTenantDocument(variables.documentId, variables.tenantId),
  });
}

export function useDeleteTenantDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      documentId: string | number;
      tenantId?: string | number;
    }) => deleteTenantDocument(variables.documentId, variables.tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "documents"] });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.steps() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.progress() });
    },
  });
}

export function useSaveTenantRegistrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TenantRegistrationData) => saveTenantRegistration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.progress() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.steps() });
    },
  });
}

export function useCompleteTenantRegistrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: TenantRegistrationData) => completeTenantRegistration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.progress() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.steps() });
    },
  });
}

export function useSaveBusinessInfoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BusinessInformationData> | FormData) => saveBusinessInformation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.progress() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.steps() });
    },
  });
}

export function useCompleteBusinessInfoMutation() {
  const queryClient = useQueryClient();
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const activeTenant = useTenantStore((s) => s.activeTenant);

  return useMutation({
    mutationFn: (data: BusinessInformationData | FormData) => completeBusinessInformation(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.progress() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.steps() });
      if (activeTenant && res?.business_information?.business_display_name) {
        setActiveTenant({
          ...activeTenant,
          name: res.business_information.business_display_name,
        });
      }
    },
  });
}

export function useCompleteSubscriptionPlanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubscriptionPlanData) => completeSubscriptionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.progress() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.steps() });
    },
  });
}

export function useCompleteMarketingComplianceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarketingComplianceData) => completeMarketingCompliance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.progress() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.steps() });
    },
  });
}

export function useCompleteFinalActivationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: FinalActivationData) => completeFinalActivation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.progress() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.steps() });
    },
  });
}

export function useSubmitOnboardingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.progress() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.overview() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.steps() });
    },
  });
}

// Legacy helpers
export function useOnboardingStatusQuery() {
  return useQuery({
    queryKey: onboardingKeys.status(),
    queryFn: fetchOnboardingStatus,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSaveBusinessProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BusinessProfileData) => saveBusinessProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(onboardingKeys.status(), data);
    },
  });
}

export function useSaveRegionalPreferencesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegionalPreferencesData) => saveRegionalPreferences(data),
    onSuccess: (data) => {
      queryClient.setQueryData(onboardingKeys.status(), data);
    },
  });
}

export function useSaveWhatsAppConnectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WhatsAppConnectionData) => saveWhatsAppConnection(data),
    onSuccess: (data) => {
      queryClient.setQueryData(onboardingKeys.status(), data);
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

export { isOnboardingComplete };
