export type TeamMemberRole = "owner" | "admin" | "agent" | "viewer";
export type TeamMemberStatus = "active" | "inactive" | "suspended";
export type TeamMemberAvailability = "online" | "busy" | "offline";

export interface TeamMember {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  availability: TeamMemberAvailability;
  is_active: boolean;
  avatar_url?: string | null;
  last_active_at?: string | null;
  created_at: string;
  assigned_conversations_count?: number;
}

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export interface TeamInvitation {
  id: number | string;
  workspace_id?: number | string;
  email: string;
  role: TeamMemberRole;
  status: InvitationStatus;
  invited_by?: string;
  invited_by_name?: string;
  expires_at?: string;
  created_at: string;
}

export interface TenantRole {
  key: TeamMemberRole;
  name: string;
  description: string;
  permissions_count: number;
}

export interface TenantPermission {
  id: string;
  name: string;
  category: "conversations" | "campaigns" | "templates" | "contacts" | "settings" | "billing" | "team";
  description: string;
}

export interface TeamQueryParams {
  search?: string;
  role?: string;
  status?: string;
  availability?: string;
  page?: number;
  per_page?: number;
}

