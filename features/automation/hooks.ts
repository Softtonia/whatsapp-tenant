import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAutomationRules,
  createAutomationRule,
  updateAutomationRule,
  toggleAutomationRule,
  deleteAutomationRule,
  fetchAutomationLogs,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type { AutomationRuleFormData } from "./schemas";

export const automationKeys = {
  all: ["automation"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...automationKeys.all, String(tenantId ?? "default")] as const,
  rules: (tenantId: string | number | undefined) =>
    [...automationKeys.tenant(tenantId), "rules"] as const,
  logs: (tenantId: string | number | undefined) =>
    [...automationKeys.tenant(tenantId), "logs"] as const,
};

export function useAutomationRulesQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: automationKeys.rules(tenantId),
    queryFn: () => fetchAutomationRules(),
    staleTime: 1000 * 30,
  });
}

export function useCreateAutomationRuleMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: AutomationRuleFormData) => createAutomationRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: automationKeys.rules(tenantId),
      });
    },
  });
}

export function useUpdateAutomationRuleMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<AutomationRuleFormData>;
    }) => updateAutomationRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: automationKeys.rules(tenantId),
      });
    },
  });
}

export function useToggleRuleMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => toggleAutomationRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: automationKeys.rules(tenantId),
      });
    },
  });
}

export function useDeleteAutomationRuleMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => deleteAutomationRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: automationKeys.rules(tenantId),
      });
    },
  });
}

export function useAutomationLogsQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: automationKeys.logs(tenantId),
    queryFn: () => fetchAutomationLogs(),
    staleTime: 1000 * 15,
    refetchInterval: 15000,
  });
}

