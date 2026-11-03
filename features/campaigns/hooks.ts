import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCampaigns,
  fetchCampaign,
  createCampaign,
  validateCampaign,
  testCampaign,
  dispatchCampaign,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
  fetchCampaignAnalytics,
  fetchCampaignRecipients,
  exportCampaignReport,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type { CampaignQueryParams } from "@/types/campaign";
import type { CampaignCreateData } from "./schemas";

export const campaignKeys = {
  all: ["campaigns"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...campaignKeys.all, String(tenantId ?? "default")] as const,
  lists: (tenantId: string | number | undefined) =>
    [...campaignKeys.tenant(tenantId), "list"] as const,
  list: (tenantId: string | number | undefined, params?: CampaignQueryParams) =>
    [...campaignKeys.lists(tenantId), params] as const,
  details: (tenantId: string | number | undefined) =>
    [...campaignKeys.tenant(tenantId), "detail"] as const,
  detail: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...campaignKeys.details(tenantId), String(id)] as const,
  analytics: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...campaignKeys.detail(tenantId, id), "analytics"] as const,
  recipients: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...campaignKeys.detail(tenantId, id), "recipients"] as const,
};

export function useCampaignsQuery(params?: CampaignQueryParams) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: campaignKeys.list(tenantId, params),
    queryFn: () => fetchCampaigns(params),
    staleTime: 1000 * 20,
    refetchInterval: 10000,
  });
}

export function useCampaignDetailQuery(id: string | number | null | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: campaignKeys.detail(tenantId, id ?? undefined),
    queryFn: () => fetchCampaign(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}

export function useCampaignAnalyticsQuery(id: string | number | null | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: campaignKeys.analytics(tenantId, id ?? undefined),
    queryFn: () => fetchCampaignAnalytics(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}

export function useCampaignRecipientsQuery(
  id: string | number | null | undefined,
  params?: { status?: string; search?: string; page?: number }
) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: [...campaignKeys.recipients(tenantId, id ?? undefined), params],
    queryFn: () => fetchCampaignRecipients(id!, params),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}

export function useCreateCampaignMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: CampaignCreateData) => createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists(tenantId) });
    },
  });
}

export function useValidateCampaignMutation() {
  return useMutation({
    mutationFn: (id: string | number) => validateCampaign(id),
  });
}

export function useTestCampaignMutation() {
  return useMutation({
    mutationFn: ({ id, phone }: { id: string | number; phone: string }) =>
      testCampaign(id, phone),
  });
}

export function useDispatchCampaignMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => dispatchCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists(tenantId) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(tenantId, id) });
    },
  });
}

export function usePauseCampaignMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => pauseCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists(tenantId) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(tenantId, id) });
    },
  });
}

export function useResumeCampaignMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => resumeCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists(tenantId) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(tenantId, id) });
    },
  });
}

export function useCancelCampaignMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => cancelCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists(tenantId) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(tenantId, id) });
    },
  });
}

export function useExportCampaignReportMutation() {
  return useMutation({
    mutationFn: (id: string | number) => exportCampaignReport(id),
  });
}

