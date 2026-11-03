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

export async function enrollMfa(): Promise<{
  secret: string;
  qr_code_url: string;
  recovery_codes: string[];
}> {
  const res = await apiClient.post<{
    secret: string;
    qr_code_url: string;
    recovery_codes: string[];
  }>(API_ENDPOINTS.AUTH.MFA_ENROLL);
  return res.data;
}

export async function confirmMfa(code: string): Promise<{ mfa_enabled: boolean }> {
  const res = await apiClient.post<{ mfa_enabled: boolean }>(
    API_ENDPOINTS.AUTH.MFA_CONFIRM,
    { code }
  );
  return res.data;
}

export async function disableMfa(password: string): Promise<{ mfa_enabled: boolean }> {
  const res = await apiClient.post<{ mfa_enabled: boolean }>(
    API_ENDPOINTS.AUTH.MFA_DISABLE,
    { password }
  );
  return res.data;
}

