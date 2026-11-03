import { z } from "zod";

export const leadSchema = z.object({
  title: z.string().min(2, "Opportunity title must be at least 2 characters"),
  contact_id: z.union([z.string(), z.number()], {
    error: "Select a linked contact",
  }),
  pipeline_stage_id: z.union([z.string(), z.number()], {
    error: "Select a pipeline stage",
  }),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  value: z.coerce.number().min(0, "Value must be positive").default(0),
  currency: z.string().default("INR"),
  follow_up_at: z.string().optional().nullable(),
  assigned_to: z.union([z.string(), z.number()]).optional().nullable(),
  notes: z.string().optional().or(z.literal("")),
});

export type LeadFormData = z.infer<typeof leadSchema>;

export const leadStageUpdateSchema = z.object({
  pipeline_stage_id: z.union([z.string(), z.number()]),
});

export type LeadStageUpdateData = z.infer<typeof leadStageUpdateSchema>;

