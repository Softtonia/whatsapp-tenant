import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWhatsAppAccounts,
  fetchWhatsAppAccount,
  syncWhatsAppAccount,
  fetchWhatsAppPhoneNumbers,
  setDefaultPhoneNumber,
  fetchWhatsAppHealth,
  connectWhatsAppAccount,
  fetchEmbeddedSignupConfig,
  initiateEmbeddedSignup,
  callbackEmbeddedSignup,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type { DirectConnectFormData, EmbeddedSignupCallbackData } from "./schemas";

export const whatsappConnectionKeys = {
  all: ["whatsapp-connections"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...whatsappConnectionKeys.all, String(tenantId ?? "default")] as const,
  accounts: (tenantId: string | number | undefined) =>
    [...whatsappConnectionKeys.tenant(tenantId), "accounts"] as const,
  accountDetail: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...whatsappConnectionKeys.accounts(tenantId), String(id)] as const,
  numbers: (tenantId: string | number | undefined) =>
    [...whatsappConnectionKeys.tenant(tenantId), "numbers"] as const,
  health: (tenantId: string | number | undefined) =>
    [...whatsappConnectionKeys.tenant(tenantId), "health"] as const,
  embeddedConfig: (tenantId: string | number | undefined) =>
    [...whatsappConnectionKeys.tenant(tenantId), "embedded-config"] as const,
};

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
