import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type { Lead, PipelineStage, LeadsQueryParams } from "@/types/lead";
import type { LeadFormData } from "./schemas";

export async function fetchPipelineStages(): Promise<PipelineStage[]> {
  const res = await apiClient.get<PipelineStage[]>(API_ENDPOINTS.LEADS.STAGES);
  return res.data;
}

export async function fetchLeads(params?: LeadsQueryParams): Promise<Lead[]> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.pipeline_stage_id) queryParams.pipeline_stage_id = params.pipeline_stage_id;
  if (params?.priority && params.priority !== "all") queryParams.priority = params.priority;
  if (params?.assigned_to) queryParams.assigned_to = params.assigned_to;
  if (params?.status && params.status !== "all") queryParams.status = params.status;

  const res = await apiClient.get<Lead[]>(API_ENDPOINTS.LEADS.LIST, {
    params: queryParams,
  });
  return res.data;
}

export async function fetchLead(id: string | number): Promise<Lead> {
  const res = await apiClient.get<Lead>(API_ENDPOINTS.LEADS.DETAIL(id));
  return res.data;
}

export async function createLead(payload: LeadFormData): Promise<Lead> {
  const res = await apiClient.post<Lead>(API_ENDPOINTS.LEADS.LIST, payload);
  return res.data;
}

export async function updateLead(
  id: string | number,
  payload: Partial<LeadFormData>
): Promise<Lead> {
  const res = await apiClient.patch<Lead>(API_ENDPOINTS.LEADS.DETAIL(id), payload);
  return res.data;
}

export async function updateLeadStage(
  id: string | number,
  pipelineStageId: string | number
): Promise<Lead> {
  const res = await apiClient.patch<Lead>(API_ENDPOINTS.LEADS.DETAIL(id), {
    pipeline_stage_id: pipelineStageId,
  });
  return res.data;
}

export async function addLeadNote(id: string | number, note: string): Promise<void> {
  await apiClient.post(API_ENDPOINTS.LEADS.NOTES(id), { note });
}

