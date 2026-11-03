import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type {
  Campaign,
  CampaignAnalytics,
  CampaignRecipient,
  CampaignQueryParams,
} from "@/types/campaign";
import type { CampaignCreateData } from "./schemas";

export async function fetchCampaigns(params?: CampaignQueryParams): Promise<{
  data: Campaign[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.status && params.status !== "all") queryParams.status = params.status;
  if (params?.page) queryParams.page = params.page;
  if (params?.per_page) queryParams.per_page = params.per_page;

  const res = await apiClient.get<Campaign[]>(API_ENDPOINTS.CAMPAIGNS.LIST, {
    params: queryParams,
  });

  return {
    data: Array.isArray(res.data) ? res.data : [],
    meta: res.meta as {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    } | undefined,
  };
}

export async function fetchCampaign(id: string | number): Promise<Campaign> {
  const res = await apiClient.get<Campaign>(API_ENDPOINTS.CAMPAIGNS.DETAIL(id));
  return res.data;
}

export async function createCampaign(payload: CampaignCreateData): Promise<Campaign> {
  const body = {
    name: payload.name,
    template_id: payload.template_id,
    phone_number_id: payload.phone_number_id,
    audience_config: {
      tags: payload.audience_tags,
      variable_mapping: payload.variable_mapping,
    },
    scheduled_at: payload.send_type === "schedule" ? payload.scheduled_at : null,
  };

  const res = await apiClient.post<Campaign>(API_ENDPOINTS.CAMPAIGNS.LIST, body);
  return res.data;
}

export async function validateCampaign(id: string | number): Promise<{
  valid: boolean;
  eligible_recipients: number;
  unsubscribed_count?: number;
  estimated_cost_inr?: number;
}> {
  const res = await apiClient.post<{
    valid: boolean;
    eligible_recipients: number;
    unsubscribed_count?: number;
    estimated_cost_inr?: number;
  }>(API_ENDPOINTS.CAMPAIGNS.VALIDATE(id));
  return res.data;
}

export async function testCampaign(id: string | number, phone: string): Promise<void> {
  await apiClient.post(API_ENDPOINTS.CAMPAIGNS.TEST(id), { phone });
}

export async function dispatchCampaign(id: string | number): Promise<void> {
  await apiClient.post(API_ENDPOINTS.CAMPAIGNS.SEND(id));
}

export async function pauseCampaign(id: string | number): Promise<void> {
  await apiClient.post(API_ENDPOINTS.CAMPAIGNS.PAUSE(id));
}

export async function resumeCampaign(id: string | number): Promise<void> {
  await apiClient.post(API_ENDPOINTS.CAMPAIGNS.RESUME(id));
}

export async function cancelCampaign(id: string | number): Promise<void> {
  await apiClient.post(API_ENDPOINTS.CAMPAIGNS.CANCEL(id));
}

export async function fetchCampaignAnalytics(id: string | number): Promise<CampaignAnalytics> {
  const res = await apiClient.get<CampaignAnalytics>(API_ENDPOINTS.CAMPAIGNS.ANALYTICS(id));
  return res.data;
}

export async function fetchCampaignRecipients(
  id: string | number,
  params?: { status?: string; search?: string; page?: number }
): Promise<{
  data: CampaignRecipient[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}> {
  const res = await apiClient.get<CampaignRecipient[]>(API_ENDPOINTS.CAMPAIGNS.RECIPIENTS(id), {
    params,
  });

  return {
    data: Array.isArray(res.data) ? res.data : [],
    meta: res.meta as {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    } | undefined,
  };
}

export async function exportCampaignReport(
  id: string | number
): Promise<{ download_url: string; expires_in_seconds?: number }> {
  const res = await apiClient.get<{ download_url: string; expires_in_seconds?: number }>(
    API_ENDPOINTS.CAMPAIGNS.EXPORT(id)
  );
  return res.data;
}

