import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type {
  WorkspaceSettingsOverview,
  BusinessProfile,
  WorkspacePreferences,
  WorkspaceBranding,
  NotificationPreferences,
  UserSession,
} from "@/types/settings";
import type { User } from "@/types/user";
import type {
  BusinessProfileFormData,
  WorkspacePreferencesFormData,
  WorkspaceBrandingFormData,
  NotificationPreferencesFormData,
  UserProfileFormData,
  ChangePasswordFormData,
} from "./schemas";

export async function fetchWorkspaceSettings(): Promise<WorkspaceSettingsOverview> {
  const res = await apiClient.get<WorkspaceSettingsOverview>(API_ENDPOINTS.SETTINGS.BASE);
  return res.data;
}

export async function updateBusinessProfile(
  payload: BusinessProfileFormData
): Promise<BusinessProfile> {
  const res = await apiClient.patch<BusinessProfile>(
    API_ENDPOINTS.SETTINGS.PROFILE,
    payload
  );
  return res.data;
}

export async function updateWorkspacePreferences(
  payload: WorkspacePreferencesFormData
): Promise<WorkspacePreferences> {
  const res = await apiClient.patch<WorkspacePreferences>(
    API_ENDPOINTS.SETTINGS.PREFERENCES,
    payload
  );
  return res.data;
}

export async function fetchWorkspaceBranding(): Promise<WorkspaceBranding> {
  const res = await apiClient.get<WorkspaceBranding>(API_ENDPOINTS.SETTINGS.BRANDING);
  return res.data;
}

export async function updateWorkspaceBranding(
  payload: WorkspaceBrandingFormData
): Promise<WorkspaceBranding> {
  const res = await apiClient.patch<WorkspaceBranding>(
    API_ENDPOINTS.SETTINGS.BRANDING,
    payload
  );
  return res.data;
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const res = await apiClient.get<NotificationPreferences>(
    API_ENDPOINTS.SETTINGS.NOTIFICATIONS
  );
  return res.data;
}

export async function updateNotificationPreferences(
  payload: NotificationPreferencesFormData
): Promise<NotificationPreferences> {
  const res = await apiClient.patch<NotificationPreferences>(
    API_ENDPOINTS.SETTINGS.NOTIFICATIONS,
    payload
  );
  return res.data;
}

export async function updateUserProfile(payload: UserProfileFormData): Promise<User> {
  const res = await apiClient.patch<User>(API_ENDPOINTS.USERS.PROFILE, payload);
  return res.data;
}

export async function changePassword(
  payload: Omit<ChangePasswordFormData, "confirm_password">
): Promise<void> {
  await apiClient.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD, payload);
}

export async function fetchUserSessions(): Promise<UserSession[]> {
  const res = await apiClient.get<UserSession[]>(API_ENDPOINTS.USERS.SESSIONS);
  return Array.isArray(res.data) ? res.data : [];
}

export async function revokeUserSession(id: string | number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.USERS.REVOKE_SESSION(id));
}

export async function enrollMfa(password?: string): Promise<{
  secret: string;
  qr_code_svg?: string;
  qr_code_url?: string;
  provisioning_uri?: string;
  recovery_codes?: string[];
}> {
  const res: any = await apiClient.post<any>(API_ENDPOINTS.AUTH.MFA_ENROLL, {
    password: password || "",
  });
  return res?.data || res;
}

export async function confirmMfa(code: string): Promise<{
  success?: boolean;
  mfa_enabled?: boolean;
  recovery_codes?: string[];
  codes?: string[];
  data?: any;
}> {
  const res: any = await apiClient.post<any>(
    API_ENDPOINTS.AUTH.MFA_CONFIRM,
    { code }
  );
  const data = res?.data || res;
  const rawCodes =
    res?.recovery_codes ||
    data?.recovery_codes ||
    res?.codes ||
    data?.codes ||
    [];

  return {
    ...(typeof res === "object" ? res : {}),
    ...(typeof data === "object" ? data : {}),
    recovery_codes: Array.isArray(rawCodes) ? rawCodes : [],
    codes: Array.isArray(rawCodes) ? rawCodes : [],
  };
}

export async function disableMfa(password: string, code?: string): Promise<{ success?: boolean; mfa_enabled?: boolean }> {
  const res: any = await apiClient.post<any>(
    API_ENDPOINTS.AUTH.MFA_DISABLE,
    { password, code: code || "" }
  );
  return res?.data || res;
}
