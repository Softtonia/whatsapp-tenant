import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type {
  TeamMember,
  TeamInvitation,
  TenantRole,
  TenantPermission,
  TeamQueryParams,
} from "@/types/team";
import type { InviteMemberFormData, UpdateMemberRoleData } from "./schemas";

export async function fetchTeamMembers(params?: TeamQueryParams): Promise<{
  data: TeamMember[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.role && params.role !== "all") queryParams.role = params.role;
  if (params?.status && params.status !== "all") queryParams.status = params.status;
  if (params?.availability && params.availability !== "all") queryParams.availability = params.availability;
  if (params?.page) queryParams.page = params.page;
  if (params?.per_page) queryParams.per_page = params.per_page;

  const res = await apiClient.get<TeamMember[]>(API_ENDPOINTS.TEAM.MEMBERS, {
    params: queryParams,
  });

  return {
    data: Array.isArray(res.data) ? res.data : [],
    meta: res.meta as {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    } | undefined,
  };
}

export async function fetchTeamMember(id: string | number): Promise<TeamMember> {
  const res = await apiClient.get<TeamMember>(API_ENDPOINTS.TEAM.DETAIL(id));
  return res.data;
}

export async function updateMemberRole(
  id: string | number,
  payload: UpdateMemberRoleData
): Promise<TeamMember> {
  const res = await apiClient.patch<TeamMember>(API_ENDPOINTS.TEAM.DETAIL(id), payload);
  return res.data;
}

export async function deactivateMember(id: string | number): Promise<void> {
  await apiClient.post(API_ENDPOINTS.TEAM.DEACTIVATE(id));
}

export async function reactivateMember(id: string | number): Promise<void> {
  await apiClient.post(API_ENDPOINTS.TEAM.REACTIVATE(id));
}

export async function updateAvailability(
  id: string | number,
  availability: "online" | "busy" | "offline"
): Promise<void> {
  await apiClient.post(API_ENDPOINTS.TEAM.AVAILABILITY(id), { availability });
}

export async function fetchTeamInvitations(): Promise<TeamInvitation[]> {
  const res = await apiClient.get<TeamInvitation[]>(API_ENDPOINTS.TEAM.INVITATIONS, {
    params: { status: "pending" },
  });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createTeamInvitation(
  payload: InviteMemberFormData
): Promise<TeamInvitation> {
  const res = await apiClient.post<TeamInvitation>(
    API_ENDPOINTS.TEAM.INVITATIONS,
    payload
  );
  return res.data;
}

export async function resendTeamInvitation(id: string | number): Promise<void> {
  await apiClient.post(API_ENDPOINTS.TEAM.INVITATION_RESEND(id));
}

export async function revokeTeamInvitation(id: string | number): Promise<void> {
  await apiClient.post(API_ENDPOINTS.TEAM.INVITATION_REVOKE(id));
}

export async function deleteTeamInvitation(id: string | number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.TEAM.INVITATION_DELETE(id));
}

export async function fetchTenantRoles(): Promise<TenantRole[]> {
  const res = await apiClient.get<TenantRole[]>(API_ENDPOINTS.TEAM.ROLES);
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchTenantPermissions(): Promise<TenantPermission[]> {
  const res = await apiClient.get<TenantPermission[]>(API_ENDPOINTS.TEAM.PERMISSIONS);
  return Array.isArray(res.data) ? res.data : [];
}

