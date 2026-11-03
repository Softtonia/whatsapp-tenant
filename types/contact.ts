export interface Contact {
  id: number | string;
  tenant_id?: number | string;
  name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  source?: string | null;
  status: "active" | "archived" | "unsubscribed";
  tags: string[];
  owner_id?: number | string | null;
  owner_name?: string | null;
  custom_attributes?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
  avatar_url?: string | null;
}

export interface ContactTag {
  id: number | string;
  name: string;
  color: string;
  contacts_count?: number;
}

export interface ContactActivity {
  id: number | string;
  contact_id: number | string;
  type:
    | "message_sent"
    | "message_received"
    | "status_change"
    | "tag_added"
    | "tag_removed"
    | "note_added"
    | "lead_created";
  description: string;
  actor_name: string;
  created_at: string;
}

export interface ContactNote {
  id: number | string;
  contact_id: number | string;
  author_name: string;
  note: string;
  created_at: string;
}

export interface ContactsQueryParams {
  search?: string;
  status?: string;
  tag?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

export interface BulkActionPayload {
  action: "assign_tags" | "assign_owner" | "archive";
  contact_ids: (number | string)[];
  tags?: string[];
  owner_id?: number | string;
}

