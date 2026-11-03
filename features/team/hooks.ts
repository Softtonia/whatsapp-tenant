import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTeamMembers,
  fetchTeamMember,
  updateMemberRole,
  deactivateMember,
  reactivateMember,
  updateAvailability,
  fetchTeamInvitations,
  createTeamInvitation,
  resendTeamInvitation,
  revokeTeamInvitation,
  deleteTeamInvitation,
  fetchTenantRoles,
  fetchTenantPermissions,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type { TeamQueryParams } from "@/types/team";
import type { InviteMemberFormData, UpdateMemberRoleData } from "./schemas";

export const teamKeys = {
  all: ["team"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...teamKeys.all, String(tenantId ?? "default")] as const,
  members: (tenantId: string | number | undefined) =>
    [...teamKeys.tenant(tenantId), "members"] as const,
  memberList: (tenantId: string | number | undefined, params?: TeamQueryParams) =>
    [...teamKeys.members(tenantId), params] as const,
  memberDetail: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...teamKeys.members(tenantId), String(id)] as const,
  invitations: (tenantId: string | number | undefined) =>
    [...teamKeys.tenant(tenantId), "invitations"] as const,
  roles: (tenantId: string | number | undefined) =>
    [...teamKeys.tenant(tenantId), "roles"] as const,
  permissions: (tenantId: string | number | undefined) =>
    [...teamKeys.tenant(tenantId), "permissions"] as const,
};

export function useTeamMembersQuery(params?: TeamQueryParams) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: teamKeys.memberList(tenantId, params),
    queryFn: () => fetchTeamMembers(params),
    staleTime: 1000 * 30,
  });
}

export function useTeamMemberDetailQuery(id: string | number | undefined | null) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: teamKeys.memberDetail(tenantId, id ?? undefined),
    queryFn: () => fetchTeamMember(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });
}

export function useTeamInvitationsQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: teamKeys.invitations(tenantId),
    queryFn: () => fetchTeamInvitations(),
    staleTime: 1000 * 20,
  });
}

export function useTenantRolesQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: teamKeys.roles(tenantId),
    queryFn: () => fetchTenantRoles(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTenantPermissionsQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: teamKeys.permissions(tenantId),
    queryFn: () => fetchTenantPermissions(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useInviteMemberMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: InviteMemberFormData) => createTeamInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invitations(tenantId) });
    },
  });
}

export function useUpdateMemberRoleMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateMemberRoleData }) =>
      updateMemberRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(tenantId) });
    },
  });
}

export function useDeactivateMemberMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => deactivateMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(tenantId) });
    },
  });
}

export function useReactivateMemberMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => reactivateMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(tenantId) });
    },
  });
}

export function useUpdateAvailabilityMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({
      id,
      availability,
    }: {
      id: string | number;
      availability: "online" | "busy" | "offline";
    }) => updateAvailability(id, availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(tenantId) });
    },
  });
}

export function useResendInvitationMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => resendTeamInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invitations(tenantId) });
    },
  });
}

export function useRevokeInvitationMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => revokeTeamInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invitations(tenantId) });
    },
  });
}

export function useDeleteInvitationMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => deleteTeamInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invitations(tenantId) });
    },
  });
}

