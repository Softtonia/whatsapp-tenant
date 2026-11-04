import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type {
  DashboardOverviewData,
  ConversationActivityPoint,
  CampaignSummaryItem,
  UsageSummaryData,
} from "@/types/dashboard";
import type { Conversation } from "@/types/whatsapp";
import type { WhatsAppHealthData } from "@/types/tenant";

export async function fetchDashboardOverview(
  tenantId?: string | number
): Promise<DashboardOverviewData> {
  const response: any = await apiClient.get<DashboardOverviewData>(
    API_ENDPOINTS.REPORTS.OVERVIEW,
    {
      tenantId: tenantId ? String(tenantId) : undefined,
    }
  );
  return response?.data || response;
}

export async function fetchConversationActivity(
  tenantId?: string | number
): Promise<ConversationActivityPoint[]> {
  try {
    const response: any = await apiClient.get<any>(
      API_ENDPOINTS.REPORTS.CONVERSATIONS,
      {
        tenantId: tenantId ? String(tenantId) : undefined,
      }
    );
    const data = response?.data !== undefined ? response.data : response;
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      const candidates = [
        data.data,
        data.activity,
        data.points,
        data.conversations,
        data.chart,
        data.history,
        data.items,
      ];
      for (const c of candidates) {
        if (Array.isArray(c)) return c;
      }
    }
    return [];
  } catch (err) {
    console.warn("fetchConversationActivity error:", err);
    return [];
  }
}

export async function fetchRecentConversations(
  tenantId?: string | number,
  limit = 5
): Promise<Conversation[]> {
  try {
    const response: any = await apiClient.get<any>(
      `${API_ENDPOINTS.CONVERSATIONS.LIST}?per_page=${limit}&sort_by=updated_at&sort_dir=desc`,
      {
        tenantId: tenantId ? String(tenantId) : undefined,
      }
    );
    const data = response?.data !== undefined ? response.data : response;
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      const candidates = [data.data, data.conversations, data.items, data.results];
      for (const c of candidates) {
        if (Array.isArray(c)) return c;
      }
    }
    return [];
  } catch (err) {
    console.warn("fetchRecentConversations error:", err);
    return [];
  }
}

export async function fetchRecentCampaigns(
  tenantId?: string | number,
  limit = 5
): Promise<CampaignSummaryItem[]> {
  try {
    const response: any = await apiClient.get<any>(
      `${API_ENDPOINTS.CAMPAIGNS.LIST}?per_page=${limit}&sort_by=created_at&sort_dir=desc`,
      {
        tenantId: tenantId ? String(tenantId) : undefined,
      }
    );
    const data = response?.data !== undefined ? response.data : response;
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      const candidates = [data.data, data.campaigns, data.items, data.results];
      for (const c of candidates) {
        if (Array.isArray(c)) return c;
      }
    }
    return [];
  } catch (err) {
    console.warn("fetchRecentCampaigns error:", err);
    return [];
  }
}

export async function fetchWhatsAppHealth(
  tenantId?: string | number
): Promise<WhatsAppHealthData> {
  const response: any = await apiClient.get<WhatsAppHealthData>(
    API_ENDPOINTS.WHATSAPP.HEALTH,
    {
      tenantId: tenantId ? String(tenantId) : undefined,
    }
  );
  return response?.data || response;
}

export async function fetchUsageSummary(
  tenantId?: string | number
): Promise<UsageSummaryData> {
  const response: any = await apiClient.get<UsageSummaryData>(
    API_ENDPOINTS.BILLING.USAGE,
    {
      tenantId: tenantId ? String(tenantId) : undefined,
    }
  );
  return response?.data || response;
}
