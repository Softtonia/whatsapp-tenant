export type AutomationTriggerType =
  | "incoming_message"
  | "conversation_created"
  | "tag_added"
  | "keyword_matched"
  | "outside_business_hours";

export type AutomationConditionOperator =
  | "contains"
  | "equals"
  | "starts_with"
  | "has_tag"
  | "is_empty";

export type AutomationActionType =
  | "send_message"
  | "send_template"
  | "assign_agent"
  | "add_tag"
  | "resolve_conversation"
  | "trigger_webhook";

export interface AutomationCondition {
  field: string;
  operator: AutomationConditionOperator;
  value: string;
}

export interface AutomationAction {
  type: AutomationActionType;
  payload: Record<string, unknown>;
}

export interface AutomationRule {
  id: number | string;
  tenant_id?: number | string;
  name: string;
  description?: string;
  is_active: boolean;
  trigger_type: AutomationTriggerType;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  executions_count: number;
  last_executed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AutomationExecutionLog {
  id: number | string;
  rule_id: number | string;
  rule_name: string;
  trigger_event: string;
  contact_name: string;
  contact_phone: string;
  status: "success" | "failed";
  execution_ms: number;
  error_message?: string | null;
  executed_at: string;
}

