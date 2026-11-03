import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAiConfig,
  updateAiConfig,
  fetchAiKnowledge,
  createAiKnowledge,
  updateAiKnowledge,
  deleteAiKnowledge,
  sendTestChatMessage,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type { BotConfigFormData, KnowledgeItemFormData } from "./schemas";

export const chatbotKeys = {
  all: ["ai-chatbot"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...chatbotKeys.all, String(tenantId ?? "default")] as const,
  config: (tenantId: string | number | undefined) =>
    [...chatbotKeys.tenant(tenantId), "config"] as const,
  knowledge: (tenantId: string | number | undefined) =>
    [...chatbotKeys.tenant(tenantId), "knowledge"] as const,
};

export function useAiConfigQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: chatbotKeys.config(tenantId),
    queryFn: () => fetchAiConfig(),
    staleTime: 1000 * 60,
  });
}

export function useUpdateAiConfigMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: Partial<BotConfigFormData>) => updateAiConfig(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(chatbotKeys.config(tenantId), updated);
      queryClient.invalidateQueries({ queryKey: chatbotKeys.config(tenantId) });
    },
  });
}

export function useAiKnowledgeQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: chatbotKeys.knowledge(tenantId),
    queryFn: () => fetchAiKnowledge(),
    staleTime: 1000 * 30,
  });
}

export function useCreateAiKnowledgeMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: KnowledgeItemFormData) => createAiKnowledge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatbotKeys.knowledge(tenantId) });
    },
  });
}

export function useUpdateAiKnowledgeMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<KnowledgeItemFormData>;
    }) => updateAiKnowledge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatbotKeys.knowledge(tenantId) });
    },
  });
}

export function useDeleteAiKnowledgeMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => deleteAiKnowledge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatbotKeys.knowledge(tenantId) });
    },
  });
}

export function useTestChatMutation() {
  return useMutation({
    mutationFn: (message: string) => sendTestChatMessage(message),
  });
}

