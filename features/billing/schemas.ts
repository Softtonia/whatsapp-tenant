import { z } from "zod";

export const changePlanSchema = z.object({
  plan_id: z.union([z.string(), z.number()]),
  billing_cycle: z.enum(["monthly", "annual"]).default("monthly"),
  effective_timing: z.enum(["immediate", "period_end"]).default("immediate"),
  reason: z.string().optional(),
});

export type ChangePlanFormData = z.infer<typeof changePlanSchema>;

export const cancelSubscriptionSchema = z.object({
  at_period_end: z.boolean().default(true),
  reason: z.string().min(3, "Please provide a brief reason for cancellation"),
});

export type CancelSubscriptionFormData = z.infer<typeof cancelSubscriptionSchema>;

