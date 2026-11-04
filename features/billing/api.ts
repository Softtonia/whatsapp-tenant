import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type {
  SubscriptionOverview,
  SubscriptionPlan,
  QuotaUsageSummary,
  SubscriptionLimits,
  SubscriptionHistoryItem,
  Invoice,
  ChangePlanPayload,
  SelectPlanPayload,
  CreateCheckoutPayload,
  RazorpayCheckoutData,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
} from "@/types/billing";
import type { CancelSubscriptionFormData } from "./schemas";

// 1. Tenant Subscription & Plans (Part 1 - Onboarding Step & Overview)
export async function fetchTenantSubscriptionPlans(
  tenantId?: string | number
): Promise<SubscriptionPlan[]> {
  const res = await apiClient.get<any>(
    API_ENDPOINTS.TENANT.SUBSCRIPTION.PLANS,
    { tenantId }
  );
  const data = res?.data || res;
  return Array.isArray(data) ? data : data?.plans || data?.data || [];
}

export async function fetchTenantSubscriptionPlanDetail(
  planId: string | number,
  tenantId?: string | number
): Promise<SubscriptionPlan> {
  const res = await apiClient.get<any>(
    API_ENDPOINTS.TENANT.SUBSCRIPTION.PLAN_DETAIL(planId),
    { tenantId }
  );
  return res?.data || res;
}

export async function fetchTenantSubscription(
  tenantId?: string | number
): Promise<SubscriptionOverview> {
  const res = await apiClient.get<any>(
    API_ENDPOINTS.TENANT.SUBSCRIPTION.BASE,
    { tenantId }
  );
  return res?.data || res;
}

export async function selectTenantSubscriptionPlan(
  payload: SelectPlanPayload,
  tenantId?: string | number
): Promise<any> {
  const res = await apiClient.post<any>(
    API_ENDPOINTS.TENANT.SUBSCRIPTION.SELECT_PLAN,
    payload,
    { tenantId }
  );
  return res?.data || res;
}

// 2. Tenant Subscription Lifecycle (Part 2 - Profile & Billing Management)
export async function changeTenantSubscriptionPlan(
  payload: ChangePlanPayload,
  tenantId?: string | number
): Promise<any> {
  const res = await apiClient.post<any>(
    API_ENDPOINTS.TENANT.SUBSCRIPTION.CHANGE_PLAN,
    payload,
    { tenantId }
  );
  return res?.data || res;
}

export async function fetchTenantSubscriptionUsage(
  tenantId?: string | number
): Promise<QuotaUsageSummary> {
  const res = await apiClient.get<any>(
    API_ENDPOINTS.TENANT.SUBSCRIPTION.USAGE,
    { tenantId }
  );
  return res?.data || res;
}

export async function fetchTenantSubscriptionLimits(
  tenantId?: string | number
): Promise<SubscriptionLimits> {
  const res = await apiClient.get<any>(
    API_ENDPOINTS.TENANT.SUBSCRIPTION.LIMITS,
    { tenantId }
  );
  return res?.data || res;
}

export async function fetchTenantSubscriptionHistory(
  params: { per_page?: number; page?: number } = { per_page: 15 },
  tenantId?: string | number
): Promise<{ data: SubscriptionHistoryItem[]; total?: number; [key: string]: any }> {
  const res = await apiClient.get<any>(
    API_ENDPOINTS.SUBSCRIPTION.PAYMENTS,
    {
      params: { per_page: params.per_page || 15, page: params.page || 1 },
      tenantId,
    }
  );
  const data = res?.data || res;
  if (Array.isArray(data)) {
    return { data };
  }
  return {
    data: data?.history || data?.payments || data?.data || [],
    total: data?.total,
    ...data,
  };
}

export const fetchSubscriptionPayments = fetchTenantSubscriptionHistory;

// 3. Backward-Compatible Billing Aliases
export async function fetchSubscriptionOverview(): Promise<SubscriptionOverview> {
  return fetchTenantSubscription();
}

export async function fetchQuotaUsage(): Promise<QuotaUsageSummary> {
  return fetchTenantSubscriptionUsage();
}

export async function changeSubscriptionPlan(
  payload: ChangePlanPayload
): Promise<SubscriptionOverview> {
  return changeTenantSubscriptionPlan(payload);
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const res = await apiClient.get<Invoice[]>(API_ENDPOINTS.BILLING.INVOICES);
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchInvoiceDetail(id: string | number): Promise<Invoice> {
  const res = await apiClient.get<Invoice>(API_ENDPOINTS.BILLING.INVOICE_DETAIL(id));
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

// 4. Razorpay Subscription Checkout & Payment Verification Workflow
// Step 3: Create checkout / Razorpay order (POST /api/subscription/checkout)
export async function createBillingCheckout(
  payload: CreateCheckoutPayload,
  tenantId?: string | number
): Promise<RazorpayCheckoutData> {
  const res = await apiClient.post<any>(
    API_ENDPOINTS.SUBSCRIPTION.CHECKOUT,
    payload,
    { tenantId }
  );
  return res?.data || res;
}

// Step 4: Verify payment signature and activate subscription (POST /api/subscription/verify-payment)
export async function verifyBillingPayment(
  payload: VerifyPaymentPayload,
  tenantId?: string | number
): Promise<VerifyPaymentResponse> {
  const res = await apiClient.post<any>(
    API_ENDPOINTS.SUBSCRIPTION.VERIFY_PAYMENT,
    payload,
    { tenantId }
  );
  return res?.data || res;
}

// Step 5: Load Razorpay Checkout SDK script safely
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.getElementById("razorpay-checkout-script") as HTMLScriptElement | null;
    if (existing) {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      existing.addEventListener("load", () => resolve(Boolean((window as any).Razorpay)));
      existing.addEventListener("error", () => resolve(false));
      setTimeout(() => {
        resolve(Boolean((window as any).Razorpay));
      }, 500);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean((window as any).Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
