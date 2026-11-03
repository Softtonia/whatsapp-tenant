import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type { MetaTemplate, TemplateQueryParams, TemplateComponent } from "@/types/template";
import type { TemplateCreateData } from "./schemas";

export async function fetchTemplates(params?: TemplateQueryParams): Promise<{
  data: MetaTemplate[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.category && params.category !== "all") queryParams.category = params.category;
  if (params?.status && params.status !== "all") queryParams.status = params.status;
  if (params?.language && params.language !== "all") queryParams.language = params.language;
  if (params?.page) queryParams.page = params.page;
  if (params?.per_page) queryParams.per_page = params.per_page;

  const res = await apiClient.get<MetaTemplate[]>(API_ENDPOINTS.TEMPLATES.LIST, {
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

export async function fetchTemplate(id: string | number): Promise<MetaTemplate> {
  const res = await apiClient.get<MetaTemplate>(API_ENDPOINTS.TEMPLATES.DETAIL(id));
  return res.data;
}

export async function createTemplate(payload: TemplateCreateData): Promise<MetaTemplate> {
  const components: TemplateComponent[] = [];

  if (payload.header_text?.trim()) {
    components.push({
      type: "HEADER",
      format: "TEXT",
      text: payload.header_text.trim(),
    });
  }

  components.push({
    type: "BODY",
    text: payload.body_text.trim(),
  });

  if (payload.footer_text?.trim()) {
    components.push({
      type: "FOOTER",
      text: payload.footer_text.trim(),
    });
  }

  if (payload.buttons && payload.buttons.length > 0) {
    components.push({
      type: "BUTTONS",
      buttons: payload.buttons,
    });
  }

  const res = await apiClient.post<MetaTemplate>(API_ENDPOINTS.TEMPLATES.LIST, {
    name: payload.name,
    category: payload.category,
    language: payload.language,
    components,
  });

  return res.data;
}

export async function syncTemplatesFromMeta(): Promise<{
  synced_count: number;
  last_synced_at: string;
}> {
  const res = await apiClient.post<{
    synced_count: number;
    last_synced_at: string;
  }>(API_ENDPOINTS.TEMPLATES.SYNC);
  return res.data;
}

