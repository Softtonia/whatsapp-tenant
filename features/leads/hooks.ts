import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPipelineStages,
  fetchLeads,
  fetchLead,
  createLead,
  updateLead,
  updateLeadStage,
  addLeadNote,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type { LeadsQueryParams } from "@/types/lead";
import type { LeadFormData } from "./schemas";

export const leadKeys = {
  all: ["leads"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...leadKeys.all, String(tenantId ?? "default")] as const,
  stages: (tenantId: string | number | undefined) =>
    [...leadKeys.tenant(tenantId), "stages"] as const,
  lists: (tenantId: string | number | undefined) =>
    [...leadKeys.tenant(tenantId), "list"] as const,
  list: (tenantId: string | number | undefined, params?: LeadsQueryParams) =>
    [...leadKeys.lists(tenantId), params] as const,
  details: (tenantId: string | number | undefined) =>
    [...leadKeys.tenant(tenantId), "detail"] as const,
  detail: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...leadKeys.details(tenantId), String(id)] as const,
};

export function usePipelineStagesQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: leadKeys.stages(tenantId),
    queryFn: fetchPipelineStages,
    staleTime: 1000 * 60 * 10,
  });
}

export function useLeadsQuery(params?: LeadsQueryParams) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: leadKeys.list(tenantId, params),
    queryFn: () => fetchLeads(params),
    staleTime: 1000 * 30,
  });
}

export function useLeadDetailQuery(id: string | number | null | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: leadKeys.detail(tenantId, id ?? undefined),
    queryFn: () => fetchLead(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: LeadFormData) => createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists(tenantId) });
    },
  });
}

export function useUpdateLeadMutation(leadId?: string | number) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<LeadFormData> }) =>
      updateLead(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists(tenantId) });
      const targetId = variables.id || leadId;
      if (targetId) {
        queryClient.invalidateQueries({
          queryKey: leadKeys.detail(tenantId, targetId),
        });
      }
    },
  });
}

export function useUpdateLeadStageMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({
      id,
      pipelineStageId,
    }: {
      id: string | number;
      pipelineStageId: string | number;
    }) => updateLeadStage(id, pipelineStageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists(tenantId) });
    },
  });
}

export function useAddLeadNoteMutation(leadId: string | number) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (note: string) => addLeadNote(leadId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(tenantId, leadId) });
    },
  });
}

