import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type { User, LoginResponseData } from "@/types/user";
import type { Tenant } from "@/types/tenant";
import type { LoginFormData, ResetPasswordFormData } from "./schemas";

export async function loginUser(credentials: LoginFormData): Promise<LoginResponseData> {
  const response = await apiClient.post<LoginResponseData>(
    API_ENDPOINTS.AUTH.LOGIN,
    {
      email: credentials.email,
      password: credentials.password,
    },
    {
      skipAuth: true,
      tenantId: credentials.tenantId,
    }
  );
  return response.data;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
  return response.data;
}

export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch {
    // Gracefully handle logout failure (e.g. already invalidated on server)
  }
}

export async function forgotPassword(email: string): Promise<{ status: string }> {
  const response = await apiClient.post<{ status: string }>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    { email },
    { skipAuth: true }
  );
  return response.data;
}

export async function resetPassword(payload: ResetPasswordFormData): Promise<{ status: string }> {
  const response = await apiClient.post<{ status: string }>(
    API_ENDPOINTS.AUTH.RESET_PASSWORD,
    payload,
    { skipAuth: true }
  );
  return response.data;
}

export async function verifyMfa(payload: { challenge_token: string; code: string }): Promise<LoginResponseData> {
  const response = await apiClient.post<LoginResponseData>(
    API_ENDPOINTS.AUTH.MFA_VERIFY,
    payload,
    { skipAuth: true }
  );
  return response.data;
}

export async function switchWorkspace(
  tenant_id: number | string
): Promise<{ active_tenant_id: number | string; tenant?: Tenant }> {
  const response = await apiClient.post<{ active_tenant_id: number | string; tenant?: Tenant }>(
    API_ENDPOINTS.AUTH.SWITCH_WORKSPACE,
    { tenant_id }
  );
  return response.data;
}

export async function fetchWorkspaces(): Promise<Tenant[]> {
  const response = await apiClient.get<Tenant[]>(API_ENDPOINTS.WORKSPACES.LIST);
  return response.data;
}
