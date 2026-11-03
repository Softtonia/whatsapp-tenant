import type { Tenant } from "./tenant";

export type UserRole = "super_admin" | "owner" | "admin" | "agent" | "viewer";

export interface User {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole | string;
  avatar_url?: string | null;
  is_active?: boolean;
  tenant_id?: number | string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  token: string;
  token_type?: string;
  expires_at?: string | null;
}

export interface LoginResponseData {
  token?: string;
  access_token?: string;
  user?: User;
  token_type?: string;
  mfa_required?: boolean;
  challenge_token?: string;
  workspaces?: Tenant[]; success?: boolean; message?: string; status?: string; workspace_required?: boolean; current_workspace?: any;
}

