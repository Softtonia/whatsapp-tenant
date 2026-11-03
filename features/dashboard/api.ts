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
  const response = await apiClient.get<DashboardOverviewData>(
    API_ENDPOINTS.REPORTS.OVERVIEW,
    {
      tenantId: tenantId ? String(tenantId) : undefined,
    }
  );
  return response.data;
}

export async function fetchConversationActivity(
  tenantId?: string | number
): Promise<ConversationActivityPoint[]> {
  const response = await apiClient.get<ConversationActivityPoint[]>(
    API_ENDPOINTS.REPORTS.CONVERSATIONS,
    {
      tenantId: tenantId ? String(tenantId) : undefined,
    }
  );
  return response.data;
}

export async function fetchRecentConversations(
  tenantId?: string | number,
  limit = 5
): Promise<Conversation[]> {
  const response = await apiClient.get<Conversation[]>(
    `${API_ENDPOINTS.CONVERSATIONS.LIST}?per_page=${limit}&sort_by=updated_at&sort_dir=desc`,
    {
      tenantId: tenantId ? String(tenantId) : undefined,
    }
  );
  return response.data;
}

export async function fetchRecentCampaigns(
  tenantId?: string | number,
  limit = 5
): Promise<CampaignSummaryItem[]> {
  const response = await apiClient.get<CampaignSummaryItem[]>(
    `${API_ENDPOINTS.CAMPAIGNS.LIST}?per_page=${limit}&sort_by=created_at&sort_dir=desc`,
    {
      tenantId: tenantId ? String(tenantId) : undefined,
    }
  );
  return response.data;
}

export async function fetchWhatsAppHealth(
  tenantId?: string | number
): Promise<WhatsAppHealthData> {
  const response = await apiClient.get<WhatsAppHealthData>(
    API_ENDPOINTS.WHATSAPP.HEALTH,
    {
      tenantId: tenantId ? String(tenantId) : undefined,
    }
  );
  return response.data;
}

export async function fetchUsageSummary(
  tenantId?: string | number
): Promise<UsageSummaryData> {
  const response = await apiClient.get<UsageSummaryData>(
    API_ENDPOINTS.BILLING.USAGE,
    {
      tenantId: tenantId ? String(tenantId) : undefined,
    }
  );
  return response.data;
}

