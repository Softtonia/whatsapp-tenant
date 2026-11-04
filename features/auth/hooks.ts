import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  loginUser,
  fetchCurrentUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  acceptInvitation,
  verifyMfa,
  verifyAdminMfa,
  enrollMfa,
  confirmMfa,
  disableMfa,
  sendChangePasswordOtp,
  verifyChangePasswordOtp,
  changePasswordWithOtp,
  switchWorkspace,
  fetchWorkspaces,
} from "./api";
import { useAuthStore } from "@/lib/auth/store";
import { useTenantStore } from "@/lib/tenant/store";
import type {
  LoginFormData,
  ResetPasswordFormData,
  AcceptInvitationFormData,
} from "./schemas";
import type { User, LoginResponseData } from "@/types/user";
import type { Tenant } from "@/types/tenant";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
  workspaces: () => [...authKeys.all, "workspaces"] as const,
};

export function useCurrentUserQuery() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useWorkspacesQuery() {
  const token = useAuthStore((s) => s.token);
  const setAvailableTenants = useTenantStore((s) => s.setAvailableTenants);

  return useQuery({
    queryKey: authKeys.workspaces(),
    queryFn: async () => {
      const workspaces = await fetchWorkspaces();
      if (Array.isArray(workspaces) && workspaces.length > 0) {
        setAvailableTenants(workspaces);
      }
      return workspaces;
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const setMfaChallenge = useAuthStore((s) => s.setMfaChallenge);
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const setAvailableTenants = useTenantStore((s) => s.setAvailableTenants);

  return useMutation({
    mutationFn: (credentials: LoginFormData) => loginUser(credentials),
    onSuccess: (data: any) => {
      if (data?.mfa_required && (data.challenge_token || data.challengeToken)) {
        setMfaChallenge({
          challengeToken: data.challenge_token || data.challengeToken,
          challenge_token: data.challenge_token || data.challengeToken,
          email: "",
        });
        return;
      }

      const authToken = data?.token || data?.access_token;
      const user = data?.user;

      if (authToken && user) {
        setCredentials(authToken, user);

        const workspaces = data.workspaces || [];
        setAvailableTenants(workspaces);

        const activeWp =
          data.current_workspace ||
          (workspaces.length > 0
            ? workspaces.find((w: any) => String(w.id) === String(user.tenant_id)) || workspaces[0]
            : {
                id: user.tenant_id || 1,
                name: user.name ? `${user.name}'s Workspace` : "My Workspace",
                status: "active",
              });

        setActiveTenant(activeWp);

        queryClient.invalidateQueries({ queryKey: authKeys.me() });
        queryClient.invalidateQueries({ queryKey: authKeys.workspaces() });
      }
    },
  });
}

export function useMfaVerifyMutation() {
  const queryClient = useQueryClient();
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const setAvailableTenants = useTenantStore((s) => s.setAvailableTenants);

  return useMutation({
    mutationFn: (payload: {
      challenge_token: string;
      code: string;
      recovery_code?: string;
      is_recovery?: boolean;
    }) => verifyMfa(payload),
    onSuccess: (data: any) => {
      const authToken = data?.token || data?.access_token;
      const user = data?.user;

      if (authToken && user) {
        setCredentials(authToken, user);

        const workspaces = data.workspaces || [];
        setAvailableTenants(workspaces);

        const activeWp =
          data.current_workspace ||
          (workspaces.length > 0
            ? workspaces.find((w: any) => String(w.id) === String(user.tenant_id)) || workspaces[0]
            : {
                id: user.tenant_id || 1,
                name: user.name ? `${user.name}'s Workspace` : "My Workspace",
                status: "active",
              });

        setActiveTenant(activeWp);

        queryClient.invalidateQueries({ queryKey: authKeys.me() });
        queryClient.invalidateQueries({ queryKey: authKeys.workspaces() });
      }
    },
  });
}

export function useAdminMfaVerifyMutation() {
  const queryClient = useQueryClient();
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const setAvailableTenants = useTenantStore((s) => s.setAvailableTenants);

  return useMutation({
    mutationFn: (payload: {
      challenge_token: string;
      code?: string;
      recovery_code?: string;
    }) => verifyAdminMfa(payload),
    onSuccess: (data: any) => {
      const authToken = data?.token || data?.access_token;
      const user = data?.user;

      if (authToken && user) {
        setCredentials(authToken, user);

        const workspaces = data.workspaces || [];
        setAvailableTenants(workspaces);

        const activeWp =
          data.current_workspace ||
          (workspaces.length > 0
            ? workspaces.find((w: any) => String(w.id) === String(user.tenant_id)) || workspaces[0]
            : {
                id: user.tenant_id || 1,
                name: user.name ? `${user.name}'s Workspace` : "My Workspace",
                status: "active",
              });

        setActiveTenant(activeWp);

        queryClient.invalidateQueries({ queryKey: authKeys.me() });
        queryClient.invalidateQueries({ queryKey: authKeys.workspaces() });
      }
    },
  });
}

export function useEnrollMfaMutation() {
  return useMutation({
    mutationFn: (password: string) => enrollMfa(password),
  });
}

export function useConfirmMfaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => confirmMfa(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useDisableMfaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { password: string; code: string }) => disableMfa(payload.password, payload.code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useSendChangePasswordOtpMutation() {
  return useMutation({
    mutationFn: sendChangePasswordOtp,
  });
}

export function useVerifyChangePasswordOtpMutation() {
  return useMutation({
    mutationFn: (otp: string) => verifyChangePasswordOtp(otp),
  });
}

export function useChangePasswordWithOtpMutation() {
  return useMutation({
    mutationFn: changePasswordWithOtp,
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const clearTenant = useTenantStore((s) => s.clearTenant);

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      logout();
      clearTenant();
      queryClient.clear();
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordFormData) => resetPassword(payload),
  });
}

export function useAcceptInvitationMutation() {
  const queryClient = useQueryClient();
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);

  return useMutation({
    mutationFn: (payload: AcceptInvitationFormData) => acceptInvitation(payload),
    onSuccess: (data: any) => {
      const authToken = data?.token || data?.access_token;
      const user = data?.user;

      if (authToken && user) {
        setCredentials(authToken, user);
        if (data.workspaces && data.workspaces.length > 0) {
          setActiveTenant(data.workspaces[0]);
        }
        queryClient.invalidateQueries({ queryKey: authKeys.me() });
      }
    },
  });
}

export function useSwitchWorkspaceMutation() {
  const queryClient = useQueryClient();
  const setTenantLoading = useTenantStore((s) => s.setLoading);
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const availableTenants = useTenantStore((s) => s.availableTenants);

  return useMutation({
    mutationFn: async (targetTenantId: number | string) => {
      setTenantLoading(true);
      try {
        const result = await switchWorkspace(targetTenantId);
        return { targetTenantId, result };
      } finally {
        setTenantLoading(false);
      }
    },
    onSuccess: ({ targetTenantId, result }: any) => {
      queryClient.clear();

      let updatedTenant: Tenant | undefined = result?.tenant;
      if (!updatedTenant) {
        updatedTenant = availableTenants.find(
          (t) => String(t.id) === String(targetTenantId)
        );
      }

      if (updatedTenant) {
        setActiveTenant(updatedTenant);
      }

      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      queryClient.invalidateQueries({ queryKey: authKeys.workspaces() });
    },
  });
}
