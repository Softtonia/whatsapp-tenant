import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type {
  WhatsAppAccount,
  WhatsAppPhoneNumber,
  EmbeddedSignupConfig,
} from "@/types/whatsapp";
import type { WhatsAppHealthData } from "@/types/tenant";
import type { DirectConnectFormData, EmbeddedSignupCallbackData } from "./schemas";

export async function fetchWhatsAppAccounts(): Promise<WhatsAppAccount[]> {
  const res = await apiClient.get<WhatsAppAccount[]>(API_ENDPOINTS.WHATSAPP.ACCOUNTS);
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchWhatsAppAccount(id: string | number): Promise<WhatsAppAccount> {
  const res = await apiClient.get<WhatsAppAccount>(API_ENDPOINTS.WHATSAPP.ACCOUNT_DETAIL(id));
  return res.data;
}

export async function syncWhatsAppAccount(id: string | number): Promise<{ synced_at: string }> {
  const res = await apiClient.post<{ synced_at: string }>(
    API_ENDPOINTS.WHATSAPP.ACCOUNT_SYNC(id)
  );
  return res.data;
}

export async function fetchWhatsAppPhoneNumbers(): Promise<WhatsAppPhoneNumber[]> {
  const res = await apiClient.get<WhatsAppPhoneNumber[]>(API_ENDPOINTS.WHATSAPP.NUMBERS);
  return Array.isArray(res.data) ? res.data : [];
}

export async function setDefaultPhoneNumber(id: string | number): Promise<void> {
  await apiClient.patch(API_ENDPOINTS.WHATSAPP.NUMBER_DEFAULT(id));
}

export async function fetchWhatsAppHealth(): Promise<WhatsAppHealthData> {
  const res = await apiClient.get<WhatsAppHealthData>(API_ENDPOINTS.WHATSAPP.HEALTH);
  return res.data;
}

export async function connectWhatsAppAccount(
  payload: DirectConnectFormData
): Promise<WhatsAppAccount> {
  const res = await apiClient.post<WhatsAppAccount>(
    API_ENDPOINTS.WHATSAPP.CONNECT,
    payload
  );
  return res.data;
}

export async function fetchEmbeddedSignupConfig(): Promise<EmbeddedSignupConfig> {
  const res = await apiClient.get<EmbeddedSignupConfig>(
    API_ENDPOINTS.WHATSAPP.EMBEDDED_CONFIG
  );
  return res.data;
}

export async function initiateEmbeddedSignup(): Promise<{
  session_id: string;
  state: string;
}> {
  const res = await apiClient.post<{ session_id: string; state: string }>(
    API_ENDPOINTS.WHATSAPP.EMBEDDED_INITIATE
  );
  return res.data;
}

export async function callbackEmbeddedSignup(
  payload: EmbeddedSignupCallbackData
): Promise<WhatsAppAccount> {
  const res = await apiClient.post<WhatsAppAccount>(
    API_ENDPOINTS.WHATSAPP.EMBEDDED_CALLBACK,
    payload
  );
  return res.data;
}

