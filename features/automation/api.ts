import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type { AutomationRule, AutomationExecutionLog } from "@/types/automation";
import type { AutomationRuleFormData } from "./schemas";

export async function fetchAutomationRules(): Promise<AutomationRule[]> {
  const res = await apiClient.get<AutomationRule[]>(API_ENDPOINTS.AUTOMATION.RULES);
  return Array.isArray(res.data) ? res.data : [];
}

export async function createAutomationRule(
  payload: AutomationRuleFormData
): Promise<AutomationRule> {
  const res = await apiClient.post<AutomationRule>(
    API_ENDPOINTS.AUTOMATION.RULES,
    payload
  );
  return res.data;
}

export async function updateAutomationRule(
  id: string | number,
  payload: Partial<AutomationRuleFormData>
): Promise<AutomationRule> {
  const res = await apiClient.put<AutomationRule>(
    API_ENDPOINTS.AUTOMATION.RULE_DETAIL(id),
    payload
  );
  return res.data;
}

export async function toggleAutomationRule(id: string | number): Promise<AutomationRule> {
  const res = await apiClient.post<AutomationRule>(API_ENDPOINTS.AUTOMATION.TOGGLE(id));
  return res.data;
}

export async function deleteAutomationRule(id: string | number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.AUTOMATION.RULE_DETAIL(id));
}

export async function fetchAutomationLogs(): Promise<AutomationExecutionLog[]> {
  const res = await apiClient.get<AutomationExecutionLog[]>(
    API_ENDPOINTS.AUTOMATION.LOGS
  );
  return Array.isArray(res.data) ? res.data : [];
}

