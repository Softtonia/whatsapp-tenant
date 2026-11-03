import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchDashboardOverview,
  fetchConversationActivity,
  fetchRecentConversations,
  fetchRecentCampaigns,
  fetchWhatsAppHealth,
  fetchUsageSummary,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...dashboardKeys.all, String(tenantId ?? "default")] as const,
  overview: (tenantId: string | number | undefined) =>
    [...dashboardKeys.tenant(tenantId), "overview"] as const,
  activity: (tenantId: string | number | undefined) =>
    [...dashboardKeys.tenant(tenantId), "activity"] as const,
  recentConversations: (tenantId: string | number | undefined) =>
    [...dashboardKeys.tenant(tenantId), "recent-conversations"] as const,
  recentCampaigns: (tenantId: string | number | undefined) =>
    [...dashboardKeys.tenant(tenantId), "recent-campaigns"] as const,
  whatsappHealth: (tenantId: string | number | undefined) =>
    [...dashboardKeys.tenant(tenantId), "whatsapp-health"] as const,
  usage: (tenantId: string | number | undefined) =>
    [...dashboardKeys.tenant(tenantId), "usage"] as const,
};

export function useDashboardOverviewQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: dashboardKeys.overview(tenantId),
    queryFn: () => fetchDashboardOverview(tenantId),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useConversationActivityQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: dashboardKeys.activity(tenantId),
    queryFn: () => fetchConversationActivity(tenantId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useRecentConversationsQuery(limit = 5) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: [...dashboardKeys.recentConversations(tenantId), limit],
    queryFn: () => fetchRecentConversations(tenantId, limit),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useRecentCampaignsQuery(limit = 4) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: [...dashboardKeys.recentCampaigns(tenantId), limit],
    queryFn: () => fetchRecentCampaigns(tenantId, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useWhatsAppHealthQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: dashboardKeys.whatsappHealth(tenantId),
    queryFn: () => fetchWhatsAppHealth(tenantId),
    staleTime: 1000 * 45, // 45 seconds
  });
}

export function useUsageSummaryQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: dashboardKeys.usage(tenantId),
    queryFn: () => fetchUsageSummary(tenantId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRefreshDashboard() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return () => {
    queryClient.invalidateQueries({
      queryKey: dashboardKeys.tenant(tenantId),
    });
  };
}

