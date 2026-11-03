import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type { AiBotConfig, AiKnowledgeItem, AiTestChatMessage } from "@/types/chatbot";
import type { BotConfigFormData, KnowledgeItemFormData } from "./schemas";

export async function fetchAiConfig(): Promise<AiBotConfig> {
  const res = await apiClient.get<AiBotConfig>(API_ENDPOINTS.AI.CONFIG);
  return res.data;
}

export async function updateAiConfig(payload: Partial<BotConfigFormData>): Promise<AiBotConfig> {
  const res = await apiClient.put<AiBotConfig>(API_ENDPOINTS.AI.CONFIG, payload);
  return res.data;
}

export async function fetchAiKnowledge(): Promise<AiKnowledgeItem[]> {
  const res = await apiClient.get<AiKnowledgeItem[]>(API_ENDPOINTS.AI.KNOWLEDGE);
  return Array.isArray(res.data) ? res.data : [];
}

export async function createAiKnowledge(
  payload: KnowledgeItemFormData
): Promise<AiKnowledgeItem> {
  const res = await apiClient.post<AiKnowledgeItem>(API_ENDPOINTS.AI.KNOWLEDGE, payload);
  return res.data;
}

export async function updateAiKnowledge(
  id: string | number,
  payload: Partial<KnowledgeItemFormData>
): Promise<AiKnowledgeItem> {
  const res = await apiClient.put<AiKnowledgeItem>(
    API_ENDPOINTS.AI.KNOWLEDGE_DETAIL(id),
    payload
  );
  return res.data;
}

export async function deleteAiKnowledge(id: string | number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.AI.KNOWLEDGE_DETAIL(id));
}

export async function sendTestChatMessage(
  message: string
): Promise<AiTestChatMessage> {
  const res = await apiClient.post<AiTestChatMessage>(API_ENDPOINTS.AI.TEST_CHAT, {
    message,
  });
  return res.data;
}

