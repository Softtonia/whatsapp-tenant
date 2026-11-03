import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type {
  SubscriptionOverview,
  QuotaUsageSummary,
  Invoice,
  ChangePlanPayload,
} from "@/types/billing";
import type { CancelSubscriptionFormData } from "./schemas";

export async function fetchSubscriptionOverview(): Promise<SubscriptionOverview> {
  const res = await apiClient.get<SubscriptionOverview>(API_ENDPOINTS.BILLING.SUBSCRIPTION);
  return res.data;
}

export async function fetchQuotaUsage(): Promise<QuotaUsageSummary> {
  const res = await apiClient.get<QuotaUsageSummary>(API_ENDPOINTS.BILLING.USAGE);
  return res.data;
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const res = await apiClient.get<Invoice[]>(API_ENDPOINTS.BILLING.INVOICES);
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchInvoiceDetail(id: string | number): Promise<Invoice> {
  const res = await apiClient.get<Invoice>(API_ENDPOINTS.BILLING.INVOICE_DETAIL(id));
  return res.data;
}

export async function changeSubscriptionPlan(
  payload: ChangePlanPayload
): Promise<SubscriptionOverview> {
  const res = await apiClient.post<SubscriptionOverview>(
    API_ENDPOINTS.BILLING.CHANGE_PLAN,
    payload
  );
  return res.data;
}

export async function cancelSubscription(
  payload: CancelSubscriptionFormData
): Promise<SubscriptionOverview> {
  const res = await apiClient.post<SubscriptionOverview>(
    API_ENDPOINTS.BILLING.CANCEL,
    payload
  );
  return res.data;
}

export async function verifyCheckoutStatus(
  checkoutId: string | number
): Promise<{ status: string; paid: boolean }> {
  const res = await apiClient.get<{ status: string; paid: boolean }>(
    API_ENDPOINTS.BILLING.CHECKOUT_STATUS(checkoutId)
  );
  return res.data;
}

