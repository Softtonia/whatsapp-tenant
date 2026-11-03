export type TemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";
export type TemplateStatus = "APPROVED" | "PENDING" | "REJECTED" | "PAUSED";

export interface TemplateButton {
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
  text: string;
  url?: string;
  phone_number?: string;
}

export interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "DOCUMENT" | "VIDEO";
  text?: string;
  buttons?: TemplateButton[];
}

export interface MetaTemplate {
  id: number | string;
  tenant_id?: number | string;
  name: string;
  category: TemplateCategory;
  language: string;
  status: TemplateStatus;
  components: TemplateComponent[];
  body_text?: string;
  example_variables?: string[];
  rejection_reason?: string | null;
  last_synced_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateQueryParams {
  search?: string;
  category?: string;
  status?: string;
  language?: string;
  page?: number;
  per_page?: number;
}

