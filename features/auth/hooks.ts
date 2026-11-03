import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  loginUser,
  fetchCurrentUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyMfa,
  switchWorkspace,
  fetchWorkspaces,
} from "./api";
import { useAuthStore } from "@/lib/auth/store";
import { useTenantStore } from "@/lib/tenant/store";
import type { LoginFormData, ResetPasswordFormData } from "./schemas";
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
    onSuccess: (data: LoginResponseData, variables) => {
      // Check if MFA is required
      if (data.mfa_required && data.challenge_token) {
        setMfaChallenge({
          challengeToken: data.challenge_token,
          email: variables.email,
        });
        return;
      }

      const token = data.token || data.access_token;
      if (token && data.user) {
        setCredentials(token, data.user);
      } else if (token) {
        const placeholderUser: User = {
          id: "me",
          name: "Workspace Member",
          email: variables.email,
          role: "admin",
        };
        setCredentials(token, placeholderUser);
      }

      // If workspaces are returned, update tenant store
      if (data.workspaces && data.workspaces.length > 0) {
        setAvailableTenants(data.workspaces);
        const active = data.workspaces.find(
          (w) => String(w.id) === String(variables.tenantId)
        ) || data.workspaces[0];
        setActiveTenant(active);
      }

      // Invalidate current user query to refresh profile immediately
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useMfaVerifyMutation() {
  const queryClient = useQueryClient();
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const email = useAuthStore((s) => s.mfaChallenge?.email) || "";

  return useMutation({
    mutationFn: (payload: { challenge_token: string; code: string }) => verifyMfa(payload),
    onSuccess: (data: LoginResponseData) => {
      const token = data.token || data.access_token;
      if (token && data.user) {
        setCredentials(token, data.user);
      } else if (token) {
        const placeholderUser: User = {
          id: "me",
          name: "Workspace Member",
          email,
          role: "admin",
        };
        setCredentials(token, placeholderUser);
      }
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      logout();
      // Clear entire query cache upon logout to prevent any residual tenant data leakage
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
    onSuccess: ({ targetTenantId, result }) => {
      // 1. Purge all prior tenant query caches immediately to prevent cross-tenant data leaks
      queryClient.clear();

      // 2. Derive active workspace from authorized server state
      let updatedTenant: Tenant | undefined = result.tenant;
      if (!updatedTenant) {
        updatedTenant = availableTenants.find(
          (t) => String(t.id) === String(targetTenantId)
        );
      }

      if (updatedTenant) {
        setActiveTenant(updatedTenant);
      }

      // 3. Refetch fresh current user and workspace context
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      queryClient.invalidateQueries({ queryKey: authKeys.workspaces() });
    },
  });
}
