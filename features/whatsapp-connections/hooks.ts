import * as React from "react";
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
import { launchMetaEmbeddedSignup } from "@/src/lib/meta-sdk";
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
  });
}

/**
 * Universal hook for Meta WhatsApp Embedded Signup.
 * Dynamically hits the backend APIs to retrieve configuration and state (zero hardcoding),
 * launches the Meta JavaScript SDK (FB.login) to automatically open the Facebook dialog,
 * and exchanges the code with the Laravel callback endpoint.
 */
export function useMetaEmbeddedSignupFlow({
  onSuccess,
}: {
  onSuccess?: (account?: WhatsAppAccount) => void;
} = {}) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const startSignup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch dynamic config and initiate sessions from backend APIs (zero hardcoding)
      const [configRes, initRes, metaRes] = await Promise.allSettled([
        fetchEmbeddedSignupConfig(),
        initiateEmbeddedSignup(),
        initiateMetaConnect(),
      ]);

      const config = configRes.status === "fulfilled" ? configRes.value : null;
      const initData = initRes.status === "fulfilled" ? initRes.value : null;
      const metaData = metaRes.status === "fulfilled" ? metaRes.value : null;

      const appId = config?.app_id || metaData?.app_id || (metaData as any)?.client_id;
      const configId = config?.config_id || metaData?.config_id;
      const graphVersion = config?.graph_version || metaData?.graph_version || "v23.0";
      const sessionInfoVersion = config?.session_info_version || "2";
      const stateToken = initData?.state || metaData?.state;
      const authUrl = metaData?.auth_url || (metaData as any)?.data?.auth_url;

      if (!appId || !configId || !stateToken) {
        if (authUrl && typeof window !== "undefined") {
          setIsLoading(false);
          window.open(authUrl, "_blank", "noopener,noreferrer");
          return;
        }
        throw new Error("Meta Embedded Signup configuration was not returned by server.");
      }

      // 2. Launch Meta Embedded Signup automatically via Meta JS SDK
      try {
        const result = await launchMetaEmbeddedSignup({
          appId,
          configId,
          graphVersion,
          sessionInfoVersion,
          state: stateToken,
        });

        // 3. Complete callback via API 3
        const savedAccount = await callbackEmbeddedSignup({
          code: result.code,
          state: result.state,
          waba_id: result.waba_id,
          phone_number_id: result.phone_number_id,
          set_as_default: true,
        });

        queryClient.invalidateQueries({
          queryKey: whatsappConnectionKeys.accounts(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: whatsappConnectionKeys.metaStatus(tenantId),
        });

        setIsLoading(false);
        onSuccess?.(savedAccount);
        return savedAccount;
      } catch (sdkErr: any) {
        if (sdkErr?.isCancelled) {
          setIsLoading(false);
          return;
        }
        // If Meta SDK encounters an ad-blocker or script block, fallback to auth_url
        if (authUrl && typeof window !== "undefined") {
          setIsLoading(false);
          window.open(authUrl, "_blank", "noopener,noreferrer");
          return;
        }
        throw sdkErr;
      }
    } catch (err: any) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "Meta signup failed";
      setError(msg);
      throw err;
    }
  };

  return {
    startSignup,
    isLoading,
    error,
  };
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
