import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type {
  WhatsAppAccount,
  WhatsAppPhoneNumber,
  EmbeddedSignupConfig,
} from "@/types/whatsapp";
import type { WhatsAppHealthData } from "@/types/tenant";
import type { DirectConnectFormData, EmbeddedSignupCallbackData } from "./schemas";

// ==========================================
// WhatsApp & WABA Account APIs
// ==========================================

/**
 * 1. Fetch list of tenant WhatsApp / WABA accounts
 * GET /api/tenant/whatsapp/accounts
 */
export async function fetchWhatsAppAccounts(): Promise<WhatsAppAccount[]> {
  const res = await apiClient.get<WhatsAppAccount[]>(API_ENDPOINTS.WHATSAPP.ACCOUNTS);
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * 2. Create / Link a WhatsApp / WABA account
 * POST /api/tenant/whatsapp/accounts
 */
export async function createWhatsAppAccount(
  payload: DirectConnectFormData | Record<string, any>
): Promise<WhatsAppAccount> {
  const res = await apiClient.post<WhatsAppAccount>(
    API_ENDPOINTS.WHATSAPP.ACCOUNTS,
    payload
  );
  return res.data;
}

/**
 * 3. Fetch single WhatsApp / WABA account detail
 * GET /api/tenant/whatsapp/accounts/{{account_id}}
 */
export async function fetchWhatsAppAccount(id: string | number): Promise<WhatsAppAccount> {
  const res = await apiClient.get<WhatsAppAccount>(API_ENDPOINTS.WHATSAPP.ACCOUNT_DETAIL(id));
  return res.data;
}

/**
 * 4. Update WhatsApp / WABA account
 * PATCH /api/tenant/whatsapp/accounts/{{account_id}}
 */
export async function updateWhatsAppAccount(
  id: string | number,
  payload: Partial<WhatsAppAccount> | Record<string, any>
): Promise<WhatsAppAccount> {
  const res = await apiClient.patch<WhatsAppAccount>(
    API_ENDPOINTS.WHATSAPP.ACCOUNT_UPDATE(id),
    payload
  );
  return res.data;
}

/**
 * 5. Delete / Unlink WhatsApp / WABA account
 * DELETE /api/tenant/whatsapp/accounts/{{account_id}}
 */
export async function deleteWhatsAppAccount(
  id: string | number
): Promise<{ success: boolean; message?: string }> {
  const res = await apiClient.delete<{ success: boolean; message?: string }>(
    API_ENDPOINTS.WHATSAPP.ACCOUNT_DELETE(id)
  );
  return res.data;
}

/**
 * 6. Sync WhatsApp / WABA account metadata & templates
 * POST /api/tenant/whatsapp/accounts/{{account_id}}/sync
 */
export async function syncWhatsAppAccount(id: string | number): Promise<{ synced_at: string }> {
  const res = await apiClient.post<{ synced_at: string }>(
    API_ENDPOINTS.WHATSAPP.ACCOUNT_SYNC(id)
  );
  return res.data;
}

/**
 * 7. Fetch WhatsApp / WABA account status
 * GET /api/tenant/whatsapp/accounts/{{account_id}}/status
 */
export async function fetchWhatsAppAccountStatus(
  id: string | number
): Promise<{ status: string; messaging_limit?: string; quality_rating?: string; [key: string]: any }> {
  const res = await apiClient.get<any>(API_ENDPOINTS.WHATSAPP.ACCOUNT_STATUS(id));
  return res.data;
}

/**
 * 8. Fetch WhatsApp / WABA account health diagnostics
 * GET /api/tenant/whatsapp/accounts/{{account_id}}/health
 */
export async function fetchWhatsAppAccountHealth(
  id: string | number
): Promise<WhatsAppHealthData> {
  const res = await apiClient.get<WhatsAppHealthData>(API_ENDPOINTS.WHATSAPP.ACCOUNT_HEALTH(id));
  return res.data;
}

/**
 * 9. Verify WhatsApp / WABA account credentials
 * POST /api/tenant/whatsapp/accounts/{{account_id}}/verify
 */
export async function verifyWhatsAppAccount(
  id: string | number,
  payload?: Record<string, any>
): Promise<{ verified: boolean; message?: string; [key: string]: any }> {
  const res = await apiClient.post<any>(
    API_ENDPOINTS.WHATSAPP.ACCOUNT_VERIFY(id),
    payload || {}
  );
  return res.data;
}

/**
 * 10. Reconnect WhatsApp / WABA account
 * POST /api/tenant/whatsapp/accounts/{{account_id}}/reconnect
 */
export async function reconnectWhatsAppAccount(
  id: string | number,
  payload?: Record<string, any>
): Promise<WhatsAppAccount> {
  const res = await apiClient.post<WhatsAppAccount>(
    API_ENDPOINTS.WHATSAPP.ACCOUNT_RECONNECT(id),
    payload || {}
  );
  return res.data;
}

// ==========================================
// Phone Numbers & Health
// ==========================================

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
  return createWhatsAppAccount(payload);
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

// ==========================================
// Meta Business Account & Connection APIs
// ==========================================

export interface MetaConnectResponse {
  auth_url: string;
  state: string;
  expires_in?: number;
  app_id?: string;
  config_id?: string;
  graph_version?: string;
  redirect_uri?: string;
  [key: string]: any;
}

/**
 * 0. Initiate Meta Connect flow
 * GET /api/tenant/meta/connect
 * Returns auth_url to open in next tab
 */
export async function initiateMetaConnect(params?: Record<string, any>): Promise<MetaConnectResponse> {
  const res = await apiClient.get<any>(
    API_ENDPOINTS.TENANT.META.CONNECT,
    { params }
  );
  const data = res?.data || res;
  return (data?.data || data) as MetaConnectResponse;
}

export interface MetaConnectionStatus {
  is_connected: boolean;
  status: "connected" | "disconnected" | "expired" | "not_connected" | string;
  waba_id?: string;
  business_account_id?: string;
  business_name?: string;
  phone_number_id?: string;
  display_phone_number?: string;
  permissions?: string[];
  expires_at?: string;
  last_synced_at?: string;
  [key: string]: any;
}

export interface MetaAccountItem {
  id: string | number;
  waba_id?: string;
  name?: string;
  business_name?: string;
  currency?: string;
  timezone_id?: string;
  message_template_namespace?: string;
  account_id?: string;
  status?: string;
  phone_numbers?: any[];
  [key: string]: any;
}

export interface MetaPermissionsResponse {
  permissions: string[];
  status?: string;
  last_refreshed_at?: string;
  [key: string]: any;
}

/**
 * 1. Fetch current Meta Business connection status
 * GET /api/tenant/meta/connection-status
 */
export async function fetchMetaConnectionStatus(): Promise<MetaConnectionStatus> {
  const res = await apiClient.get<MetaConnectionStatus>(
    API_ENDPOINTS.TENANT.META.CONNECTION_STATUS
  );
  return res.data;
}

/**
 * 2. Handle Meta OAuth Callback
 * GET /api/tenant/meta/callback?code={{meta_auth_code}}&state={{meta_state}}
 */
export async function handleMetaOAuthCallback(params: {
  code: string;
  state?: string;
}): Promise<any> {
  const query = new URLSearchParams({
    code: params.code,
    ...(params.state ? { state: params.state } : {}),
  }).toString();
  const res = await apiClient.get<any>(`${API_ENDPOINTS.TENANT.META.CALLBACK}?${query}`);
  return res.data;
}

/**
 * 3. Exchange temporary Meta OAuth token
 * POST /api/tenant/meta/exchange-token
 */
export async function exchangeMetaToken(payload: {
  code: string;
  state?: string;
  redirect_uri?: string;
}): Promise<any> {
  const res = await apiClient.post<any>(
    API_ENDPOINTS.TENANT.META.EXCHANGE_TOKEN,
    payload
  );
  return res.data;
}

/**
 * 4. Fetch list of Meta Business accounts
 * GET /api/tenant/meta/accounts
 */
export async function fetchMetaAccounts(): Promise<MetaAccountItem[]> {
  const res = await apiClient.get<MetaAccountItem[]>(
    API_ENDPOINTS.TENANT.META.ACCOUNTS
  );
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * 5. Fetch single Meta Business account detail
 * GET /api/tenant/meta/accounts/{{account_id}}
 */
export async function fetchMetaAccountDetail(
  accountId: string | number
): Promise<MetaAccountItem> {
  const res = await apiClient.get<MetaAccountItem>(
    API_ENDPOINTS.TENANT.META.ACCOUNT_DETAIL(accountId)
  );
  return res.data;
}

/**
 * 6. Sync Meta Business accounts and phone numbers
 * POST /api/tenant/meta/accounts/sync
 */
export async function syncMetaAccounts(): Promise<{ synced_at: string; count?: number }> {
  const res = await apiClient.post<{ synced_at: string; count?: number }>(
    API_ENDPOINTS.TENANT.META.ACCOUNTS_SYNC
  );
  return res.data;
}

/**
 * 7. Fetch active Meta API permissions and scopes
 * GET /api/tenant/meta/permissions
 */
export async function fetchMetaPermissions(): Promise<MetaPermissionsResponse> {
  const res = await apiClient.get<MetaPermissionsResponse>(
    API_ENDPOINTS.TENANT.META.PERMISSIONS
  );
  return res.data;
}

/**
 * 8. Refresh and re-verify Meta permissions
 * POST /api/tenant/meta/permissions/refresh
 */
export async function refreshMetaPermissions(): Promise<MetaPermissionsResponse> {
  const res = await apiClient.post<MetaPermissionsResponse>(
    API_ENDPOINTS.TENANT.META.PERMISSIONS_REFRESH
  );
  return res.data;
}

/**
 * 9. Reconnect Meta Business Account
 * POST /api/tenant/meta/reconnect
 */
export async function reconnectMetaAccount(payload?: Record<string, any>): Promise<any> {
  const res = await apiClient.post<any>(
    API_ENDPOINTS.TENANT.META.RECONNECT,
    payload || {}
  );
  return res.data;
}

/**
 * 10. Disconnect Meta Business Account
 * POST /api/tenant/meta/disconnect
 */
export async function disconnectMetaAccount(): Promise<{ success: boolean; message?: string }> {
  const res = await apiClient.post<{ success: boolean; message?: string }>(
    API_ENDPOINTS.TENANT.META.DISCONNECT
  );
  return res.data;
}
