import { z } from "zod";

export const automationConditionSchema = z.object({
  field: z.string().min(1, "Field is required"),
  operator: z.enum(["contains", "equals", "starts_with", "has_tag", "is_empty"]),
  value: z.string(),
});

export const automationActionSchema = z.object({
  type: z.enum([
    "send_message",
    "send_template",
    "assign_agent",
    "add_tag",
    "resolve_conversation",
    "trigger_webhook",
  ]),
  payload: z.record(z.string(), z.unknown()),
});

export const automationRuleSchema = z.object({
  name: z.string().min(3, "Rule name must be at least 3 characters"),
  description: z.string().optional(),
  is_active: z.boolean(),
  trigger_type: z.enum([
    "incoming_message",
    "conversation_created",
    "tag_added",
    "keyword_matched",
    "outside_business_hours",
  ]),
  conditions: z.array(automationConditionSchema),
  actions: z.array(automationActionSchema).min(1, "At least one action is required"),
});

export type AutomationRuleFormData = z.infer<typeof automationRuleSchema>;
