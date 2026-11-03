import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkspaceSettings,
  updateBusinessProfile,
  updateWorkspacePreferences,
  fetchWorkspaceBranding,
  updateWorkspaceBranding,
  fetchNotificationPreferences,
  updateNotificationPreferences,
  updateUserProfile,
  changePassword,
  fetchUserSessions,
  revokeUserSession,
  enrollMfa,
  confirmMfa,
  disableMfa,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type {
  BusinessProfileFormData,
  WorkspacePreferencesFormData,
  WorkspaceBrandingFormData,
  NotificationPreferencesFormData,
  UserProfileFormData,
  ChangePasswordFormData,
} from "./schemas";

export const settingsKeys = {
  all: ["settings"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...settingsKeys.all, String(tenantId ?? "default")] as const,
  overview: (tenantId: string | number | undefined) =>
    [...settingsKeys.tenant(tenantId), "overview"] as const,
  branding: (tenantId: string | number | undefined) =>
    [...settingsKeys.tenant(tenantId), "branding"] as const,
  notifications: (tenantId: string | number | undefined) =>
    [...settingsKeys.tenant(tenantId), "notifications"] as const,
  sessions: ["user-sessions"] as const,
};

export function useWorkspaceSettingsQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: settingsKeys.overview(tenantId),
    queryFn: () => fetchWorkspaceSettings(),
    staleTime: 1000 * 60,
  });
}

export function useWorkspaceBrandingQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: settingsKeys.branding(tenantId),
    queryFn: () => fetchWorkspaceBranding(),
    staleTime: 1000 * 60,
  });
}

export function useNotificationPreferencesQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: settingsKeys.notifications(tenantId),
    queryFn: () => fetchNotificationPreferences(),
    staleTime: 1000 * 60,
  });
}

export function useUserSessionsQuery() {
  return useQuery({
    queryKey: settingsKeys.sessions,
    queryFn: () => fetchUserSessions(),
    staleTime: 1000 * 30,
  });
}

export function useUpdateBusinessProfileMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: BusinessProfileFormData) => updateBusinessProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.overview(tenantId) });
    },
  });
}

export function useUpdateWorkspacePreferencesMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: WorkspacePreferencesFormData) => updateWorkspacePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.overview(tenantId) });
    },
  });
}

export function useUpdateWorkspaceBrandingMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: WorkspaceBrandingFormData) => updateWorkspaceBranding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.branding(tenantId) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.overview(tenantId) });
    },
  });
}

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: NotificationPreferencesFormData) => updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications(tenantId) });
    },
  });
}

export function useUpdateUserProfileMutation() {
  return useMutation({
    mutationFn: (data: UserProfileFormData) => updateUserProfile(data),
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: Omit<ChangePasswordFormData, "confirm_password">) => changePassword(data),
  });
}

export function useRevokeUserSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => revokeUserSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.sessions });
    },
  });
}

export function useEnrollMfaMutation() {
  return useMutation({
    mutationFn: () => enrollMfa(),
  });
}

export function useConfirmMfaMutation() {
  return useMutation({
    mutationFn: (code: string) => confirmMfa(code),
  });
}

export function useDisableMfaMutation() {
  return useMutation({
    mutationFn: (password: string) => disableMfa(password),
  });
}

