import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTenantSubscriptionPlans,
  fetchTenantSubscriptionPlanDetail,
  fetchTenantSubscription,
  selectTenantSubscriptionPlan,
  changeTenantSubscriptionPlan,
  fetchTenantSubscriptionUsage,
  fetchTenantSubscriptionLimits,
  fetchTenantSubscriptionHistory,
  fetchSubscriptionOverview,
  fetchQuotaUsage,
  fetchInvoices,
  fetchInvoiceDetail,
  changeSubscriptionPlan,
  cancelSubscription,
  createBillingCheckout,
  verifyBillingPayment,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type {
  ChangePlanPayload,
  SelectPlanPayload,
  CreateCheckoutPayload,
  VerifyPaymentPayload,
} from "@/types/billing";
import type { CancelSubscriptionFormData } from "./schemas";

export const billingKeys = {
  all: ["billing"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...billingKeys.all, String(tenantId ?? "default")] as const,
  subscription: (tenantId: string | number | undefined) =>
    [...billingKeys.tenant(tenantId), "subscription"] as const,
  plans: (tenantId: string | number | undefined) =>
    [...billingKeys.tenant(tenantId), "plans"] as const,
  planDetail: (tenantId: string | number | undefined, planId: string | number | undefined) =>
    [...billingKeys.plans(tenantId), String(planId)] as const,
  usage: (tenantId: string | number | undefined) =>
    [...billingKeys.tenant(tenantId), "usage"] as const,
  limits: (tenantId: string | number | undefined) =>
    [...billingKeys.tenant(tenantId), "limits"] as const,
  history: (tenantId: string | number | undefined, perPage?: number) =>
    [...billingKeys.tenant(tenantId), "history", String(perPage ?? 15)] as const,
  invoices: (tenantId: string | number | undefined) =>
    [...billingKeys.tenant(tenantId), "invoices"] as const,
  invoiceDetail: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...billingKeys.invoices(tenantId), String(id)] as const,
};

// 1. Tenant Plans & Selection (Part 1 - Onboarding Step)
export function useTenantSubscriptionPlansQuery(tenantIdOverride?: string | number) {
  const { activeTenant } = useActiveTenant();
  const tenantId = tenantIdOverride ?? activeTenant?.id;

  return useQuery({
    queryKey: billingKeys.plans(tenantId),
    queryFn: () => fetchTenantSubscriptionPlans(tenantId),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useTenantSubscriptionPlanDetailQuery(
  planId: string | number | undefined | null,
  tenantIdOverride?: string | number
) {
  const { activeTenant } = useActiveTenant();
  const tenantId = tenantIdOverride ?? activeTenant?.id;

  return useQuery({
    queryKey: billingKeys.planDetail(tenantId, planId ?? undefined),
    queryFn: () => (planId ? fetchTenantSubscriptionPlanDetail(planId, tenantId) : null),
    enabled: Boolean(planId),
    staleTime: 1000 * 60 * 30,
  });
}

export function useTenantSubscriptionQuery(tenantIdOverride?: string | number) {
  const { activeTenant } = useActiveTenant();
  const tenantId = tenantIdOverride ?? activeTenant?.id;

  return useQuery({
    queryKey: billingKeys.subscription(tenantId),
    queryFn: () => fetchTenantSubscription(tenantId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSelectTenantSubscriptionPlanMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (payload: SelectPlanPayload) => selectTenantSubscriptionPlan(payload, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription(tenantId) });
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    },
  });
}

// 2. Profile & Billing Management (Part 2 - Change Plan, Usage, Limits, History)
export function useChangeTenantSubscriptionPlanMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (payload: ChangePlanPayload) => changeTenantSubscriptionPlan(payload, tenantId),
    onSuccess: (updated) => {
      queryClient.setQueryData(billingKeys.subscription(tenantId), updated);
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription(tenantId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.usage(tenantId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.limits(tenantId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.history(tenantId) });
    },
  });
}

export function useTenantSubscriptionUsageQuery(tenantIdOverride?: string | number) {
  const { activeTenant } = useActiveTenant();
  const tenantId = tenantIdOverride ?? activeTenant?.id;

  return useQuery({
    queryKey: billingKeys.usage(tenantId),
    queryFn: () => fetchTenantSubscriptionUsage(tenantId),
    staleTime: 1000 * 30,
    refetchInterval: 30000,
  });
}

export function useTenantSubscriptionLimitsQuery(tenantIdOverride?: string | number) {
  const { activeTenant } = useActiveTenant();
  const tenantId = tenantIdOverride ?? activeTenant?.id;

  return useQuery({
    queryKey: billingKeys.limits(tenantId),
    queryFn: () => fetchTenantSubscriptionLimits(tenantId),
    staleTime: 1000 * 60 * 10,
  });
}

export function useTenantSubscriptionHistoryQuery(
  params: { per_page?: number; page?: number } = { per_page: 15 },
  tenantIdOverride?: string | number
) {
  const { activeTenant } = useActiveTenant();
  const tenantId = tenantIdOverride ?? activeTenant?.id;

  return useQuery({
    queryKey: billingKeys.history(tenantId, params.per_page),
    queryFn: () => fetchTenantSubscriptionHistory(params, tenantId),
    staleTime: 1000 * 60 * 5,
  });
}

// 3. Backward-Compatible Queries
export function useSubscriptionQuery() {
  return useTenantSubscriptionQuery();
}

export function useQuotaUsageQuery() {
  return useTenantSubscriptionUsageQuery();
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
  return useChangeTenantSubscriptionPlanMutation();
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

// Step 4: Razorpay Checkout Order Creation
export function useCreateBillingCheckoutMutation(tenantIdOverride?: string | number) {
  const { activeTenant } = useActiveTenant();
  const tenantId = tenantIdOverride ?? activeTenant?.id;

  return useMutation({
    mutationFn: (payload: CreateCheckoutPayload) =>
      createBillingCheckout(payload, tenantId),
  });
}

// Step 6: Razorpay Payment Signature Verification & Subscription Activation
export function useVerifyBillingPaymentMutation(tenantIdOverride?: string | number) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = tenantIdOverride ?? activeTenant?.id;

  return useMutation({
    mutationFn: (payload: VerifyPaymentPayload) =>
      verifyBillingPayment(payload, tenantId),
    onSuccess: (data) => {
      // Invalidate and sync all tenant subscription queries
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription(tenantId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.usage(tenantId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.limits(tenantId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.history(tenantId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices(tenantId) });
    },
  });
}

// Aliases matching the subscription API routes
export const useSubscriptionCheckoutMutation = useCreateBillingCheckoutMutation;
export const useSubscriptionVerifyPaymentMutation = useVerifyBillingPaymentMutation;
export const useSubscriptionPaymentsQuery = useTenantSubscriptionHistoryQuery;
