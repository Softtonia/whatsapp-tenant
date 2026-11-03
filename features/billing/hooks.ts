import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSubscriptionOverview,
  fetchQuotaUsage,
  fetchInvoices,
  fetchInvoiceDetail,
  changeSubscriptionPlan,
  cancelSubscription,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type { ChangePlanPayload } from "@/types/billing";
import type { CancelSubscriptionFormData } from "./schemas";

export const billingKeys = {
  all: ["billing"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...billingKeys.all, String(tenantId ?? "default")] as const,
  subscription: (tenantId: string | number | undefined) =>
    [...billingKeys.tenant(tenantId), "subscription"] as const,
  usage: (tenantId: string | number | undefined) =>
    [...billingKeys.tenant(tenantId), "usage"] as const,
  invoices: (tenantId: string | number | undefined) =>
    [...billingKeys.tenant(tenantId), "invoices"] as const,
  invoiceDetail: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...billingKeys.invoices(tenantId), String(id)] as const,
};

export function useSubscriptionQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: billingKeys.subscription(tenantId),
    queryFn: () => fetchSubscriptionOverview(),
    staleTime: 1000 * 60,
  });
}

export function useQuotaUsageQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: billingKeys.usage(tenantId),
    queryFn: () => fetchQuotaUsage(),
    staleTime: 1000 * 30,
    refetchInterval: 30000,
  });
}

export function useInvoicesQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: billingKeys.invoices(tenantId),
    queryFn: () => fetchInvoices(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useInvoiceDetailQuery(id: string | number | undefined | null) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: billingKeys.invoiceDetail(tenantId, id ?? undefined),
    queryFn: () => fetchInvoiceDetail(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
}

export function useChangePlanMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (payload: ChangePlanPayload) => changeSubscriptionPlan(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(billingKeys.subscription(tenantId), updated);
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription(tenantId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.usage(tenantId) });
    },
  });
}

export function useCancelSubscriptionMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: CancelSubscriptionFormData) => cancelSubscription(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(billingKeys.subscription(tenantId), updated);
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription(tenantId) });
    },
  });
}

