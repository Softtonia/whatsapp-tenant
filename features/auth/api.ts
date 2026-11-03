import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type { User, LoginResponseData } from "@/types/user";
import type { Tenant } from "@/types/tenant";
import type {
  LoginFormData,
  ResetPasswordFormData,
  AcceptInvitationFormData,
} from "./schemas";

export async function loginUser(credentials: LoginFormData): Promise<any> {
  const response: any = await apiClient.post<any>(
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

  const data = response?.data || {};
  return {
    success: response?.success ?? data?.success ?? true,
    message: response?.message ?? data?.message,
    token: response?.token || response?.access_token || data?.token || data?.access_token,
    token_type: response?.token_type || data?.token_type || "Bearer",
    user: response?.user || data?.user,
    workspaces: response?.workspaces || data?.workspaces || [],
    workspace_required: response?.workspace_required ?? data?.workspace_required,
    current_workspace: response?.current_workspace ?? data?.current_workspace,
    mfa_required: response?.mfa_required ?? data?.mfa_required,
    challenge_token: response?.challenge_token || data?.challenge_token,
  };
}

export async function fetchCurrentUser(): Promise<User> {
  const response: any = await apiClient.get<any>(API_ENDPOINTS.AUTH.ME);
  const data = response?.data || response;
  return data?.user || data;
}

export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch {
    // Gracefully handle logout failure (e.g. already invalidated on server)
  }
}

export async function forgotPassword(email: string): Promise<{ status: string }> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    { email },
    { skipAuth: true }
  );
  return response?.data || response;
}

export async function resetPassword(payload: ResetPasswordFormData): Promise<{ status: string }> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.AUTH.RESET_PASSWORD,
    payload,
    { skipAuth: true }
  );
  return response?.data || response;
}

export async function acceptInvitation(
  payload: AcceptInvitationFormData
): Promise<LoginResponseData & { message?: string; status?: string }> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.INVITATIONS.ACCEPT,
    payload,
    { skipAuth: true }
  );
  const data = response?.data || {};
  return {
    success: response?.success ?? data?.success ?? true,
    message: response?.message ?? data?.message,
    token: response?.token || response?.access_token || data?.token || data?.access_token,
    token_type: response?.token_type || data?.token_type || "Bearer",
    user: response?.user || data?.user,
    workspaces: response?.workspaces || data?.workspaces || [],
    status: response?.status ?? data?.status,
  };
}

export async function verifyMfa(payload: { challenge_token: string; code: string }): Promise<LoginResponseData> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.AUTH.MFA_VERIFY,
    payload,
    { skipAuth: true }
  );
  const data = response?.data || {};
  return {
    ...response,
    ...data,
    token: response?.token || data?.token,
    user: response?.user || data?.user,
  };
}

export async function enrollMfa(password: string): Promise<{
  success: boolean;
  message?: string;
  secret: string;
  provisioning_uri: string;
  qr_code_svg: string;
}> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.AUTH.MFA_ENROLL,
    { password }
  );
  const data = response?.data || response;
  return {
    success: response?.success ?? data?.success ?? true,
    message: response?.message ?? data?.message,
    secret: data?.secret || response?.secret || "",
    provisioning_uri: data?.provisioning_uri || response?.provisioning_uri || "",
    qr_code_svg: data?.qr_code_svg || response?.qr_code_svg || "",
  };
}

export async function confirmMfa(code: string): Promise<{ success: boolean; message?: string }> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.AUTH.MFA_CONFIRM,
    { code }
  );
  const data = response?.data || response;
  return {
    success: response?.success ?? data?.success ?? true,
    message: response?.message ?? data?.message,
  };
}

export async function disableMfa(password: string, code: string): Promise<{ success: boolean; message?: string }> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.AUTH.MFA_DISABLE,
    { password, code }
  );
  const data = response?.data || response;
  return {
    success: response?.success ?? data?.success ?? true,
    message: response?.message ?? data?.message,
  };
}

export async function sendChangePasswordOtp(): Promise<{
  success: boolean;
  message?: string;
  data?: { expires_in: number };
}> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.AUTH.CHANGE_PASSWORD_SEND_OTP,
    {}
  );
  const data = response?.data || response;
  return {
    success: response?.success ?? data?.success ?? true,
    message: response?.message ?? data?.message,
    data: data?.data || data,
  };
}

export async function verifyChangePasswordOtp(otp: string): Promise<{
  success: boolean;
  message?: string;
  auth_token?: string;
  data?: { auth_token?: string };
}> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.AUTH.CHANGE_PASSWORD_VERIFY_OTP,
    { otp }
  );
  const data = response?.data || response;
  const authToken =
    data?.auth_token ||
    data?.data?.auth_token ||
    response?.auth_token ||
    response?.data?.auth_token;
  return {
    success: response?.success ?? data?.success ?? true,
    message: response?.message ?? data?.message,
    auth_token: authToken,
    data: data,
  };
}

export async function changePasswordWithOtp(payload: {
  auth_token: string;
  new_password: string;
  new_password_confirmation: string;
}): Promise<{ success: boolean; message?: string }> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
    payload
  );
  const data = response?.data || response;
  return {
    success: response?.success ?? data?.success ?? true,
    message: response?.message ?? data?.message,
  };
}

export async function switchWorkspace(
  tenant_id: number | string
): Promise<{ active_tenant_id: number | string; tenant?: Tenant }> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.AUTH.SWITCH_WORKSPACE,
    { tenant_id }
  );
  const data = response?.data || response;
  return {
    active_tenant_id: tenant_id,
    tenant: data?.tenant || data?.current_workspace || data,
  };
}

export async function fetchWorkspaces(): Promise<Tenant[]> {
  const response: any = await apiClient.get<any>(API_ENDPOINTS.WORKSPACES.LIST);
  const data = response?.data || response;
  return Array.isArray(data) ? data : data?.workspaces || [];
}
