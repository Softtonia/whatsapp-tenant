import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWhatsAppAccounts,
  createWhatsAppAccount,
  fetchWhatsAppAccount,
  updateWhatsAppAccount,
  deleteWhatsAppAccount,
  syncWhatsAppAccount,
  fetchWhatsAppAccountStatus,
  fetchWhatsAppAccountHealth,
  verifyWhatsAppAccount,
  reconnectWhatsAppAccount,
  fetchWhatsAppPhoneNumbers,
  setDefaultPhoneNumber,
  fetchWhatsAppHealth,
  connectWhatsAppAccount,
  fetchEmbeddedSignupConfig,
  initiateEmbeddedSignup,
  callbackEmbeddedSignup,
  initiateMetaConnect,
  fetchMetaConnectionStatus,
  handleMetaOAuthCallback,
  exchangeMetaToken,
  fetchMetaAccounts,
  fetchMetaAccountDetail,
  syncMetaAccounts,
  fetchMetaPermissions,
  refreshMetaPermissions,
  reconnectMetaAccount,
  disconnectMetaAccount,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type { DirectConnectFormData, EmbeddedSignupCallbackData } from "./schemas";
import type { WhatsAppAccount } from "@/types/whatsapp";

export const whatsappConnectionKeys = {
  all: ["whatsapp-connections"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...whatsappConnectionKeys.all, String(tenantId ?? "default")] as const,
  accounts: (tenantId: string | number | undefined) =>
    [...whatsappConnectionKeys.tenant(tenantId), "accounts"] as const,
  accountDetail: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...whatsappConnectionKeys.accounts(tenantId), String(id)] as const,
  accountStatus: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...whatsappConnectionKeys.accountDetail(tenantId, id), "status"] as const,
  accountHealth: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...whatsappConnectionKeys.accountDetail(tenantId, id), "health"] as const,
  numbers: (tenantId: string | number | undefined) =>
    [...whatsappConnectionKeys.tenant(tenantId), "numbers"] as const,
  health: (tenantId: string | number | undefined) =>
    [...whatsappConnectionKeys.tenant(tenantId), "health"] as const,
  embeddedConfig: (tenantId: string | number | undefined) =>
    [...whatsappConnectionKeys.tenant(tenantId), "embedded-config"] as const,
  metaStatus: (tenantId: string | number | undefined) =>
    [...whatsappConnectionKeys.tenant(tenantId), "meta-status"] as const,
  metaAccounts: (tenantId: string | number | undefined) =>
    [...whatsappConnectionKeys.tenant(tenantId), "meta-accounts"] as const,
  metaAccountDetail: (tenantId: string | number | undefined, accountId: string | number | undefined) =>
    [...whatsappConnectionKeys.metaAccounts(tenantId), String(accountId)] as const,
  metaPermissions: (tenantId: string | number | undefined) =>
    [...whatsappConnectionKeys.tenant(tenantId), "meta-permissions"] as const,
};

// ==========================================
// WhatsApp / WABA Accounts Queries & Mutations
// ==========================================

export function useWhatsAppAccountsQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: whatsappConnectionKeys.accounts(tenantId),
    queryFn: () => fetchWhatsAppAccounts(),
    staleTime: 1000 * 30,
  });
}

export function useWhatsAppAccountDetailQuery(id: string | number | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: whatsappConnectionKeys.accountDetail(tenantId, id),
    queryFn: () => fetchWhatsAppAccount(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}

export function useWhatsAppAccountStatusQuery(id: string | number | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: whatsappConnectionKeys.accountStatus(tenantId, id),
    queryFn: () => fetchWhatsAppAccountStatus(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 20,
  });
}

export function useWhatsAppAccountHealthQuery(id: string | number | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: whatsappConnectionKeys.accountHealth(tenantId, id),
    queryFn: () => fetchWhatsAppAccountHealth(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 20,
  });
}

export function useCreateWhatsAppAccountMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: DirectConnectFormData | Record<string, any>) =>
      createWhatsAppAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.accounts(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.health(tenantId),
      });
    },
  });
}

export function useUpdateWhatsAppAccountMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<WhatsAppAccount> | Record<string, any> }) =>
      updateWhatsAppAccount(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.accountDetail(tenantId, vars.id),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.accounts(tenantId),
      });
    },
  });
}

export function useDeleteWhatsAppAccountMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => deleteWhatsAppAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.accounts(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.health(tenantId),
      });
    },
  });
}

export function useSyncWhatsAppAccountMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => syncWhatsAppAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.accounts(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.health(tenantId),
      });
    },
  });
}

export function useVerifyWhatsAppAccountMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload?: Record<string, any> }) =>
      verifyWhatsAppAccount(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.accountDetail(tenantId, vars.id),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.accounts(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.health(tenantId),
      });
    },
  });
}

export function useReconnectWhatsAppAccountMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload?: Record<string, any> }) =>
      reconnectWhatsAppAccount(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.accountDetail(tenantId, vars.id),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.accounts(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.health(tenantId),
      });
    },
  });
}

// ==========================================
// Phone Numbers & Health
// ==========================================

export function useWhatsAppNumbersQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: whatsappConnectionKeys.numbers(tenantId),
    queryFn: () => fetchWhatsAppPhoneNumbers(),
    staleTime: 1000 * 30,
  });
}

export function useWhatsAppHealthQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: whatsappConnectionKeys.health(tenantId),
    queryFn: () => fetchWhatsAppHealth(),
    staleTime: 1000 * 20,
    refetchInterval: 30000,
  });
}

export function useEmbeddedSignupConfigQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: whatsappConnectionKeys.embeddedConfig(tenantId),
    queryFn: () => fetchEmbeddedSignupConfig(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useSetDefaultNumberMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => setDefaultPhoneNumber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.numbers(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.accounts(tenantId),
      });
    },
  });
}

export function useConnectWhatsAppMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: DirectConnectFormData) => connectWhatsAppAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.accounts(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.health(tenantId),
      });
    },
  });
}

export function useInitiateEmbeddedSignupMutation() {
  return useMutation({
    mutationFn: () => initiateEmbeddedSignup(),
  });
}

export function useEmbeddedCallbackMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: EmbeddedSignupCallbackData) => callbackEmbeddedSignup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.accounts(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappConnectionKeys.health(tenantId),
      });
    },
  });
}

// ==========================================
// Meta Hooks (Tenant Connection)
// ==========================================

export function useInitiateMetaConnectMutation() {
  return useMutation({
    mutationFn: (payload?: Record<string, any> | void) => initiateMetaConnect(payload || {}),
    onSuccess: (data) => {
      const authUrl = data?.auth_url;
      if (authUrl && typeof window !== "undefined") {
        window.open(authUrl, "_blank", "noopener,noreferrer");
      }
    },
  });
}

export function useMetaConnectionStatusQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: whatsappConnectionKeys.metaStatus(tenantId),
    queryFn: () => fetchMetaConnectionStatus(),
    staleTime: 1000 * 30,
    retry: 1,
  });
}

export function useMetaAccountsQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: whatsappConnectionKeys.metaAccounts(tenantId),
    queryFn: () => fetchMetaAccounts(),
    staleTime: 1000 * 30,
    retry: 1,
  });
}

export function useMetaAccountDetailQuery(accountId: string | number | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: whatsappConnectionKeys.metaAccountDetail(tenantId, accountId),
    queryFn: () => fetchMetaAccountDetail(accountId!),
    enabled: Boolean(accountId),
    staleTime: 1000 * 30,
  });
}

export function useMetaPermissionsQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: whatsappConnectionKeys.metaPermissions(tenantId),
    queryFn: () => fetchMetaPermissions(),
    staleTime: 1000 * 60,
    retry: 1,
  });
}

export function useExchangeMetaTokenMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (payload: { code: string; state?: string; redirect_uri?: string }) =>
      exchangeMetaToken(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.metaStatus(tenantId) });
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.metaAccounts(tenantId) });
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.accounts(tenantId) });
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.health(tenantId) });
    },
  });
}

export function useSyncMetaAccountsMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: () => syncMetaAccounts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.metaStatus(tenantId) });
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.metaAccounts(tenantId) });
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.accounts(tenantId) });
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.health(tenantId) });
    },
  });
}

export function useRefreshMetaPermissionsMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: () => refreshMetaPermissions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.metaPermissions(tenantId) });
    },
  });
}

export function useReconnectMetaMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (payload?: Record<string, any>) => reconnectMetaAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.metaStatus(tenantId) });
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.metaAccounts(tenantId) });
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.accounts(tenantId) });
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.health(tenantId) });
    },
  });
}

export function useDisconnectMetaMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: () => disconnectMetaAccount(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.metaStatus(tenantId) });
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.metaAccounts(tenantId) });
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.accounts(tenantId) });
      queryClient.invalidateQueries({ queryKey: whatsappConnectionKeys.health(tenantId) });
    },
  });
}
