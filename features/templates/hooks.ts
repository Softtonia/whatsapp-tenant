import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTemplates,
  fetchTemplate,
  createTemplate,
  syncTemplatesFromMeta,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type { TemplateQueryParams } from "@/types/template";
import type { TemplateCreateData } from "./schemas";

export const templateKeys = {
  all: ["templates"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...templateKeys.all, String(tenantId ?? "default")] as const,
  lists: (tenantId: string | number | undefined) =>
    [...templateKeys.tenant(tenantId), "list"] as const,
  list: (tenantId: string | number | undefined, params?: TemplateQueryParams) =>
    [...templateKeys.lists(tenantId), params] as const,
  details: (tenantId: string | number | undefined) =>
    [...templateKeys.tenant(tenantId), "detail"] as const,
  detail: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...templateKeys.details(tenantId), String(id)] as const,
};

export function useTemplatesQuery(params?: TemplateQueryParams) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: templateKeys.list(tenantId, params),
    queryFn: () => fetchTemplates(params),
    staleTime: 1000 * 30,
  });
}

export function useTemplateDetailQuery(id: string | number | null | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: templateKeys.detail(tenantId, id ?? undefined),
    queryFn: () => fetchTemplate(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });
}

export function useCreateTemplateMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: TemplateCreateData) => createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateKeys.lists(tenantId),
      });
    },
  });
}

export function useSyncTemplatesMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: () => syncTemplatesFromMeta(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateKeys.lists(tenantId),
      });
    },
  });
}

