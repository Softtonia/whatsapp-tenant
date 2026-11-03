export type LeadPriority = "low" | "medium" | "high" | "urgent";

export interface PipelineStage {
  id: number | string;
  name: string;
  order: number;
  color?: string;
  stage_key: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
}

export interface Lead {
  id: number | string;
  tenant_id?: number | string;
  contact_id: number | string;
  contact_name: string;
  contact_phone: string;
  pipeline_stage_id: number | string;
  stage_name?: string;
  title: string;
  status: "open" | "won" | "lost";
  priority: LeadPriority;
  value: number;
  currency: string;
  follow_up_at?: string | null;
  assigned_to?: number | string | null;
  owner_name?: string | null;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface LeadsQueryParams {
  search?: string;
  pipeline_stage_id?: number | string;
  priority?: string;
  assigned_to?: number | string;
  status?: string;
}

